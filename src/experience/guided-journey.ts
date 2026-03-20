// ============================================
// GUIDED JOURNEY — Animated story through milestones
// The universe as a narrative, not just a graph
// ============================================

export interface JourneyChapter {
  id: string;
  title: string;
  date: string; // YYYY-MM
  description: string; // 1–2 sentences, conversational
  nodeIds: string[]; // nodes to highlight during this chapter
  emotion: 'curious' | 'breakthrough' | 'building' | 'winning' | 'teaching' | 'expanding';
  stat?: { label: string; value: string }; // optional highlighted number
}

// ============================================
// THE STORY — 10 chapters from 2022 to 2026
// ============================================

export const journeyChapters: JourneyChapter[] = [
  {
    id: 'chapter-origin',
    title: 'The First Spark',
    date: '2022-08',
    description: 'At age 4, Lakshveer connected his first DC motor and made it spin. That was it. He never stopped building.',
    nodeIds: ['first-dc-fan', 'lakshveer', 'capt-venkat'],
    emotion: 'curious',
    stat: { label: 'Age started', value: '4' },
  },
  {
    id: 'chapter-first-builds',
    title: 'Machines Everywhere',
    date: '2023-06',
    description: 'Hovercrafts, drill-powered bicycles, a robotic table, a DIY clothes washer — anything with a motor got built.',
    nodeIds: ['hovercraft', 'drill-bicycle', 'self-driving-car', 'robotic-table'],
    emotion: 'building',
    stat: { label: 'Projects by age 5', value: '20+' },
  },
  {
    id: 'chapter-electronics-mastery',
    title: 'Electronics Takes Over',
    date: '2023-10',
    description: 'Arduino became the new language. C++ followed. Sensors, motors, and microcontrollers started talking to each other.',
    nodeIds: ['electronics', 'arduino', 'cpp', 'python'],
    emotion: 'breakthrough',
    stat: { label: 'Programming languages', value: '2' },
  },
  {
    id: 'chapter-robots',
    title: 'The Robots Arrive',
    date: '2025-02',
    description: 'Line-following robots, obstacle-avoiding cars — autonomous machines that make decisions on their own. Robotics clicked.',
    nodeIds: ['obstacle-car', 'line-robot', 'robotics', 'sensors'],
    emotion: 'building',
    stat: { label: 'Autonomous projects', value: '5+' },
  },
  {
    id: 'chapter-circuitheroes',
    title: 'First Product Shipped',
    date: '2024-10',
    description: 'CircuitHeroes launched — a trading card game that teaches electronics. 300+ decks sold. Trademark registered. At age 6.',
    nodeIds: ['circuitheroes', 'entrepreneurship', 'trademark'],
    emotion: 'winning',
    stat: { label: 'Decks sold', value: '300+' },
  },
  {
    id: 'chapter-teaching',
    title: 'Building for Others',
    date: '2024-06',
    description: 'ChhotaCreator launched as a peer-learning platform. Then came the DIY eBook — 100+ copies. Teaching was becoming a product.',
    nodeIds: ['chhotacreator', 'diy-ebook', 'teaching', 'youtube-channel'],
    emotion: 'teaching',
    stat: { label: 'eBooks sold', value: '100+' },
  },
  {
    id: 'chapter-ai-arrives',
    title: 'AI Enters the Stack',
    date: '2025-06',
    description: 'Computer vision, TensorFlow, MediaPipe — real AI on real hardware. Systems that could see and respond to the world.',
    nodeIds: ['computer-vision', 'opencv', 'mediapipe', 'tensorflow'],
    emotion: 'breakthrough',
    stat: { label: 'AI frameworks learned', value: '4' },
  },
  {
    id: 'chapter-recognition',
    title: 'The World Notices',
    date: '2025-10',
    description: 'Youngest founder in The Residency Delta-2 cohort. South Park Commons pitch. August Fest speaker. Malpani grant. Financial Express. The builder became a story.',
    nodeIds: ['the-residency', 'south-park-commons', 'august-fest', 'malpani-grant', 'beats-in-brief'],
    emotion: 'winning',
    stat: { label: 'Grants received', value: '₹1.4L+' },
  },
  {
    id: 'chapter-ai-systems',
    title: '2026: AI Systems Year',
    date: '2026-01',
    description: 'MotionX. Drishtikon Yantra. Kyabol. Three AI systems in two months. Hardware and AI fully merged. Then a demo to the ISRO chief.',
    nodeIds: ['motionx', 'drishtikon-yantra', 'kyabol', 'isro-demo', 'param-award'],
    emotion: 'expanding',
    stat: { label: 'AI projects in 2026', value: '4' },
  },
  {
    id: 'chapter-future',
    title: 'What Comes Next',
    date: '2026-06',
    description: 'ROS. Custom PCBs. CubeSats. TEDx. A product line. Seed funding. The trajectory is clear — the question is just how fast.',
    nodeIds: ['poss-ros', 'poss-pcb-design', 'poss-satellite', 'poss-ted-talk'],
    emotion: 'curious',
    stat: { label: 'Future paths unlocked', value: '8' },
  },
];

// ============================================
// EMOTION → VISUAL STYLING
// ============================================

export const emotionStyles: Record<JourneyChapter['emotion'], {
  color: string;
  bgColor: string;
  label: string;
  icon: string;
}> = {
  curious: { color: '#22d3ee', bgColor: 'rgba(34,211,238,0.1)', label: 'Curious', icon: '🔭' },
  breakthrough: { color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)', label: 'Breakthrough', icon: '⚡' },
  building: { color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', label: 'Building', icon: '🛠' },
  winning: { color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', label: 'Winning', icon: '🏆' },
  teaching: { color: '#ec4899', bgColor: 'rgba(236,72,153,0.1)', label: 'Teaching', icon: '📚' },
  expanding: { color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', label: 'Expanding', icon: '🚀' },
};

// ============================================
// TIMELINE SUMMARY — key facts per year
// ============================================

export const yearSummaries: Record<number, string> = {
  2022: 'First builds. DC motors, fans, basic circuits. Age 4.',
  2023: '20+ projects. Hovercrafts, drill bikes, robotic table. Self-driving experiments begin.',
  2024: 'CircuitHeroes ships. ChhotaCreator launches. eBook sells 100+ copies. Arduino mastery.',
  2025: 'Autonomous robots. The Residency. South Park Commons. August Fest. ₹1.4L in grants.',
  2026: 'AI systems year. MotionX, Drishtikon Yantra, Kyabol. ISRO demo. What comes next.',
};
