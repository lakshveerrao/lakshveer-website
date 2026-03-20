// ============================================
// PARTICIPATION GATEWAY
// How the world can enter Lakshveer's universe
// ============================================

import type { ParticipationRole } from '../core/universe/node-schema';

export const participationRoles: ParticipationRole[] = [
  {
    role: 'investor',
    label: 'Investor',
    icon: '💼',
    whyRelevant: 'CircuitHeroes has 300+ sales, a registered trademark, and ₹1L in grants at age 8. The hardware education market is growing. This is the earliest possible entry point in a builder\'s journey.',
    possibleCollaboration: 'Seed funding for CircuitHeroes expansion, pre-seed for ChhotaCreator, or early-stage hardware venture support.',
    contactPath: 'Reach out via Capt. Venkat on X (@CaptVenk) or through Dr. Malpani\'s network.',
    contactUrl: 'https://x.com/CaptVenk',
  },
  {
    role: 'engineer',
    label: 'Engineer / Builder',
    icon: '⚙️',
    whyRelevant: 'Every project on this page is real, documented, and open for collaboration. If you build in hardware, robotics, or AI — there\'s a shared language here.',
    possibleCollaboration: 'Co-build a robotics project, contribute to Hardvare, or co-author a hardware tutorial for ChhotaCreator.',
    contactPath: 'Reach out directly via X (@projectsbylaksh) or through the collaborate page.',
    contactUrl: '/collaborate',
  },
  {
    role: 'school',
    label: 'School / Educator',
    icon: '🏫',
    whyRelevant: 'CircuitHeroes is a ready-made electronics curriculum in card-game form. ChhotaCreator has structured workshops and video content. The entire portfolio was built by a student — it speaks the right language.',
    possibleCollaboration: 'CircuitHeroes in your STEM curriculum, ChhotaCreator workshops for students, or a visit/demo session.',
    contactPath: 'Connect via ChhotaCreator.com or Capt. Venkat on X.',
    contactUrl: 'https://chhotacreator.com',
  },
  {
    role: 'hackathon_organizer',
    label: 'Hackathon Organizer',
    icon: '🏁',
    whyRelevant: 'Lakshveer has participated in 5+ hackathons, won Youngest Innovator, and built MotionX in 24 hours. He\'s also a draw — an 8-year-old building real systems is a story that gets shared.',
    possibleCollaboration: 'Invite as participant, speaker, or demo presenter at your next hackathon.',
    contactPath: 'Reach out via X (@CaptVenk) with event details.',
    contactUrl: 'https://x.com/CaptVenk',
  },
  {
    role: 'sponsor',
    label: 'Sponsor / Hardware Partner',
    icon: '🤝',
    whyRelevant: 'Arduino, Raspberry Pi, Bambu Lab, ESP32 — every piece of hardware gets documented in 170+ videos. Sponsorship is direct product-in-action content.',
    possibleCollaboration: 'Hardware sponsorship, component partnerships, or co-branded content on YouTube (@ProjectsByLaksh).',
    contactPath: 'DM @CaptVenk on X with partnership brief.',
    contactUrl: 'https://x.com/CaptVenk',
  },
  {
    role: 'media',
    label: 'Media / Journalist',
    icon: '📰',
    whyRelevant: 'Financial Express (2×), Jagran Josh, Medium, Beats in Brief, regional Telugu media — the story has been told but the best chapters are still ahead. ISRO demo, AI projects, youngest founder.',
    possibleCollaboration: 'Feature story, profile piece, video interview, or podcast appearance.',
    contactPath: 'Reach via email through the press page or X (@CaptVenk).',
    contactUrl: '/press',
  },
  {
    role: 'mentor',
    label: 'Mentor / Expert',
    icon: '🧭',
    whyRelevant: 'The universe already has 10+ active mentors in hardware, AI, drones, PCB design, and startup thinking. Every mentor relationship has produced a project or a next step.',
    possibleCollaboration: 'Domain-specific mentorship in ROS, PCB design, computer vision, or space systems. Any 30-minute conversation here creates something real.',
    contactPath: 'Reach via X (@CaptVenk) — mention your domain.',
    contactUrl: 'https://x.com/CaptVenk',
  },
];

// ============================================
// ROLE MATCHING
// Given a visitor's description, return most relevant role
// ============================================

export function matchParticipationRole(keywords: string[]): ParticipationRole | null {
  const lower = keywords.map(k => k.toLowerCase());
  
  if (lower.some(k => ['invest', 'fund', 'capital', 'vc', 'angel'].some(t => k.includes(t)))) {
    return participationRoles.find(r => r.role === 'investor') || null;
  }
  if (lower.some(k => ['engineer', 'build', 'hardware', 'robotics', 'code'].some(t => k.includes(t)))) {
    return participationRoles.find(r => r.role === 'engineer') || null;
  }
  if (lower.some(k => ['school', 'teacher', 'educat', 'curriculum'].some(t => k.includes(t)))) {
    return participationRoles.find(r => r.role === 'school') || null;
  }
  if (lower.some(k => ['hackathon', 'event', 'competition', 'organiz'].some(t => k.includes(t)))) {
    return participationRoles.find(r => r.role === 'hackathon_organizer') || null;
  }
  if (lower.some(k => ['sponsor', 'partner', 'brand', 'product', 'company'].some(t => k.includes(t)))) {
    return participationRoles.find(r => r.role === 'sponsor') || null;
  }
  if (lower.some(k => ['media', 'press', 'journalist', 'write', 'blog', 'podcast'].some(t => k.includes(t)))) {
    return participationRoles.find(r => r.role === 'media') || null;
  }
  if (lower.some(k => ['mentor', 'guide', 'expert', 'advise', 'teach'].some(t => k.includes(t)))) {
    return participationRoles.find(r => r.role === 'mentor') || null;
  }
  return null;
}
