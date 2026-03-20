// ========== DYNAMIC OG IMAGE GENERATION ==========
// Generates OG images on-the-fly using Canvas-like approach with @vercel/og style

import { Hono } from 'hono';

interface Env {
  DB: D1Database;
}

const ogApp = new Hono<{ Bindings: Env }>();

// Helper to create SVG-based OG image (works in Workers without Canvas)
function createOGImageSVG(options: {
  title: string;
  subtitle?: string;
  quote?: string;
  author?: string;
  authorHandle?: string;
  type: 'page' | 'quote' | 'node';
}): string {
  const { title, subtitle, quote, author, authorHandle, type } = options;
  
  const width = 1200;
  const height = 630;
  
  // Escape special characters for SVG
  const escapeXml = (str: string) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  
  // Word wrap helper
  const wrapText = (text: string, maxChars: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxChars) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };
  
  if (type === 'quote' && quote && author) {
    // Quote card design
    const quoteLines = wrapText(quote, 50);
    const quoteLinesHtml = quoteLines.slice(0, 4).map((line, i) => 
      `<tspan x="80" dy="${i === 0 ? 0 : 45}">${escapeXml(line)}</tspan>`
    ).join('');
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#050508"/>
          <stop offset="100%" style="stop-color:#0a0a0f"/>
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Border -->
      <rect x="30" y="30" width="${width - 60}" height="${height - 60}" 
            fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
      
      <!-- Quote mark decoration -->
      <text x="60" y="150" font-family="Georgia, serif" font-size="150" 
            fill="rgba(34, 211, 238, 0.15)" font-weight="bold">"</text>
      
      <!-- Quote text -->
      <text x="80" y="200" font-family="system-ui, -apple-system, sans-serif" 
            font-size="36" fill="#f4f4f5" font-weight="400">
        ${quoteLinesHtml}
      </text>
      
      <!-- Divider -->
      <line x1="80" y1="420" x2="${width - 80}" y2="420" 
            stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      
      <!-- Author -->
      <text x="80" y="480" font-family="system-ui, -apple-system, sans-serif" 
            font-size="28" fill="#f4f4f5" font-weight="600">— ${escapeXml(author)}</text>
      
      ${authorHandle ? `<text x="80" y="520" font-family="system-ui, -apple-system, sans-serif" 
            font-size="20" fill="#a1a1aa">${escapeXml(authorHandle)}</text>` : ''}
      
      <!-- Branding -->
      <text x="${width - 80}" y="480" font-family="system-ui, -apple-system, sans-serif" 
            font-size="20" fill="#22d3ee" text-anchor="end" font-weight="500">lakshveer.com</text>
      <text x="${width - 80}" y="510" font-family="system-ui, -apple-system, sans-serif" 
            font-size="16" fill="#71717a" text-anchor="end">Hardware + AI Builder, Age 8</text>
      
      <!-- Accent line -->
      <rect x="80" y="550" width="60" height="3" fill="#22d3ee"/>
    </svg>`;
  }
  
  // Default page card design
  const titleLines = wrapText(title, 35);
  const titleLinesHtml = titleLines.slice(0, 2).map((line, i) => 
    `<tspan x="80" dy="${i === 0 ? 0 : 60}">${escapeXml(line)}</tspan>`
  ).join('');
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#050508"/>
        <stop offset="100%" style="stop-color:#0a0a0f"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#22d3ee"/>
        <stop offset="100%" style="stop-color:#06b6d4"/>
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="100%" height="100%" fill="url(#bg)"/>
    
    <!-- Border -->
    <rect x="30" y="30" width="${width - 60}" height="${height - 60}" 
          fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
    
    <!-- Accent bar -->
    <rect x="80" y="150" width="6" height="80" fill="url(#accent)"/>
    
    <!-- Title -->
    <text x="110" y="200" font-family="system-ui, -apple-system, sans-serif" 
          font-size="52" fill="#f4f4f5" font-weight="600">
      ${titleLinesHtml}
    </text>
    
    ${subtitle ? `<text x="80" y="320" font-family="system-ui, -apple-system, sans-serif" 
          font-size="28" fill="#a1a1aa">${escapeXml(subtitle)}</text>` : ''}
    
    <!-- Branding bar at bottom -->
    <rect x="0" y="530" width="${width}" height="100" fill="rgba(0,0,0,0.3)"/>
    
    <!-- Logo/Name -->
    <text x="80" y="580" font-family="system-ui, -apple-system, sans-serif" 
          font-size="24" fill="#f4f4f5" font-weight="600">Lakshveer Rao</text>
    <text x="280" y="580" font-family="system-ui, -apple-system, sans-serif" 
          font-size="20" fill="#71717a">(Age 8)</text>
    
    <!-- Tagline -->
    <text x="80" y="610" font-family="system-ui, -apple-system, sans-serif" 
          font-size="18" fill="#22d3ee">Hardware + AI Systems Builder</text>
    
    <!-- URL -->
    <text x="${width - 80}" y="590" font-family="system-ui, -apple-system, sans-serif" 
          font-size="20" fill="#71717a" text-anchor="end">lakshveer.com</text>
  </svg>`;
}

