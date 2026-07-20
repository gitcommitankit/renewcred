import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import Logo from '../ui/Logo';

const NAV_LINKS = [
  { href: '/buyers', label: 'Buyers' },
  { href: '/suppliers', label: 'Suppliers' },
  { href: '/climate-and-us', label: 'Climate & Us' },
  { href: '/science', label: 'Science' },
  { href: '/standards', label: 'Standards' },
  { href: '/contact-us', label: 'Contact Us' },
];

const SOCIAL_LINKS = [
  { href: '#', label: 'X (Twitter)', icon: 'X' },
  { href: '#', label: 'LinkedIn', icon: 'in' },
  { href: '#', label: 'Facebook', icon: 'f' },
  { href: '#', label: 'Instagram', icon: '◈' },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Logo className="h-8 w-auto text-white" />
            </Link>
            <p className="text-sm text-warm-gray-400 leading-relaxed mb-5">
              Setting the global standard for climate credibility. Rigorous, transparent, and science-based certification for climate action.
            </p>
            <div className="space-y-2 text-sm text-warm-gray-400">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="shrink-0 mt-0.5 text-warm-gray-500" />
                <span>123 Climate Lane, Green City, GC 10001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-warm-gray-500" />
                <span>contact@renewcred.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-warm-gray-500" />
                <span>+1 (800) RENEWCRED</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              {SOCIAL_LINKS.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-8 h-8 bg-charcoal-800 rounded-lg text-warm-gray-400 hover:text-white hover:bg-brand-red transition-colors text-xs font-bold"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-warm-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Informed</h3>
            <p className="text-sm text-warm-gray-400 leading-relaxed">
              Get the latest updates on climate standards, certification news, and policy changes.
            </p>
            <NewsletterForm />
            <p className="mt-3 text-xs text-warm-gray-500 flex items-center gap-1.5">
              🔒 No spam. Just pure climate intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-warm-gray-500">
            © {new Date().getFullYear()} RenewCred. All rights reserved.
          </p>
          <p className="text-xs text-warm-gray-500">CIN: U12345GJ2024PTC000000</p>
        </div>
      </div>
    </footer>
  );
}
