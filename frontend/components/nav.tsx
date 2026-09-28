/** Shared by the (client) Header and the (server) Footer — kept out of any
 * 'use client' module so server components receive the real values. */
export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Workshops', href: '/workshops' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export function Mark({ color = '#A64A28' }: { color?: string }) {
  return <span aria-hidden className="w-6 h-7 flex-none" style={{ background: color, clipPath: 'polygon(0 0,100% 0,78% 100%,22% 100%)' }} />;
}