// Convert SVG to PNG using resvg-wasm or return SVG with proper headers
async function svgToPng(svg: string): Promise<Response> {
  // For now, return SVG with image/svg+xml content type
  // Most platforms accept SVG for OG images, but we can add PNG conversion later
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
}

// ========== OG IMAGE ROUTES ==========

// Static page OG images
ogApp.get('/og/:page', async (c) => {
  const page = c.req.param('page');
  
  const pageConfigs: Record<string, { title: string; subtitle: string }> = {
    'universe': { 
      title: "Lakshveer's Learning Universe", 
      subtitle: 'Build to Learn — 170+ projects, skills, and possibilities' 
    },
    'journey': { 
      title: 'The Journey', 
      subtitle: 'From first robot at age 5 to shipping products at age 8' 
    },
    'systems': { 
      title: 'Systems', 
      subtitle: 'Autonomous vehicles, robots, and AI-powered solutions' 
    },
    'impact': { 
      title: 'Impact', 
      subtitle: '170+ projects • 3 products shipped • ₹1.4L+ in grants' 
    },
    'recognition': { 
      title: 'Voices', 
      subtitle: 'What founders and builders say about Lakshveer' 
    },
    'venture': { 
      title: 'Projects by Laksh', 
      subtitle: 'A father-son venture building hardware education products' 
    },
    'collaborate': { 
      title: 'Collaborate', 
      subtitle: 'Partner on hardware projects, workshops, or research' 
    },
    'invite': { 
      title: 'Invite Laksh', 
      subtitle: 'Guest talks, hackathons, and events' 
    },
    'press': { 
      title: 'Press Kit', 
      subtitle: 'Media resources, photos, and key facts' 
    },
    'endorse': { 
      title: 'Endorse Lakshveer', 
      subtitle: 'Add your voice to support his builder journey' 
    },
  };
  
  const config = pageConfigs[page];
  if (!config) {
    return c.notFound();
  }
  
  const svg = createOGImageSVG({
    title: config.title,
    subtitle: config.subtitle,
    type: 'page',
  });
  
  return svgToPng(svg);
});

// Dynamic endorsement OG images
ogApp.get('/og/endorsement/:slug', async (c) => {
  const slug = c.req.param('slug');
  
  // Try to get endorsement from database
  try {
    // First check featured endorsements (hardcoded for now)
    const featuredEndorsements: Record<string, { quote: string; name: string; handle?: string }> = {
      'robu-nilesh-2025': {
        quote: 'Laksh is a remarkable young innovator. At just 7 years old, he demonstrates a deep understanding of electronics and robotics that is rare even in adults.',
        name: 'Nilesh',
        handle: 'Founder, Robu.in',
      },
      'aerolyte-2025': {
        quote: "Don't buy a drone, build one! That's the advice I gave Laksh, and he's taken it to heart with his hands-on approach to learning.",
        name: 'Aerolyte Founder',
        handle: 'Founder, Aerolyte',
      },
    };
    
    const endorsement = featuredEndorsements[slug];
    
    if (endorsement) {
      const svg = createOGImageSVG({
        title: '',
        quote: endorsement.quote,
        author: endorsement.name,
        authorHandle: endorsement.handle,
        type: 'quote',
      });
      
      return svgToPng(svg);
    }
    
    // Check database for public endorsements
    const result = await c.env.DB.prepare(
      `SELECT name, quote, handle, role FROM public_endorsements WHERE id = ? OR name = ? LIMIT 1`
    ).bind(slug, slug.replace(/-/g, ' ')).first();
    
    if (result) {
      const svg = createOGImageSVG({
        title: '',
        quote: result.quote as string,
        author: result.name as string,
        authorHandle: result.handle as string || result.role as string || undefined,
        type: 'quote',
      });
      
      return svgToPng(svg);
    }
    
    // Fallback to generic endorsement card
    const svg = createOGImageSVG({
      title: 'Endorsement',
      subtitle: 'What the community says about Lakshveer',
      type: 'page',
    });
    
    return svgToPng(svg);
    
  } catch (error) {
    console.error('OG endorsement error:', error);
    // Return generic card on error
    const svg = createOGImageSVG({
      title: 'Voices',
      subtitle: 'Community testimonials for Lakshveer Rao',
      type: 'page',
    });
    return svgToPng(svg);
  }
});

// Universe node OG images
ogApp.get('/og/universe/:nodeId', async (c) => {
  const nodeId = c.req.param('nodeId');
  
  // For now, return generic universe card
  // Later we can look up node details from universe data
  const svg = createOGImageSVG({
    title: `${nodeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    subtitle: "Lakshveer's Learning Universe",
    type: 'page',
  });
  
  return svgToPng(svg);
});

export default ogApp;
