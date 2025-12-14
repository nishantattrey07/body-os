import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    console.log('[Middleware]', { pathname, isLoggedIn, auth: req.auth });

    // Public routes
    const isPublicRoute = pathname === "/login" || pathname === "/register";

    if (!isLoggedIn && !isPublicRoute) {
        console.log('[Middleware] Redirecting to /login');
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isLoggedIn && isPublicRoute) {
        console.log('[Middleware] Redirecting logged-in user to /');
        return NextResponse.redirect(new URL("/", req.url));
    }

    console.log('[Middleware] Allowing request');
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
