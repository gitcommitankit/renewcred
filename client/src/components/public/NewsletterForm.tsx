'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // UI-only — no backend connection yet
        if (email) {
          toast.success("Thanks for subscribing! We'll keep you updated.");
          setEmail('');
        }
      }}
      className="flex gap-2 mt-3"
    >
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 min-w-0 px-3 py-2 text-sm bg-charcoal-800 border border-charcoal-700 placeholder-warm-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-red"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors shrink-0"
      >
        Subscribe
      </button>
    </form>
  );
}
