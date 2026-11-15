// Static files win before rewrites. This handles only absent fingerprinted assets.
export default function handler(_request,response){
 response.setHeader('Cache-Control','no-store');
 response.setHeader('CDN-Cache-Control','no-store');
 response.setHeader('Vercel-CDN-Cache-Control','no-store');
 response.setHeader('Content-Type','text/plain; charset=utf-8');
 response.setHeader('X-Content-Type-Options','nosniff');
 response.statusCode=404;
 response.end('Asset not found');
}
