import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: ["/api/v1/auth(.*)"],
  ignoredRoutes: ["/api/v1/webhook"],
});

export const config = {
  matcher: [
    // Match everything except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always match API and trpc routes
    '/(api|trpc)(.*)',
  ],
};