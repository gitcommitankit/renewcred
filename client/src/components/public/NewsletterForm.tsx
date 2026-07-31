'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
      className="flex gap-2 mt-3 items-center"
    >
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        wrapperClassName="flex-1 min-w-0"
        className="bg-charcoal-800 border-charcoal-700 text-white focus:ring-brand-red"
      />
      <Button type="submit" variant="primary" size="md" className="shrink-0">
        Subscribe
      </Button>
    </form>
  );
}
