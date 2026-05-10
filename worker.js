// Mizaniya — Cloudflare Worker
// Serves static files from the repo with proper caching headers

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve index.html for root
    if (url.pathname === '/' || url.pathname === '') {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
    
    // Serve all other static assets
    try {
      const response = await env.ASSETS.fetch(request);
      
      // Add cache headers — short cache for HTML, longer for JS/CSS
      const newHeaders = new Headers(response.headers);
      if (url.pathname.endsWith('.html')) {
        newHeaders.set('Cache-Control', 'no-cache');
      } else if (url.pathname.match(/\.(js|css)$/)) {
        newHeaders.set('Cache-Control', 'no-cache'); // no cache during dev
      }
      
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    } catch (e) {
      return new Response('Not found', { status: 404 });
    }
  }
};
