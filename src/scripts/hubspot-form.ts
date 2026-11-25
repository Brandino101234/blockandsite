import { isHubSpotConfigured, hubspotSubmitUrl } from '../config/hubspot';
import { site } from '../config/site';

/** HubSpot internal property names. These must match HubSpot exactly. */
const FIELDS = ['firstname', 'lastname', 'email', 'phone', 'company', 'website', 'message'] as const;
type FieldName = (typeof FIELDS)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(name: FieldName, raw: string): string | null {
  const value = raw.trim();
  switch (name) {
    case 'firstname':
      return value ? null : 'Enter your first name.';
    case 'lastname':
      return value ? null : 'Enter your last name.';
    case 'company':
      return value ? null : 'Enter your business name.';
    case 'email':
      if (!value) return 'Enter your email address so we can send your review.';
      return EMAIL_RE.test(value) ? null : 'Enter an email address like name@business.com.';
    case 'phone': {
      if (!value) return null;
      const digits = value.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15 ? null : 'Enter a phone number with area code, like 317-555-0123.';
    }
    case 'website': {
      if (!value) return null;
      try {
        const url = new URL(normalizeUrl(value));
        return url.hostname.includes('.') ? null : 'Enter a web address like yourbusiness.com.';
      } catch {
        return 'Enter a web address like yourbusiness.com.';
      }
    }
    case 'message':
      return value.length <= 2000 ? null : 'Keep your message under 2,000 characters.';
  }
}

function normalizeUrl(value: string) {
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function initReviewForm() {
  const form = document.getElementById('review-form') as HTMLFormElement | null;
  if (!form) return;
  const status = form.querySelector<HTMLElement>('.form__status')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('.form__submit')!;
  const label = form.querySelector<HTMLElement>('.form__label')!;
  const success = form.parentElement!.querySelector<HTMLElement>('.form-success')!;
  const successMsg = success.querySelector<HTMLElement>('.form-success__msg')!;
  const defaultLabel = label.textContent ?? 'Request my review';
  let submitting = false;
  let attempted = false;

  const input = (name: FieldName) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;

  function setError(name: FieldName, message: string | null) {
    const el = input(name);
    const err = document.getElementById(`${name}-error`)!;
    if (message) {
      el.setAttribute('aria-invalid', 'true');
      err.textContent = message;
      err.hidden = false;
    } else {
      el.removeAttribute('aria-invalid');
      err.textContent = '';
      err.hidden = true;
    }
  }

  function validateAll() {
    let firstInvalid: FieldName | null = null;
    for (const name of FIELDS) {
      const msg = validate(name, input(name).value);
      setError(name, msg);
      if (msg && !firstInvalid) firstInvalid = name;
    }
    return firstInvalid;
  }

  // Re-check a field as the person fixes it, but only after a first submit attempt or once they leave it.
  for (const name of FIELDS) {
    const el = input(name);
    el.addEventListener('blur', () => {
      if (el.value.trim() || attempted) setError(name, validate(name, el.value));
    });
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') setError(name, validate(name, el.value));
    });
  }

  function showError(html: string) {
    status.innerHTML = html;
    status.hidden = false;
    status.focus();
  }

  function setLoading(on: boolean) {
    submitting = on;
    form!.setAttribute('aria-busy', String(on));
    submitBtn.setAttribute('aria-disabled', String(on));
    label.textContent = on ? 'Sending…' : defaultLabel;
  }

  function showSuccess(firstname: string, email: string) {
    successMsg.textContent = `Thanks, ${firstname}. We’ll look at your site and reply to ${email} ${site.responseTime}.`;
    form!.hidden = true;
    success.hidden = false;
    success.focus();
  }

  const fallback = `email us at <a href="mailto:${site.email}">${site.email}</a>`;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    attempted = true;
    status.hidden = true;

    const firstInvalid = validateAll();
    if (firstInvalid) {
      input(firstInvalid).focus();
      return;
    }

    const values = Object.fromEntries(FIELDS.map((n) => [n, input(n).value.trim()])) as Record<FieldName, string>;
    if (values.website) values.website = normalizeUrl(values.website);

    // Bot filled the hidden trap field: pretend it worked, send nothing.
    const trap = form.elements.namedItem('hp_company_url') as HTMLInputElement;
    if (trap.value) {
      showSuccess(values.firstname, values.email);
      return;
    }

    if (!isHubSpotConfigured) {
      console.warn('[Block and Site] HubSpot is not configured. Set PORTAL_ID and FORM_ID in src/config/hubspot.ts.');
      showError(`<strong>This form isn’t connected yet.</strong> Please ${fallback} and we’ll get back to you.`);
      return;
    }

    const hutk = getCookie('hubspotutk');
    const payload = {
      submittedAt: String(Date.now()),
      fields: FIELDS.filter((n) => values[n] !== '').map((name) => ({ objectTypeId: '0-1', name, value: values[name] })),
      context: {
        pageUri: window.location.href,
        pageName: document.title,
        ...(hutk ? { hutk } : {}),
      },
    };

    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(hubspotSubmitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (res.ok) {
        showSuccess(values.firstname, values.email);
        return;
      }

      // HubSpot returns { errors: [{ message, errorType }] } on 400s.
      const data = await res.json().catch(() => null);
      const errors: { message?: string; errorType?: string }[] = data?.errors ?? [];
      const emailErr = errors.find((e) => e.errorType === 'INVALID_EMAIL' || e.errorType === 'BLOCKED_EMAIL');
      if (emailErr) {
        setError('email', 'HubSpot didn’t accept this email address. Check it for typos, or use a different one.');
        input('email').focus();
        return;
      }
      console.error('[Block and Site] HubSpot submission failed', res.status, errors);
      showError(`<strong>We couldn’t send your request.</strong> Please try again in a moment, or ${fallback}.`);
    } catch (err) {
      console.error('[Block and Site] HubSpot submission error', err);
      const timedOut = (err as Error).name === 'AbortError';
      showError(
        `<strong>${timedOut ? 'The request timed out.' : 'We couldn’t reach our server.'}</strong> Check your connection and try again, or ${fallback}.`,
      );
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  });

}
