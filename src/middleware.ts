import { defineMiddleware } from 'astro:middleware';

// The same headers public/_headers sets on prerendered pages, applied to the
// routes that actually run in the worker — /keystatic and /api/keystatic/*.
// Those bypass _headers entirely (it only governs static asset responses),
// and they're the pages where this matters most: /keystatic is the one worth
// protecting from being framed, and nosniff matters there because the
// editor's access-token cookie is deliberately readable by JavaScript.
//
// Prerendered pages also pass through here at build time; the headers are
// simply discarded, which is why public/_headers exists as well.
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
});
