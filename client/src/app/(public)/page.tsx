import { redirect } from 'next/navigation';

// Root of the (public) group redirects to /standards
export default function PublicHomePage() {
  redirect('/standards');
}
