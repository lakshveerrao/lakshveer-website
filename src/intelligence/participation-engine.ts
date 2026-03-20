// ============================================
// PARTICIPATION ENGINE — Universe v6
// Generate role-specific participation paths
// Uses: clusters, active projects, opportunities, signals, patterns
// ============================================

import { nodes } from '../web/data/universe-data';
import { capabilityClusters } from '../web/data/universe-intelligence';
import { activePatterns } from './pattern-engine';
import { opportunityMatches } from './future-engine';
import { getAllSignals } from './signal-engine';

// ============================================
// TYPES
// ============================================

export interface ParticipationPath {
  role: string;
  icon: string;
  whyRelevant: string;
  waysToHelp: string[];
  suggestedActions: string[];
  relatedNodes: string[];
  contactUrl?: string;
}

export type ParticipationRole =
  | 'Engineer'
  | 'Investor'
  | 'School'
  | 'Organizer'
  | 'Sponsor'
  | 'Media'
  | 'Mentor'
  | 'Parent';

// ============================================
// CONTEXT BUILDER
// Gather live data for path generation
// ============================================

interface UniverseContext {
  activeProjects: string[];
  liveProducts: string[];
  topClusters: string[];
  recentSignalCount: number;
  opportunityCount: number;
  patternCount: number;
  totalProjects: number;
  mediaFeatures: string[];
  hackathonCount: number;
}

function buildContext(): UniverseContext {
  const activeProjects = nodes
    .filter(n => (n.type === 'project' || n.type === 'product') && n.status === 'live')
    .map(n => n.label);

  const liveProducts = nodes
    .filter(n => n.type === 'product' && n.status === 'live')
    .map(n => n.label);

  const topClusters = capabilityClusters
    .sort((a, b) => (b.level || 1) - (a.level || 1))
    .slice(0, 3)
    .map(c => c.name);

  const signals = getAllSignals();
  const threeMonths = new Date();
  threeMonths.setMonth(threeMonths.getMonth() - 3);
  const recentSignalCount = signals.filter(s => s.date && new Date(s.date) >= threeMonths).length;

  const mediaFeatures = nodes
    .filter(n => n.type === 'media')
    .map(n => n.label);

  const hackathonCount = nodes
    .filter(n => n.type === 'event' || n.type === 'achievement')
    .length;

  return {
    activeProjects,
    liveProducts,
    topClusters,
    recentSignalCount,
    opportunityCount: opportunityMatches.length,
    patternCount: activePatterns.length,
    totalProjects: nodes.filter(n => n.type === 'project').length,
    mediaFeatures,
    hackathonCount,
  };
}

// ============================================
// PATH GENERATORS — Role-specific logic
// ============================================

function engineerPath(ctx: UniverseContext): ParticipationPath {
  const waysToHelp: string[] = [];
  const suggestedActions: string[] = [];
  const relatedNodes: string[] = [];

  // Based on top clusters
  if (ctx.topClusters.some(c => c.toLowerCase().includes('robot'))) {
    waysToHelp.push('Review robotics builds and suggest architecture improvements');
    suggestedActions.push('Introduce robotics frameworks like ROS2');
    relatedNodes.push('robotics');
  }
  if (ctx.topClusters.some(c => c.toLowerCase().includes('ai') || c.toLowerCase().includes('vision'))) {
    waysToHelp.push('Share computer vision debugging techniques and model optimization tips');
    suggestedActions.push('Collaborate on an open-source CV project');
    relatedNodes.push('computer-vision');
  }

  waysToHelp.push('Share hardware debugging techniques and best practices');
  waysToHelp.push('Introduce open-source communities and contribution workflows');
  suggestedActions.push('Join a build review session for one of the active projects');
  suggestedActions.push('Co-author a tutorial on ChhotaCreator');
  relatedNodes.push('electronics', 'python');

  return {
    role: 'Engineer',
    icon: '⚙️',
    whyRelevant: `Laksh is building hardware + AI systems across ${ctx.topClusters.join(', ')}. ${ctx.totalProjects} projects documented. Engineering mentorship directly accelerates learning velocity.`,
    waysToHelp: waysToHelp.slice(0, 5),
    suggestedActions: suggestedActions.slice(0, 5),
    relatedNodes: [...new Set(relatedNodes)].slice(0, 5),
    contactUrl: '/collaborate',
  };
}

