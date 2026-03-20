// ========== COMPREHENSIVE OG META CONFIGURATION ==========
// Every page and dynamic entity has custom OG tags

export interface OGMeta {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  type: 'website' | 'article' | 'profile';
  url?: string;
}

const BASE_URL = 'https://lakshveer.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const OG_VERSION = 'v2'; // Cache buster for OG images

// Static page OG configurations
export const PAGE_OG_CONFIG: Record<string, OGMeta> = {
  '/': {
    title: 'Lakshveer Rao | Hardware + AI Systems Builder',
    description: 'Builds to learn. Age 8. Hyderabad, India. Co-Founder of Projects by Laksh, Circuit Heroes, and Chhota Creator.',
    image: `${BASE_URL}/og-image.png`,
    imageAlt: 'Lakshveer Rao - 8-year-old Hardware + AI Systems Builder from Hyderabad, India',
    type: 'website',
  },
  '/universe': {
    title: "Lakshveer's Learning Universe | Build to Learn",
    description: 'Explore 170+ interconnected projects, skills, and possibilities. An interactive knowledge graph showing how curiosity compounds into capabilities.',
    image: `${BASE_URL}/og/universe.png`,
    imageAlt: "Lakshveer's Learning Universe - Interactive knowledge graph of projects, skills, and future paths",
    type: 'website',
  },
  '/journey': {
    title: 'Journey | Lakshveer Rao',
    description: 'From first robot at age 5 to shipping products at age 8. A timeline of builds, workshops, hackathons, and milestones.',
    image: `${BASE_URL}/og/journey.png`,
    imageAlt: "Lakshveer's builder journey timeline - workshops, hackathons, and milestones",
    type: 'website',
  },
  '/systems': {
    title: 'Systems | Lakshveer Rao',
    description: 'Autonomous vehicles, gesture-controlled robots, vision systems, and AI-powered monitoring bots. Hardware + software systems built by an 8-year-old.',
    image: `${BASE_URL}/og/systems.png`,
    imageAlt: 'Hardware and AI systems built by Lakshveer Rao',
    type: 'website',
  },
  '/impact': {
    title: 'Impact | Lakshveer Rao',
    description: '170+ projects, 100+ ebook sales, 3 products shipped, ₹1.4L+ in grants. Real outcomes from an 8-year-old builder.',
    image: `${BASE_URL}/og/impact.png`,
    imageAlt: 'Impact metrics and achievements of Lakshveer Rao',
    type: 'website',
  },
  '/recognition': {
    title: 'Voices | Lakshveer Rao',
    description: 'What founders, companies, and educators say about Lakshveer. Verified testimonials from the builder ecosystem.',
    image: `${BASE_URL}/og/recognition.png`,
    imageAlt: 'Testimonials and recognition for Lakshveer Rao from the tech community',
    type: 'website',
  },
  '/venture': {
    title: 'Projects by Laksh | Venture',
    description: 'A father-son venture building hardware education products. Circuit Heroes, Chhota Creator, and Hardvare.',
    image: `${BASE_URL}/og/venture.png`,
    imageAlt: 'Projects by Laksh - Hardware education venture',
    type: 'website',
  },
  '/collaborate': {
    title: 'Collaborate | Lakshveer Rao',
    description: 'Partner with Lakshveer on hardware projects, workshops, or research. Seeking hardware sponsors, manufacturing access, and mentorship.',
    image: `${BASE_URL}/og/collaborate.png`,
    imageAlt: 'Collaborate with Lakshveer Rao on hardware and AI projects',
    type: 'website',
  },
  '/invite': {
    title: 'Invite Laksh | Guest Talks, Hackathons & Events',
    description: "Invite Lakshveer to speak at your event, school, or hackathon. India's youngest hardware startup founder shares his builder journey.",
    image: `${BASE_URL}/og/invite.png`,
    imageAlt: 'Invite Lakshveer Rao as a speaker at your event',
    type: 'website',
  },
  '/press': {
    title: 'Press Kit | Lakshveer Rao',
    description: 'Media resources, high-resolution photos, bio, and key facts about Lakshveer Rao for press and publications.',
    image: `${BASE_URL}/og/press.png`,
    imageAlt: 'Press kit for Lakshveer Rao - Media resources and photos',
    type: 'website',
  },
  '/share': {
    title: 'Share Portfolio | Lakshveer Rao',
    description: 'Download portfolio PDF, share via QR code, or get printable materials for Lakshveer Rao.',
    image: `${BASE_URL}/og-image.png`,
    imageAlt: 'Share Lakshveer Rao portfolio',
    type: 'website',
  },
  '/endorse': {
    title: 'Endorse Lakshveer | Add Your Voice',
    description: "Share your experience with Lakshveer's work. Your endorsement helps validate his builder journey.",
    image: `${BASE_URL}/og/endorse.png`,
    imageAlt: 'Endorse Lakshveer Rao - Add your testimonial',
    type: 'website',
  },
};

// Get OG config for a path (handles static and dynamic routes)
export function getOGConfigForPath(path: string): OGMeta {
  // Check for exact match first
  if (PAGE_OG_CONFIG[path]) {
    return PAGE_OG_CONFIG[path];
  }
  
  // Handle dynamic routes
  // Universe with node parameter: /universe?node=xyz
  if (path.startsWith('/universe')) {
    return PAGE_OG_CONFIG['/universe'];
  }
  
  // Recognition detail page: /recognition/slug
  if (path.startsWith('/recognition/') && path !== '/recognition') {
    const slug = path.replace('/recognition/', '');
    return {
      title: `Endorsement | Lakshveer Rao`,
      description: 'Read what the community says about Lakshveer Rao.',
      image: `${BASE_URL}/api/og/endorsement/${slug}`,
      imageAlt: 'Endorsement for Lakshveer Rao',
      type: 'article',
    };
  }
  
  // Default fallback
  return PAGE_OG_CONFIG['/'];
}

// Generate HTML meta tags from OG config
export function generateOGMetaTags(config: OGMeta, url: string): string {
  // Add cache buster to image URLs
  const imageUrl = config.image.includes('?') 
    ? `${config.image}&${OG_VERSION}` 
    : `${config.image}?${OG_VERSION}`;
  
  return `
    <!-- Primary Meta Tags -->
    <title>${config.title}</title>
    <meta name="title" content="${config.title}" />
    <meta name="description" content="${config.description}" />
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="${config.type}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${config.title}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:alt" content="${config.imageAlt}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:site_name" content="Projects by Laksh" />
    <meta property="og:locale" content="en_IN" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:domain" content="lakshveer.com" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${config.title}" />
    <meta name="twitter:description" content="${config.description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:src" content="${imageUrl}" />
    <meta name="twitter:site" content="@LakshveerRao" />
    <meta name="twitter:creator" content="@LakshveerRao" />
    
    <!-- LinkedIn -->
    <meta property="article:author" content="https://www.linkedin.com/in/lakshveerrao/" />
  `.trim();
}

// Bot/crawler detection
export function isCrawler(userAgent: string): boolean {
  const crawlerPatterns = [
    'Twitterbot',
    'facebookexternalhit',
    'LinkedInBot',
    'WhatsApp',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Pinterest',
    'Googlebot',
    'bingbot',
    'Baiduspider',
    'YandexBot',
    'DuckDuckBot',
    'Applebot',
    'redditbot',
    'Embedly',
    'Quora Link Preview',
    'outbrain',
    'vkShare',
    'W3C_Validator',
    'Iframely',
  ];
  
  return crawlerPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}
