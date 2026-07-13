// export default function Page() {
//   return <h1 className='text-2xl'>Hello, Next.js!</h1>;
// }

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// 💡 RUTE AKAR UTAMA (SERVER-SIDE REDIRECT GUARD)
export default async function Page() {
  // Ambil token dari cookie di level server Next.js 15
  const cookieStore = await cookies();
  const token = cookieStore.get('social_auth_token')?.value;

  if (token) {
    // Jika sesi login aktif, arahkan otomatis masuk ke Home Feed privat
    redirect('/feed');
  } else {
    // Jika posisi guest/logout, arahkan langsung masuk ke halaman Login
    redirect('/login');
  }
}
