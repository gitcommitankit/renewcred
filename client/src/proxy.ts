// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// /**
//  * Next.js 16 Edge Proxy — runs before any page HTML is generated.
//  *
//  * Protects all /admin/* routes (except /admin/login) by checking for the
//  * presence of the `accessToken` HttpOnly cookie set by the Express backend.
//  *
//  * If the cookie is absent the user receives a 307 Temporary Redirect to
//  * /admin/login before a single byte of protected HTML is served — unlike the
//  * previous AdminShell.tsx approach which redirected only after JS hydration.
//  *
//  * NOTE: We only check cookie *presence* here, not JWT validity, because the
//  * Edge runtime cannot import Node.js crypto. Full JWT validation still happens
//  * on the Express server for every authenticated API call via the `authenticate`
//  * middleware.
//  */
// export function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Only guard admin routes that aren't the login page itself.
//   if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
//     const accessToken = req.cookies.get('accessToken');

//     if (!accessToken) {
//       const loginUrl = new URL('/admin/login', req.url);
//       // Preserve the originally requested URL so we can redirect back after login.
//       loginUrl.searchParams.set('from', pathname);
//       return NextResponse.redirect(loginUrl, { status: 307 });
//     }
//   }

//   return NextResponse.next();
// }

// /**
//  * Only run this proxy on admin routes — skip all public, api, and
//  * static file paths to avoid any performance overhead on public pages.
//  */
// export const config = {
//   matcher: ['/admin/:path*'],
// };
