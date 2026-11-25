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
  packages: [
    {
      name: '[PACKAGE 1]',
      price: '[PRICE]',
      blocks: 1,
      summary: '[One-line summary of who Package 1 is for]',
      features: ['[Feature: e.g. number of pages]', '[Feature]', '[Feature]'],
    },
    {
      name: '[PACKAGE 2]',
      price: '[PRICE]',
      blocks: 2,
      summary: '[One-line summary of who Package 2 is for]',
      features: ['[Feature: e.g. number of pages]', '[Feature]', '[Feature]', '[Feature]'],
    },
    {
      name: '[PACKAGE 3]',
      price: '[PRICE]',
      blocks: 3,
      summary: '[One-line summary of who Package 3 is for]',
      features: ['[Feature: e.g. number of pages]', '[Feature]', '[Feature]', '[Feature]', '[Feature]'],
    },
  ],
  carePlan: {
    name: '[CARE PLAN NAME]',
    price: '[PRICE]',
    includes: ['Hosting', 'Updates', 'Fixes'],
  },
  responseTime: '[within X business days]',
} as const;

/** True when a value is still an unfilled [placeholder]. */
export const isPlaceholder = (value: string | null | undefined) => !value || /\[.*\]/.test(value);
