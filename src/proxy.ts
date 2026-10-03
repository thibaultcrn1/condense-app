import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

import { hasLocale, LOCALE_COOKIE, negotiateLocale } from "@/i18n/config";

// Pages for signed-out visitors: signed-in users go to their projects.
const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];
const PROTECTED_PAGES = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const [, first, ...rest] = pathname.split("/");

  // No locale in the URL: send to the remembered or preferred language.
  if (!hasLocale(first)) {
    const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = hasLocale(cookie) ? cookie : negotiateLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  const path = `/${rest.join("/")}`;
  const hasSession = Boolean(getSessionCookie(request));

  if (!hasSession && PROTECTED_PAGES.some((page) => path.startsWith(page))) {
    return NextResponse.redirect(new URL(`/${first}/sign-in`, request.url));
  }
  if (hasSession && AUTH_PAGES.some((page) => path.startsWith(page))) {
    return NextResponse.redirect(new URL(`/${first}/dashboard`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything but API routes, all Next internals (/_next/*, including the
  // dev HMR socket, and /__nextjs_* dev endpoints) and files (robots.txt,
  // sitemap.xml, icons…), which are matched by having an extension.
  matcher: ["/((?!api/|_next/|__nextjs|.*\\..*).*)"],
};
