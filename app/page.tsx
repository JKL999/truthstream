/**
 * Home page - Redirect to debate
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/debate');
}