function investorPath(ctx: UniverseContext): ParticipationPath {
  return {
    role: 'Investor',
    icon: '💼',
    whyRelevant: `${ctx.liveProducts.length > 0 ? ctx.liveProducts.join(' and ') + ' are' : 'Products are'} live with 300+ sales, registered trademark, and ₹1L+ in grants — all at age 8. The hardware education market is growing and this is the earliest possible entry point.`,
    waysToHelp: [
      'Provide seed funding for CircuitHeroes expansion into retail and schools',
      'Support ChhotaCreator as a scalable peer-learning platform',
      'Connect to hardware education ecosystem (Arduino, RPi, Bambu Lab)',
      'Introduce to other early-stage hardware founders for peer learning',
    ],
    suggestedActions: [
      'Review CircuitHeroes business model and growth trajectory',
      'Connect with Capt. Venkat for investment conversation',
      'Explore co-investment with Malpani Foundation network',
    ],
    relatedNodes: ['circuitheroes', 'entrepreneurship', 'malpani-grant', 'chhotacreator'],
    contactUrl: 'https://x.com/CaptVenk',
  };
}

function schoolPath(ctx: UniverseContext): ParticipationPath {
  return {
    role: 'School',
    icon: '🏫',
    whyRelevant: `CircuitHeroes is a ready-made electronics curriculum in card-game form. ChhotaCreator has ${ctx.totalProjects} documented project tutorials. The entire portfolio was built by a student — it speaks the right language for STEM education.`,
    waysToHelp: [
      'Pilot CircuitHeroes in your STEM or electronics curriculum',
      'Host a ChhotaCreator workshop for students',
      'Invite Laksh for a student demo or talk',
      'Share feedback on what makes hands-on learning work in your school',
    ],
    suggestedActions: [
      'Order a CircuitHeroes deck for your electronics lab',
      'Schedule a 30-minute virtual workshop via ChhotaCreator',
      'Connect via ChhotaCreator.com for curriculum integration',
    ],
    relatedNodes: ['circuitheroes', 'teaching', 'chhotacreator', 'diy-ebook'],
    contactUrl: 'https://chhotacreator.com',
  };
}

function organizerPath(ctx: UniverseContext): ParticipationPath {
  return {
    role: 'Organizer',
    icon: '🏁',
    whyRelevant: `Laksh has participated in ${ctx.hackathonCount}+ events, won Youngest Innovator, and built MotionX in 24 hours. An 8-year-old building real hardware + AI systems is a story that draws attention and inspires participants.`,
    waysToHelp: [
      'Invite as participant, speaker, or demo presenter at your hackathon',
      'Feature as a case study for young innovation programs',
      'Provide mentorship slots or special tracks for young builders',
    ],
    suggestedActions: [
      'Send event details via X (@CaptVenk)',
      'Feature CircuitHeroes or Drishtikon Yantra in your demo showcase',
      'Consider a "Young Builders" track inspired by this profile',
    ],
    relatedNodes: ['public-speaking', 'motionx', 'drishtikon-yantra'],
    contactUrl: 'https://x.com/CaptVenk',
  };
}

function sponsorPath(ctx: UniverseContext): ParticipationPath {
  return {
    role: 'Sponsor',
    icon: '🤝',
    whyRelevant: `Arduino, Raspberry Pi, Bambu Lab, ESP32 — every piece of hardware gets documented across ${ctx.totalProjects} YouTube videos. Sponsorship is direct product-in-action content reaching a growing audience of young makers.`,
    waysToHelp: [
      'Provide hardware for project builds (documented on YouTube)',
      'Co-brand content on YouTube (@ProjectsByLaksh)',
      'Sponsor a build challenge or series',
      'Support CircuitHeroes with component partnerships',
    ],
    suggestedActions: [
      'Send hardware samples for build documentation',
      'DM @CaptVenk on X with partnership brief',
      'Explore co-branded tutorial series on ChhotaCreator',
    ],
    relatedNodes: ['youtube-channel', '170-projects', 'arduino', 'raspberry-pi'],
    contactUrl: 'https://x.com/CaptVenk',
  };
}

