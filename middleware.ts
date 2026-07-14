import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 💡 Ambil token otentikasi dari cookie browser level server
  const token = request.cookies.get('social_auth_token')?.value;

  // 💡 1. Tentukan rute privat secara eksplisit
  const isPrivateRoute =
    pathname.startsWith('/feed') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/user');

  // 💡 2. JIKA AKSES RUTE PRIVAT TANPA TOKEN -> TENDANG KE LOGIN
  if (isPrivateRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Simpan rute asal agar setelah login sukses, user otomatis dikembalikan ke halaman ini
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 💡 3. JIKA SUDAH LOGIN TAPI COBA AKSES HALAMAN AUTH -> BALIKKAN KE FEED
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return NextResponse.next();
}

// =========================================================================
// 👑 CONFIG MATCHER BARU (STRICT EXPLICIT PATTERNS):
// Mendaftarkan rute-rute utama secara tertulis agar dijamin 100% dicegat oleh server Next.js Middleware!
// =========================================================================
export const config = {
  matcher: [
    '/feed/:path*',
    '/profile/:path*', // 💡 Mengunci otomatis /profile, /profile/tonogw, /profile/lewis, dst.
    '/login',
    '/register',
  ],
};
