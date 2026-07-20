'use client';

import toast from 'react-hot-toast';

export default function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // UI-only — no backend connection yet
        const input = e.currentTarget.querySelector('input') as HTMLInputElement;
        if (input?.value) {
          toast.success('Thanks for subscribing! We\'ll keep you updated.');
          input.value = '';
        }
      }}
      className="flex gap-2 mt-3"
    >
      <input
        type="email"
        placeholder="Your email address"
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
