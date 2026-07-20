'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';

const NAV_LINKS = [
  { href: '/buyers', label: 'Buyers' },
  { href: '/suppliers', label: 'Suppliers' },
  { href: '/climate-and-us', label: 'Climate & Us' },
  { href: '/science', label: 'Science' },
  { href: '/standards', label: 'Standards' },
  { href: '/contact-us', label: 'Contact Us' },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-white shadow-md border-b border-warm-gray-200'
          : 'bg-white border-b border-warm-gray-200',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Logo className="h-8 w-auto text-charcoal-900" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-brand-red font-semibold'
                      : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-warm-gray-100'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/standards"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-brand-red text-white! text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors"
            >
              Registry
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-charcoal-700 hover:text-charcoal-900 hover:bg-warm-gray-100 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-warm-gray-200 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'text-brand-red bg-red-50 font-semibold'
                    : 'text-charcoal-700 hover:bg-warm-gray-100',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-warm-gray-200">
            <Link href="/standards" className="block w-full text-center px-4 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors">
              Registry
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