function mediaPath(ctx: UniverseContext): ParticipationPath {
  const features = ctx.mediaFeatures.length > 0
    ? `Previous coverage: ${ctx.mediaFeatures.slice(0, 3).join(', ')}.`
    : '';

  return {
    role: 'Media',
    icon: '📰',
    whyRelevant: `${features} The story has multiple angles: youngest hardware founder, ISRO demo at age 8, AI projects shipping in 2026, 300+ CircuitHeroes decks sold. The best chapters are still ahead.`,
    waysToHelp: [
      'Feature story on the youngest hardware + AI builder in India',
      'Profile piece on CircuitHeroes as a student-built STEM product',
      'Video interview or podcast appearance',
      'Cover the ISRO connection and space systems path',
    ],
    suggestedActions: [
      'Reach out via X (@CaptVenk) for interview scheduling',
      'Visit the Universe page for complete project documentation',
      'Explore the graph to find your story angle',
    ],
    relatedNodes: ['public-speaking', 'isro-demo', 'circuitheroes', 'param-award'],
    contactUrl: 'https://x.com/CaptVenk',
  };
}

function mentorPath(ctx: UniverseContext): ParticipationPath {
  // Surface areas where mentorship would have highest impact
  const mentorAreas: string[] = [];
  if (ctx.topClusters.some(c => c.toLowerCase().includes('robot'))) mentorAreas.push('ROS2 and industrial robotics');
  if (ctx.topClusters.some(c => c.toLowerCase().includes('ai') || c.toLowerCase().includes('vision'))) mentorAreas.push('Edge AI and computer vision deployment');
  mentorAreas.push('PCB design and hardware manufacturing');
  mentorAreas.push('Startup growth and fundraising');

  return {
    role: 'Mentor',
    icon: '🧭',
    whyRelevant: `The universe has 10+ active mentors. Every mentor relationship has produced a project or a next step. ${ctx.patternCount} compound patterns detected — mentorship in the right domain creates disproportionate impact.`,
    waysToHelp: [
      ...mentorAreas.slice(0, 3).map(a => `Domain mentorship in ${a}`),
      'Any 30-minute conversation here creates something real',
    ],
    suggestedActions: [
      'Reach out via X (@CaptVenk) — mention your domain',
      'Pick a node in the graph that matches your expertise',
      'Suggest a project or learning path based on your experience',
    ],
    relatedNodes: ['robotics', 'computer-vision', 'electronics', 'entrepreneurship'],
    contactUrl: 'https://x.com/CaptVenk',
  };
}

function parentPath(ctx: UniverseContext): ParticipationPath {
  return {
    role: 'Parent',
    icon: '👨‍👩‍👧',
    whyRelevant: `This entire universe was built by an 8-year-old with parent support. CircuitHeroes, ChhotaCreator, and ${ctx.totalProjects} projects prove that hands-on learning works. Your child can do this too.`,
    waysToHelp: [
      'Get CircuitHeroes to introduce your child to electronics',
      'Use ChhotaCreator tutorials for guided project builds',
      'Share this universe with your child to show what\'s possible',
      'Connect your child\'s school for STEM curriculum integration',
    ],
    suggestedActions: [
      'Start with CircuitHeroes — the easiest entry point',
      'Watch YouTube tutorials on @ProjectsByLaksh together',
      'Join the ChhotaCreator community for peer learning',
    ],
    relatedNodes: ['circuitheroes', 'chhotacreator', 'teaching', 'youtube-channel'],
    contactUrl: 'https://chhotacreator.com',
  };
}

// ============================================
// MAIN EXPORT
// ============================================

const ROLE_GENERATORS: Record<ParticipationRole, (ctx: UniverseContext) => ParticipationPath> = {
  Engineer: engineerPath,
  Investor: investorPath,
  School: schoolPath,
  Organizer: organizerPath,
  Sponsor: sponsorPath,
  Media: mediaPath,
  Mentor: mentorPath,
  Parent: parentPath,
};

export function generateParticipationPaths(role: ParticipationRole): ParticipationPath {
  const ctx = buildContext();
  const generator = ROLE_GENERATORS[role];
  return generator(ctx);
}

export function getAllRoles(): ParticipationRole[] {
  return ['Engineer', 'Investor', 'School', 'Organizer', 'Sponsor', 'Media', 'Mentor', 'Parent'];
}
