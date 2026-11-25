/**
 * HubSpot settings. Edit ONLY this file to connect the site to HubSpot.
 *
 * Where to find these values (HubSpot):
 * - PORTAL_ID: Settings (gear) > Account Management > Account Defaults > "Account ID" (Hub ID), a number.
 * - FORM_ID:   Marketing > Forms > open your form > the long ID in the page URL
 *              (e.g. .../forms/12345678/editor/1a2b3c4d-....). It is a GUID with dashes.
 * - TRACKING_HOST: Settings > Tracking & Analytics > Tracking Code. Copy the host from the
 *              script src, e.g. "js.hs-scripts.com" or "js-na2.hs-scripts.com".
 */
export const hubspot = {
  PORTAL_ID: '[PASTE]',
  FORM_ID: '[PASTE]',
  TRACKING_HOST: 'js.hs-scripts.com',
  /** Forms API base. EU-hosted HubSpot accounts use "https://api-eu1.hsforms.com". */
  API_BASE: 'https://api.hsforms.com',
} as const;

export const isHubSpotConfigured =
  /^\d+$/.test(hubspot.PORTAL_ID) && /^[0-9a-f-]{36}$/i.test(hubspot.FORM_ID);

export const hubspotSubmitUrl = `${hubspot.API_BASE}/submissions/v3/integration/submit/${hubspot.PORTAL_ID}/${hubspot.FORM_ID}`;

export const hubspotTrackingSrc = `https://${hubspot.TRACKING_HOST}/${hubspot.PORTAL_ID}.js`;
