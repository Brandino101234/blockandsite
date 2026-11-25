import { site } from '../config/site';

/** Astro's base path without a trailing slash: "" at a domain root, "/blockandsite" on GitHub Pages. */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a site-relative path ("/privacy", "/#contact") with the base path. */
export const withBase = (path: string) => `${base}${path.startsWith('/') ? path : `/${path}`}`;

/** Full absolute URL for a site-relative path, for SEO tags and schema. */
export const absoluteUrl = (path: string) => new URL(withBase(path), site.url).href;
