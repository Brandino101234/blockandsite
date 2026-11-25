/**
 * Business details used across the site, SEO tags, and LocalBusiness schema.
 * Anything in [brackets] is unconfirmed and must be replaced before launch.
 * Never put invented facts, reviews, or client results here (see CLAUDE.md).
 */
export const site = {
  name: 'Block and Site',
  // [DOMAIN] Replace with the real domain (also update public/robots.txt).
  // ".example" is a reserved placeholder TLD so nothing points at a real site by accident.
  url: 'https://blockandsite.example',
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
  founders: [
    { name: 'Brendan Nussenblatt', initials: 'BN', role: 'Co-founder', bio: '[Bio: 2–3 sentences about Brendan]', photo: null as string | null },
    { name: 'Tarun Bhamidipati', initials: 'TB', role: 'Co-founder', bio: '[Bio: 2–3 sentences about Tarun]', photo: null as string | null },
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
