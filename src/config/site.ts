/**
 * Business details used across the site, SEO tags, and LocalBusiness schema.
 * Anything in [brackets] is unconfirmed and must be replaced before launch.
 * Never put invented facts, reviews, or client results here (see CLAUDE.md).
 */
export const site = {
  name: 'Block and Site',
  // Hosted on GitHub Pages for now. When a custom domain is set up ([DOMAIN]):
  // set url to it, set basePath to '', and update public/robots.txt.
  url: 'https://brandino101234.github.io',
  basePath: '/blockandsite',
  email: 'blockandsite@gmail.com',
  phone: '[PHONE]', // optional; leave in brackets to hide it everywhere
  mailingAddress: {
    street: '[STREET ADDRESS]',
    city: '[CITY]',
    region: 'IN',
    postalCode: '[ZIP]',
  },
  areaServed: ['Carmel, Indiana', 'Fishers, Indiana'],
  description:
    'Block and Site redesigns websites for local small businesses in Carmel and Fishers, Indiana: fast, mobile-first sites built to get calls and bookings.',
  // photo: a file name in src/assets/founders/ (resized and converted to WebP at build), or null for the initials placeholder.
  founders: [
    { name: 'Brendan Nussenblatt', initials: 'BN', role: 'Co-founder', bio: 'Brendan designs and builds every Block and Site website, with a focus on UI/UX: making sure a site is easy to use on a phone and makes it obvious how to call or book.', photo: 'brendan.jpg' as string | null },
    { name: 'Tarun Bhamidipati', initials: 'TB', role: 'Co-founder', bio: 'Tarun leads client relationships, from the first discovery call through launch, and makes sure every project stays on schedule and the site does what the business needs.', photo: 'tarun.jpg' as string | null },
  ],
  // Package details. Change them here; the cards and the comparison table both read from this.
  packages: [
    {
      name: 'Foundation',
      price: '$500',
      blocks: 1,
      summary: 'A short, focused site with everything a customer needs to find you and call. Best if you mainly need a site people can trust and a number they can tap.',
      features: [
        'Up to 3 pages, such as Home, Services, and Contact',
        'Tap-to-call button and a contact form that emails you',
        'Photo section showing your work or storefront',
        'Google basics: page title, description, and business info set up for search',
        '1 round of revisions',
      ],
    },
    {
      name: 'Build',
      price: '$1,000',
      blocks: 2,
      summary: 'A full site with a page for each part of your business, so customers can look around before they reach out. Adds a quote form and local search setup.',
      features: [
        'Up to 5 pages, such as Home, Services, About, Gallery, and Contact',
        'Everything in Foundation',
        'Quote-request form with the fields you need',
        'Local search setup: each page targets your services and city, and the site is submitted to Google',
        '2 rounds of revisions',
      ],
    },
    {
      name: 'Full Build',
      price: '$1,750',
      blocks: 3,
      summary: 'Everything in Build, plus online booking, a showcase of your work, and 3D animations that make your site stand out. Best if customers schedule appointments or you offer many services.',
      features: [
        'Up to 10 pages, including a page for each main service',
        'Everything in Build',
        'Online booking: we connect the scheduling tool you use, or help you pick one',
        'Photo gallery or before-and-after showcase',
        '3D animations that make your site stand out',
        'Visitor analytics, so you can see how people find you',
        '3 rounds of revisions',
      ],
    },
  ],
  /** Side-by-side comparison. Each value: true (included), false (not included), or text. Order matches packages. */
  comparison: [
    { feature: 'Pages', values: ['Up to 3', 'Up to 5', 'Up to 10'] },
    { feature: 'Mobile-first, fast design', values: [true, true, true] },
    { feature: 'Tap-to-call and contact form', values: [true, true, true] },
    { feature: 'Photo section', values: [true, true, true] },
    { feature: 'Google basics', values: [true, true, true] },
    { feature: 'Quote-request form', values: [false, true, true] },
    { feature: 'Local search setup', values: [false, true, true] },
    { feature: 'A page for each service', values: [false, false, true] },
    { feature: 'Online booking', values: [false, false, true] },
    { feature: 'Gallery or before-and-after', values: [false, false, true] },
    { feature: '3D animations', values: [false, false, true] },
    { feature: 'Visitor analytics', values: [false, false, true] },
    { feature: 'Revision rounds', values: ['1', '2', '3'] },
  ],
  carePlan: {
    name: 'Care Plan',
    price: '$39',
    includes: ['Hosting', 'Updates', 'Fixes'],
  },
  responseTime: '[within X business days]',
} as const;

/** True when a value is still an unfilled [placeholder]. */
export const isPlaceholder = (value: string | null | undefined) => !value || /\[.*\]/.test(value);
