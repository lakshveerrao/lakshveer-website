// ========== MAIN WORKER ENTRY POINT ==========
// Handles crawler detection and OG meta injection for social sharing

import api from './index';
import { getOGConfigForPath, generateOGMetaTags, isCrawler } from './og-config';

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const userAgent = request.headers.get('user-agent') || '';
    
    // Handle API routes
    if (path.startsWith('/api')) {
      return api.fetch(request, env, ctx);
    }
    
    // Check if it's a static asset request (has file extension)
    const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(path) && !path.endsWith('.html');
    
    if (isStaticAsset) {
      // Serve static assets directly
      return env.ASSETS.fetch(request);
    }
    
    // For SPA routes, we need to serve index.html
    // Create a request for index.html
    const indexRequest = new Request(new URL('/index.html', url.origin), request);
    
    // For crawlers, inject correct OG tags
    if (isCrawler(userAgent)) {
      return handleCrawlerRequest(indexRequest, env, url, path);
    }
    
    // For regular users, serve index.html (SPA)
    return env.ASSETS.fetch(indexRequest);
  },
};

async function handleCrawlerRequest(
  indexRequest: Request, 
  env: Env, 
  url: URL, 
  path: string
): Promise<Response> {
  try {
    // Get the base HTML from assets (index.html)
    const assetResponse = await env.ASSETS.fetch(indexRequest);
    
    if (!assetResponse.ok) {
      return assetResponse;
    }
    
    const html = await assetResponse.text();
    
    // Get OG config for this path
    const ogConfig = getOGConfigForPath(path);
    const fullUrl = url.toString();
    
    // Generate the new meta tags
    const newMetaTags = generateOGMetaTags(ogConfig, fullUrl);
    
    // Replace the existing meta tags in the HTML
    const modifiedHtml = html
      // Remove existing OG tags
      .replace(/<meta property="og:[^>]*>/g, '')
      .replace(/<meta name="twitter:[^>]*>/g, '')
      .replace(/<meta name="description"[^>]*>/g, '')
      .replace(/<meta name="title"[^>]*>/g, '')
      .replace(/<title>[^<]*<\/title>/g, '')
      // Inject new tags before </head>
      .replace('</head>', `${newMetaTags}\n</head>`);
    
    return new Response(modifiedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Crawler handling error:', error);
    // Fallback to normal asset serving
    return env.ASSETS.fetch(indexRequest);
  }
}
