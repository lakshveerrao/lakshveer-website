// Lakshveer's Universe v2 - Momentum Intelligence Engine
// Complete data model with timestamps, growth weights, and intelligence

export type NodeType = 
  | 'person' 
  | 'project' 
  | 'skill' 
  | 'technology' 
  | 'event' 
  | 'organization' 
  | 'award' 
  | 'endorsement'
  | 'tool' 
  | 'trip'
  | 'capability'
  | 'potential'
  | 'influence'
  | 'cluster';

export type EdgeType = 
  | 'BUILT_WITH'
  | 'LEARNED_FROM'
  | 'ENABLED_BY'
  | 'PRESENTED_AT'
  | 'WON_AT'
  | 'SUPPORTED_BY'
  | 'ENDORSED_BY'
  | 'EVOLVED_INTO'
  | 'CROSS_POLLINATED'
  | 'CAPABILITY_EXPANSION'
  | 'FUTURE_PATH'
  | 'COMPOUNDS_INTO'
  | 'MENTORED_BY'
  | 'USES'
  | 'UNLOCKS';

export type ClusterType = 
  | 'robotics'
  | 'ai-ml'
  | 'hardware-startup'
  | 'public-speaking'
  | 'maker-education'
  | 'network'
  | 'recognition';

export interface UniverseNode {
  id: string;
  label: string;
  type: NodeType;
  description?: string;
  url?: string;
  
  // Temporal
  timestamp: string; // YYYY-MM format
  year: number;
  
  // Intelligence
  growthWeight: number;     // How much this compounds (1-100)
  impactScore: number;      // Calculated reach/influence (1-100)
  momentum: number;         // Current momentum (calculated)
  
  // Clustering
  cluster?: ClusterType;
  clusters?: ClusterType[]; // Can belong to multiple
  
  // Relationships
  dependencies?: string[];  // Node IDs that enabled this
  unlocks?: string[];       // Node IDs this enables
  
  // Metadata
  status?: 'completed' | 'active' | 'potential';
  reach?: number;           // For people/orgs - follower count
  meta?: Record<string, string | number | boolean>;
}

export interface UniverseEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  weight: number;           // Strength of connection (1-100)
  timestamp?: string;       // When this connection formed
}

export interface CapabilityCluster {
  id: ClusterType;
  label: string;
  description: string;
  color: string;
  icon: string;
  coreSkills: string[];     // Node IDs
  momentum: number;         // Calculated cluster momentum
  growthRate: number;       // Growth velocity
  potentials: string[];     // Unlockable nodes
}

export interface MomentumSpike {
  id: string;
  label: string;
  description: string;
  nodes: string[];          // Involved node IDs
  timestamp: string;
  impactMultiplier: number;
}

export interface GrowthArc {
  skill: string;
  startDate: string;
  milestones: { date: string; event: string; level: number }[];
  currentLevel: number;
  projectedLevel: number;
}

export interface FuturePath {
  id: string;
  label: string;
  description: string;
  requirements: string[];   // Skills/capabilities needed
  probability: number;      // 0-100
  impact: number;           // Potential impact
  timeframe: string;        // "3 months", "1 year"
  enabledBy: string[];      // Current nodes that enable this
}

// ============================================
// CAPABILITY CLUSTERS
// ============================================

export const clusters: CapabilityCluster[] = [
  {
    id: 'robotics',
    label: 'Robotics Hub',
    description: 'Autonomous systems, sensors, motors, navigation',
    color: '#10b981',
    icon: '🤖',
    coreSkills: ['robotics', 'electronics', 'arduino', 'sensors'],
    momentum: 85,
    growthRate: 15,
    potentials: ['poss-ros', 'poss-drone-swarm', 'poss-industrial-robot']
  },
  {
    id: 'ai-ml',
    label: 'AI/ML Hub',
    description: 'Computer vision, machine learning, edge AI',
    color: '#8b5cf6',
    icon: '🧠',
    coreSkills: ['machine-learning', 'computer-vision', 'tensorflow', 'opencv'],
    momentum: 70,
    growthRate: 25,
    potentials: ['poss-nvidia-jetson', 'poss-llm-agent', 'poss-vision-product']
  },
  {
    id: 'hardware-startup',
    label: 'Hardware Startup Hub',
    description: 'Product development, sales, D2C manufacturing',
    color: '#f59e0b',
    icon: '🚀',
    coreSkills: ['entrepreneurship', '3d-printing', 'electronics'],
    momentum: 90,
    growthRate: 20,
    potentials: ['poss-series-product', 'poss-manufacturing', 'poss-retail']
  },
  {
    id: 'public-speaking',
    label: 'Public Speaking Hub',
    description: 'Pitching, panels, demos, storytelling',
    color: '#ec4899',
    icon: '🎤',
    coreSkills: ['public-speaking', 'storytelling'],
    momentum: 75,
    growthRate: 18,
    potentials: ['poss-ted-talk', 'poss-keynote', 'poss-youtube-100k']
  },
  {
    id: 'maker-education',
    label: 'Maker Education Hub',
    description: 'Teaching, workshops, content creation',
    color: '#06b6d4',
    icon: '📚',
    coreSkills: ['teaching', 'content-creation'],
    momentum: 65,
    growthRate: 12,
    potentials: ['poss-online-course', 'poss-school-curriculum', 'poss-book']
  },
  {
    id: 'network',
    label: 'Network Hub',
    description: 'Mentors, supporters, community connections',
    color: '#f97316',
    icon: '🌐',
    coreSkills: [],
    momentum: 80,
    growthRate: 22,
    potentials: ['poss-accelerator', 'poss-vc-funding', 'poss-global-network']
  },
  {
    id: 'recognition',
    label: 'Recognition Hub',
    description: 'Awards, grants, media coverage',
    color: '#fbbf24',
    icon: '🏆',
    coreSkills: [],
    momentum: 85,
    growthRate: 30,
    potentials: ['poss-forbes-30', 'poss-national-award', 'poss-documentary']
  }
];

// ============================================
// NODES - Every piece of the universe
// ============================================

export const nodes: UniverseNode[] = [
  // ========== CORE ==========
  {
    id: 'lakshveer',
    label: 'Lakshveer',
    type: 'person',
    description: '8-year-old Hardware + AI Systems Builder. Building since age 4. Co-founder of Projects by Laksh.',
    timestamp: '2018-01',
    year: 2018,
    growthWeight: 100,
    impactScore: 95,
    momentum: 92,
    status: 'active',
    meta: { age: 8, startedAge: 4, location: 'Hyderabad, India', role: 'Builder' }
  },
  {
    id: 'capt-venkat',
    label: 'Capt. Venkat',
    type: 'person',
    description: 'Father, mentor, and co-founder. The force multiplier behind Lakshveer\'s journey.',
    url: 'https://x.com/CaptVenk',
    timestamp: '2018-01',
    year: 2018,
    growthWeight: 95,
    impactScore: 90,
    momentum: 88,
    reach: 5000,
    cluster: 'network',
    status: 'active',
    meta: { handle: '@CaptVenk', role: 'Father & Co-Founder' }
  },

  // ========== PRODUCTS ==========
  {
    id: 'circuitheroes',
    label: 'CircuitHeroes',
    type: 'project',
    description: 'Circuit-building trading card game. 300+ decks sold. Trademark registered. First shipped product.',
    url: 'https://circuitheroes.com',
    timestamp: '2024-10',
    year: 2024,
    growthWeight: 90,
    impactScore: 85,
    momentum: 88,
    cluster: 'hardware-startup',
    clusters: ['hardware-startup', 'maker-education'],
    status: 'active',
    dependencies: ['electronics', 'entrepreneurship', 'game-design'],
    unlocks: ['poss-series-product', 'poss-retail', 'trademark'],
    meta: { sales: 300, trademark: true, type: 'card-game' }
  },
  {
    id: 'chhotacreator',
    label: 'ChhotaCreator',
    type: 'project',
    description: 'Peer-learning platform for hands-on education. Courses, workshops, community.',
    url: 'https://chhotacreator.com',
    timestamp: '2024-06',
    year: 2024,
    growthWeight: 75,
    impactScore: 70,
    momentum: 72,
    cluster: 'maker-education',
    status: 'active',
    dependencies: ['teaching', 'content-creation', 'entrepreneurship'],
    unlocks: ['poss-online-course', 'poss-school-curriculum']
  },
  {
    id: 'motionx',
    label: 'MotionX',
    type: 'project',
    description: 'Full-body motion-control gaming system. Built in 24 hours at RunTogether Hackathon.',
    url: 'https://motionx.runable.site/',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 80,
    impactScore: 75,
    momentum: 82,
    cluster: 'ai-ml',
    clusters: ['ai-ml', 'robotics'],
    status: 'active',
    dependencies: ['computer-vision', 'mediapipe', 'python', 'gaming'],
    unlocks: ['poss-fitness-game', 'poss-vr-integration'],
    meta: { builtIn: '24 hours', event: 'RunTogether Hackathon' }
  },
  {
    id: 'hardvare',
    label: 'Hardvare',
    type: 'project',
    description: 'Hardware execution platform preventing unsafe wiring and invalid logic states. Safety-first hardware.',
    timestamp: '2025-06',
    year: 2025,
    growthWeight: 70,
    impactScore: 65,
    momentum: 68,
    cluster: 'hardware-startup',
    status: 'active',
    dependencies: ['electronics', 'python', 'safety-systems'],
    unlocks: ['poss-hardware-saas', 'poss-education-tool']
  },
  {
    id: 'diy-ebook',
    label: 'The Kids Book of Creative Ideas',
    type: 'project',
    description: 'DIY projects eBook. 100+ copies sold. First published work.',
    url: 'https://chhotacreator.com',
    timestamp: '2024-09',
    year: 2024,
    growthWeight: 65,
    impactScore: 60,
    momentum: 62,
    cluster: 'maker-education',
    status: 'completed',
    dependencies: ['content-creation', 'teaching', 'electronics'],
    unlocks: ['poss-book', 'poss-online-course'],
    meta: { sales: 100, type: 'ebook' }
  },
  {
    id: 'kyabol',
    label: 'Kyabol',
    type: 'project',
    description: 'AI-powered conversational system. Built at Gemini 3 Hackathon with Cerebral Valley × Google DeepMind.',
    timestamp: '2026-02',
    year: 2026,
    growthWeight: 75,
    impactScore: 70,
    momentum: 78,
    cluster: 'ai-ml',
    status: 'completed',
    dependencies: ['gemini', 'python', 'ai-agents'],
    unlocks: ['poss-llm-agent', 'poss-ai-product'],
    meta: { event: 'Gemini 3 Hackathon' }
  },
  {
    id: 'drishtikon-yantra',
    label: 'Drishtikon Yantra',
    type: 'project',
    description: 'Vision-based assistive device for the visually impaired. Won Special Mention at Param × Vedanta Makeathon.',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 80,
    impactScore: 78,
    momentum: 82,
    cluster: 'ai-ml',
    clusters: ['ai-ml', 'robotics'],
    status: 'completed',
    dependencies: ['computer-vision', 'opencv', 'raspberry-pi', 'accessibility'],
    unlocks: ['poss-assistive-tech', 'poss-social-impact'],
    meta: { award: 'Special Mention', event: 'Param × Vedanta Makeathon' }
  },
  {
    id: 'line-robot',
    label: 'Line-Following Maze Robot',
    type: 'project',
    description: 'Autonomous navigation robot with sensor array for maze solving.',
    timestamp: '2025-11',
    year: 2025,
    growthWeight: 55,
    impactScore: 50,
    momentum: 52,
    cluster: 'robotics',
    status: 'completed',
    dependencies: ['arduino', 'sensors', 'robotics', 'cpp']
  },
  {
    id: 'grant-agent',
    label: 'Autonomous Grant Agent',
    type: 'project',
    description: 'AI agent that sources and files global grants autonomously. Built with OpenClaw.',
    timestamp: '2026-02',
    year: 2026,
    growthWeight: 70,
    impactScore: 65,
    momentum: 72,
    cluster: 'ai-ml',
    status: 'active',
    dependencies: ['ai-agents', 'openai-api', 'automation'],
    unlocks: ['poss-saas-product', 'poss-ai-business']
  },
  {
    id: 'hydration-assistant',
    label: 'Hydration Assistant',
    type: 'project',
    description: 'Smart hydration reminder using Glyph board + sensors. Built at Hardware Hackathon 1.0.',
    timestamp: '2025-07',
    year: 2025,
    growthWeight: 55,
    impactScore: 50,
    momentum: 52,
    cluster: 'robotics',
    clusters: ['robotics', 'hardware-startup'],
    status: 'completed',
    dependencies: ['glyph-board', 'sensors', 'iot'],
    meta: { event: 'Hardware Hackathon 1.0' }
  },
  {
    id: 'obstacle-car',
    label: 'Obstacle Avoiding Car',
    type: 'project',
    description: 'Arduino-based autonomous car with 4 ultrasonic sensors.',
    timestamp: '2025-02',
    year: 2025,
    growthWeight: 50,
    impactScore: 45,
    momentum: 48,
    cluster: 'robotics',
    status: 'completed',
    dependencies: ['arduino', 'ultrasonic-sensors', 'cpp', 'robotics']
  },
  {
    id: 'self-driving-car',
    label: 'Self-Driving Car',
    type: 'project',
    description: 'Built with Witblox kit for autonomous navigation experiments.',
    timestamp: '2023-12',
    year: 2023,
    growthWeight: 45,
    impactScore: 40,
    momentum: 42,
    cluster: 'robotics',
    status: 'completed',
    dependencies: ['witblox', 'sensors', 'basic-electronics']
  },
  {
    id: 'electric-skateboard',
    label: 'Electric Skateboard',
    type: 'project',
    description: 'DC 775 motor powered personal transport. First motorized vehicle build.',
    timestamp: '2024-04',
    year: 2024,
    growthWeight: 45,
    impactScore: 40,
    momentum: 42,
    cluster: 'robotics',
    status: 'completed',
    dependencies: ['dc-motors', 'power-systems', 'mechanical']
  },
  {
    id: 'first-dc-fan',
    label: 'First DC Motor Project',
    type: 'project',
    description: 'The first documented electronics build. Where it all began.',
    timestamp: '2022-08',
    year: 2022,
    growthWeight: 60,
    impactScore: 55,
    momentum: 58,
    cluster: 'robotics',
    status: 'completed',
    dependencies: ['basic-electronics'],
    unlocks: ['electronics', 'robotics', 'arduino'],
    meta: { milestone: true, significance: 'First build' }
  },

  // ========== SKILLS ==========
  {
    id: 'python',
    label: 'Python',
    type: 'skill',
    description: 'Primary programming language for AI/ML, automation, and rapid prototyping.',
    timestamp: '2023-10',
    year: 2023,
    growthWeight: 80,
    impactScore: 85,
    momentum: 85,
    cluster: 'ai-ml',
    clusters: ['ai-ml', 'robotics'],
    status: 'active',
    dependencies: ['first-code'],
    unlocks: ['tensorflow', 'opencv', 'ai-agents', 'automation']
  },
  {
    id: 'cpp',
    label: 'C++',
    type: 'skill',
    description: 'For embedded systems, Arduino, and performance-critical code.',
    timestamp: '2023-06',
    year: 2023,
    growthWeight: 70,
    impactScore: 65,
    momentum: 68,
    cluster: 'robotics',
    status: 'active',
    dependencies: ['arduino'],
    unlocks: ['esp32', 'advanced-robotics']
  },
  {
    id: 'electronics',
    label: 'Electronics',
    type: 'skill',
    description: 'Circuit design, component selection, soldering, sensor integration.',
    timestamp: '2022-08',
    year: 2022,
    growthWeight: 90,
    impactScore: 88,
    momentum: 90,
    cluster: 'robotics',
    clusters: ['robotics', 'hardware-startup'],
    status: 'active',
    dependencies: ['first-dc-fan'],
    unlocks: ['arduino', 'esp32', 'sensors', 'circuitheroes', 'pcb-design']
  },
  {
    id: 'robotics',
    label: 'Robotics',
    type: 'skill',
    description: 'Building autonomous and controlled mechanical systems.',
    timestamp: '2023-03',
    year: 2023,
    growthWeight: 85,
    impactScore: 82,
    momentum: 85,
    cluster: 'robotics',
    status: 'active',
    dependencies: ['electronics', 'arduino', 'mechanical'],
    unlocks: ['line-robot', 'obstacle-car', 'poss-ros']
  },
  {
    id: '3d-printing',
    label: '3D Printing',
    type: 'skill',
    description: 'Creating physical parts with FDM printers. Rapid prototyping capability.',
    timestamp: '2024-01',
    year: 2024,
    growthWeight: 70,
    impactScore: 65,
    momentum: 68,
    cluster: 'hardware-startup',
    clusters: ['hardware-startup', 'robotics'],
    status: 'active',
    dependencies: ['cad-design'],
    unlocks: ['rapid-prototyping', 'custom-parts']
  },
  {
    id: 'computer-vision',
    label: 'Computer Vision',
    type: 'skill',
    description: 'OpenCV, MediaPipe, object detection, tracking, pose estimation.',
    timestamp: '2025-06',
    year: 2025,
    growthWeight: 75,
    impactScore: 72,
    momentum: 78,
    cluster: 'ai-ml',
    status: 'active',
    dependencies: ['python', 'opencv', 'tensorflow'],
    unlocks: ['motionx', 'drishtikon-yantra', 'poss-vision-product']
  },
  {
    id: 'machine-learning',
    label: 'Machine Learning',
    type: 'skill',
    description: 'TensorFlow, PyTorch, TinyML for edge deployment.',
    timestamp: '2025-03',
    year: 2025,
    growthWeight: 70,
    impactScore: 68,
    momentum: 75,
    cluster: 'ai-ml',
    status: 'active',
    dependencies: ['python', 'math'],
    unlocks: ['tensorflow', 'edge-ai', 'poss-nvidia-jetson']
  },
  {
    id: 'public-speaking',
    label: 'Public Speaking',
    type: 'skill',
    description: 'Pitching, panel discussions, live demos, audience engagement.',
    timestamp: '2024-03',
    year: 2024,
    growthWeight: 75,
    impactScore: 78,
    momentum: 80,
    cluster: 'public-speaking',
    status: 'active',
    dependencies: ['confidence', 'projects'],
    unlocks: ['poss-ted-talk', 'poss-keynote', 'media-coverage']
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    type: 'skill',
    description: 'Product thinking, sales, pricing, trademark registration, customer discovery.',
    timestamp: '2024-06',
    year: 2024,
    growthWeight: 85,
    impactScore: 82,
    momentum: 85,
    cluster: 'hardware-startup',
    status: 'active',
    dependencies: ['circuitheroes', 'sales'],
    unlocks: ['poss-series-product', 'poss-funding', 'trademark']
  },
  {
    id: 'teaching',
    label: 'Teaching',
    type: 'skill',
    description: 'Conducting workshops, creating educational content, peer-to-peer learning.',
    timestamp: '2024-06',
    year: 2024,
    growthWeight: 65,
    impactScore: 60,
    momentum: 62,
    cluster: 'maker-education',
    status: 'active',
    dependencies: ['knowledge', 'communication'],
    unlocks: ['chhotacreator', 'diy-ebook', 'poss-online-course']
  },
  {
    id: 'cad-design',
    label: 'CAD Design',
    type: 'skill',
    description: 'Fusion 360 for 3D modeling and mechanical design.',
    timestamp: '2024-02',
    year: 2024,
    growthWeight: 55,
    impactScore: 50,
    momentum: 52,
    cluster: 'hardware-startup',
    status: 'active',
    dependencies: ['spatial-thinking'],
    unlocks: ['3d-printing', 'custom-enclosures']
  },
  {
    id: 'ai-agents',
    label: 'AI Agents',
    type: 'skill',
    description: 'Building autonomous AI systems that take actions.',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 70,
    impactScore: 68,
    momentum: 75,
    cluster: 'ai-ml',
    status: 'active',
    dependencies: ['python', 'openai-api', 'gemini'],
    unlocks: ['grant-agent', 'poss-llm-agent']
  },

  // ========== TOOLS/TECHNOLOGY ==========
  {
    id: 'arduino',
    label: 'Arduino',
    type: 'technology',
    description: 'Microcontroller platform. Gateway to electronics.',
    timestamp: '2023-03',
    year: 2023,
    growthWeight: 75,
    impactScore: 70,
    momentum: 72,
    cluster: 'robotics',
    status: 'active'
  },
  {
    id: 'raspberry-pi',
    label: 'Raspberry Pi',
    type: 'technology',
    description: 'Single-board computer for complex projects.',
    timestamp: '2024-01',
    year: 2024,
    growthWeight: 70,
    impactScore: 68,
    momentum: 70,
    cluster: 'ai-ml',
    clusters: ['ai-ml', 'robotics'],
    status: 'active'
  },
  {
    id: 'esp32',
    label: 'ESP32',
    type: 'technology',
    description: 'WiFi/Bluetooth microcontroller for IoT.',
    timestamp: '2024-06',
    year: 2024,
    growthWeight: 60,
    impactScore: 55,
    momentum: 58,
    cluster: 'robotics',
    status: 'active'
  },
  {
    id: 'tensorflow',
    label: 'TensorFlow',
    type: 'technology',
    description: 'ML framework for model training and deployment.',
    timestamp: '2025-03',
    year: 2025,
    growthWeight: 65,
    impactScore: 62,
    momentum: 68,
    cluster: 'ai-ml',
    status: 'active'
  },
  {
    id: 'opencv',
    label: 'OpenCV',
    type: 'technology',
    description: 'Computer vision library for image processing.',
    timestamp: '2025-06',
    year: 2025,
    growthWeight: 65,
    impactScore: 62,
    momentum: 68,
    cluster: 'ai-ml',
    status: 'active'
  },
  {
    id: 'mediapipe',
    label: 'MediaPipe',
    type: 'technology',
    description: 'ML solutions for pose estimation, hand tracking.',
    timestamp: '2025-09',
    year: 2025,
    growthWeight: 60,
    impactScore: 58,
    momentum: 65,
    cluster: 'ai-ml',
    status: 'active'
  },
  {
    id: 'openai-api',
    label: 'OpenAI API',
    type: 'technology',
    description: 'GPT models for AI applications.',
    timestamp: '2025-06',
    year: 2025,
    growthWeight: 60,
    impactScore: 58,
    momentum: 65,
    cluster: 'ai-ml',
    status: 'active'
  },
  {
    id: 'gemini',
    label: 'Gemini',
    type: 'technology',
    description: 'Google\'s multimodal AI model.',
    timestamp: '2026-02',
    year: 2026,
    growthWeight: 65,
    impactScore: 62,
    momentum: 70,
    cluster: 'ai-ml',
    status: 'active'
  },
  {
    id: 'fusion360',
    label: 'Fusion 360',
    type: 'tool',
    description: 'CAD software for 3D modeling.',
    timestamp: '2024-02',
    year: 2024,
    growthWeight: 50,
    impactScore: 45,
    momentum: 48,
    cluster: 'hardware-startup',
    status: 'active'
  },
  {
    id: 'prusa-printer',
    label: 'Prusa 3D Printer',
    type: 'tool',
    description: 'High-quality FDM 3D printer.',
    timestamp: '2024-06',
    year: 2024,
    growthWeight: 55,
    impactScore: 50,
    momentum: 52,
    cluster: 'hardware-startup',
    status: 'active'
  },
  {
    id: 'bambu-lab',
    label: 'Bambu Lab Printer',
    type: 'tool',
    description: 'Fast, reliable 3D printing.',
    timestamp: '2025-01',
    year: 2025,
    growthWeight: 55,
    impactScore: 50,
    momentum: 52,
    cluster: 'hardware-startup',
    status: 'active'
  },

  // ========== EVENTS ==========
  {
    id: 'gemini-hackathon',
    label: 'Gemini 3 Hackathon',
    type: 'event',
    description: 'Cerebral Valley × Google DeepMind hackathon. Built Kyabol.',
    timestamp: '2026-02',
    year: 2026,
    growthWeight: 70,
    impactScore: 72,
    momentum: 75,
    cluster: 'recognition',
    status: 'completed',
    meta: { location: 'San Francisco', organizer: 'Cerebral Valley' }
  },
  {
    id: 'runtogether-hackathon',
    label: 'RunTogether Hackathon',
    type: 'event',
    description: 'Runable hackathon where MotionX was built in 24 hours.',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 70,
    impactScore: 68,
    momentum: 72,
    cluster: 'recognition',
    status: 'completed',
    meta: { organizer: 'Runable' }
  },
  {
    id: 'param-makeathon',
    label: 'Param × Vedanta Makeathon',
    type: 'event',
    description: 'Won Youngest Innovator & Special Mention for Drishtikon Yantra.',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 80,
    impactScore: 78,
    momentum: 82,
    cluster: 'recognition',
    status: 'completed',
    meta: { award: 'Youngest Innovator & Special Mention' }
  },
  {
    id: 'hardware-hackathon-2',
    label: 'Hardware Hackathon 2.0',
    type: 'event',
    description: 'Lion Circuits hackathon. Top-5 finalist as youngest participant.',
    timestamp: '2025-07',
    year: 2025,
    growthWeight: 65,
    impactScore: 62,
    momentum: 65,
    cluster: 'recognition',
    status: 'completed',
    meta: { organizer: 'Lion Circuits', result: 'Top-5 Finalist' }
  },
  {
    id: 'hardware-hackathon-1',
    label: 'Hardware Hackathon 1.0',
    type: 'event',
    description: 'First Lion Circuits hackathon. Built Hydration Assistant.',
    timestamp: '2025-07',
    year: 2025,
    growthWeight: 60,
    impactScore: 58,
    momentum: 60,
    cluster: 'recognition',
    status: 'completed',
    meta: { organizer: 'Lion Circuits' }
  },
  {
    id: 'the-residency',
    label: 'The Residency Delta-2',
    type: 'event',
    description: 'Startup residency program. Youngest founder ever in the cohort.',
    timestamp: '2025-10',
    year: 2025,
    growthWeight: 80,
    impactScore: 82,
    momentum: 85,
    cluster: 'network',
    clusters: ['network', 'recognition'],
    status: 'completed',
    meta: { location: 'USA', significance: 'Youngest founder' }
  },
  {
    id: 'south-park-commons',
    label: 'South Park Commons Pitch',
    type: 'event',
    description: 'Pitched at SPC Bengaluru to top founders and investors.',
    timestamp: '2025-11',
    year: 2025,
    growthWeight: 65,
    impactScore: 68,
    momentum: 70,
    cluster: 'network',
    status: 'completed',
    meta: { location: 'Bengaluru' }
  },
  {
    id: 'august-fest',
    label: 'August Fest 2025',
    type: 'event',
    description: 'Panel discussion as featured speaker. Official listing at theaugustfest.com/speakers.',
    url: 'https://theaugustfest.com/speakers/',
    timestamp: '2025-08',
    year: 2025,
    growthWeight: 55,
    impactScore: 52,
    momentum: 55,
    cluster: 'public-speaking',
    status: 'completed'
  },
  {
    id: 'isro-demo',
    label: 'Demo to ISRO Chief',
    type: 'event',
    description: 'Demonstrated projects to Shri Somanath ji, Former ISRO Chief.',
    timestamp: '2026-02',
    year: 2026,
    growthWeight: 85,
    impactScore: 88,
    momentum: 90,
    cluster: 'recognition',
    status: 'completed',
    unlocks: ['poss-satellite', 'poss-space-tech'],
    meta: { person: 'Shri Somanath', significance: 'Former ISRO Chief' }
  },
  {
    id: 'iit-hyderabad-workshop',
    label: 'IIT Hyderabad Workshops',
    type: 'event',
    description: 'IoT and Drone workshops at premier engineering institute.',
    timestamp: '2025-06',
    year: 2025,
    growthWeight: 55,
    impactScore: 52,
    momentum: 55,
    cluster: 'maker-education',
    status: 'completed',
    meta: { topics: ['IoT', 'Drones'] }
  },

  // ========== AWARDS/ACHIEVEMENTS ==========
  {
    id: 'malpani-grant',
    label: '₹1L Malpani Grant',
    type: 'award',
    description: '₹1,00,000 grant from Malpani Ventures for hardware projects.',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 85,
    impactScore: 82,
    momentum: 85,
    cluster: 'recognition',
    status: 'completed',
    meta: { amount: 100000, currency: 'INR' }
  },
  {
    id: 'param-award',
    label: 'Youngest Innovator Award',
    type: 'award',
    description: 'Special Mention at Param × Vedanta Makeathon.',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 75,
    impactScore: 72,
    momentum: 75,
    cluster: 'recognition',
    status: 'completed'
  },
  {
    id: 'trademark',
    label: 'Trademark Registered',
    type: 'award',
    description: 'CircuitHeroes trademark officially registered. IP milestone.',
    timestamp: '2025-09',
    year: 2025,
    growthWeight: 70,
    impactScore: 68,
    momentum: 70,
    cluster: 'hardware-startup',
    status: 'completed',
    meta: { type: 'intellectual-property' }
  },
  {
    id: 'hackathon-finalist',
    label: 'Top-5 Hardware Hackathon',
    type: 'award',
    description: 'Top-5 finalist at Hardware Hackathon 2.0 as youngest participant.',
    timestamp: '2025-07',
    year: 2025,
    growthWeight: 60,
    impactScore: 58,
    momentum: 60,
    cluster: 'recognition',
    status: 'completed'
  },
  {
    id: 'residency-youngest',
    label: 'Youngest Founder - Residency',
    type: 'award',
    description: 'Youngest founder ever in The Residency Delta-2 cohort.',
    timestamp: '2025-10',
    year: 2025,
    growthWeight: 75,
    impactScore: 78,
    momentum: 80,
    cluster: 'recognition',
    status: 'completed'
  },
  {
    id: '170-projects',
    label: '170+ Projects Documented',
    type: 'award',
    description: 'Consistent documentation on YouTube. Proof of work.',
    timestamp: '2026-02',
    year: 2026,
    growthWeight: 80,
    impactScore: 75,
    momentum: 78,
    cluster: 'maker-education',
    status: 'active',
    meta: { platform: 'YouTube' }
  },

  // ========== ORGANIZATIONS ==========
  {
    id: 'malpani-ventures',
    label: 'Malpani Ventures',
    type: 'organization',
    description: 'Angel investor and grant provider. Key financial supporter.',
    url: 'https://malpaniventures.com',
    timestamp: '2025-06',
    year: 2025,
    growthWeight: 70,
    impactScore: 75,
    momentum: 75,
    reach: 50000,
    cluster: 'network',
    status: 'active'
  },
  {
    id: 'lion-circuits',
    label: 'Lion Circuits',
    type: 'organization',
    description: 'PCB manufacturing company. Hardware hackathon organizer.',
    url: 'https://lioncircuits.com',
    timestamp: '2025-07',
    year: 2025,
    growthWeight: 60,
    impactScore: 62,
    momentum: 65,
    reach: 20000,
    cluster: 'network',
    status: 'active'
  },
  {
    id: 'param-foundation',
    label: 'Param Foundation',
    type: 'organization',
    description: 'Science and innovation organization. Makeathon organizer.',
    url: 'https://paramfoundation.org',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 55,
    impactScore: 58,
    momentum: 60,
    reach: 15000,
    cluster: 'network',
    status: 'active'
  },
  {
    id: 'ai-grants-india',
    label: 'AI Grants India',
    type: 'organization',
    description: 'Supporting AI builders in India.',
    url: 'https://aigrants.in',
    timestamp: '2025-09',
    year: 2025,
    growthWeight: 50,
    impactScore: 52,
    momentum: 55,
    reach: 10000,
    cluster: 'network',
    status: 'active'
  },
  {
    id: 'runable',
    label: 'Runable',
    type: 'organization',
    description: 'Builder tools and hackathon organizer.',
    url: 'https://runable.com',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 55,
    impactScore: 52,
    momentum: 55,
    reach: 5000,
    cluster: 'network',
    status: 'active'
  },

  // ========== KEY MENTORS ==========
  {
    id: 'aniruddha-malpani',
    label: 'Dr. Aniruddha Malpani',
    type: 'person',
    description: 'Angel investor. Guidance on startup thinking and fundraising.',
    url: 'https://x.com/malpani',
    timestamp: '2025-06',
    year: 2025,
    growthWeight: 65,
    impactScore: 70,
    momentum: 70,
    reach: 100000,
    cluster: 'network',
    status: 'active',
    meta: { handle: '@malpani', domain: 'Angel investing' }
  },
  {
    id: 'murali-srinivasa',
    label: 'Murali Srinivasa',
    type: 'person',
    description: 'PCB design and electronics manufacturing mentor.',
    url: 'https://x.com/MuraliSrinivasa',
    timestamp: '2025-07',
    year: 2025,
    growthWeight: 50,
    impactScore: 52,
    momentum: 55,
    reach: 8000,
    cluster: 'network',
    status: 'active',
    meta: { handle: '@MuraliSrinivasa', domain: 'PCB design' }
  },
  {
    id: 'bhasker-kode',
    label: 'Bhasker Kode',
    type: 'person',
    description: 'AI Grants India founder. Distributed systems expert.',
    url: 'https://x.com/0xBosky',
    timestamp: '2025-09',
    year: 2025,
    growthWeight: 55,
    impactScore: 58,
    momentum: 60,
    reach: 15000,
    cluster: 'network',
    status: 'active',
    meta: { handle: '@0xBosky', domain: 'AI Grants' }
  },
  {
    id: 'ramsri-goutham',
    label: 'Ramsri Goutham',
    type: 'person',
    description: 'AI SaaS builder. Micro scholarship provider.',
    url: 'https://x.com/ramsri_goutham',
    timestamp: '2025-08',
    year: 2025,
    growthWeight: 50,
    impactScore: 52,
    momentum: 55,
    reach: 20000,
    cluster: 'network',
    status: 'active',
    meta: { handle: '@ramsri_goutham', domain: 'AI SaaS' }
  },

  // ========== MEDIA/INFLUENCE ==========
  {
    id: 'beats-in-brief',
    label: 'Beats in Brief Feature',
    type: 'influence',
    description: 'Feature article: "India\'s Youngest Hardware Startup Founder"',
    url: 'https://beatsinbrief.com/2026/01/11/lakshveer-rao-8-year-old-hardware-startup-founder-india/',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 55,
    impactScore: 60,
    momentum: 62,
    reach: 50000,
    cluster: 'recognition',
    status: 'completed'
  },
  {
    id: 'startupnews-feature',
    label: 'StartupNews.fyi Feature',
    type: 'influence',
    description: 'Instagram video feature on young builder.',
    timestamp: '2026-01',
    year: 2026,
    growthWeight: 50,
    impactScore: 55,
    momentum: 58,
    reach: 100000,
    cluster: 'recognition',
    status: 'completed'
  },
  {
    id: 'youtube-channel',
    label: 'YouTube: @ProjectsByLaksh',
    type: 'influence',
    description: '170+ project videos. Primary documentation platform.',
    url: 'https://youtube.com/@ProjectsByLaksh',
    timestamp: '2022-07',
    year: 2022,
    growthWeight: 80,
    impactScore: 75,
    momentum: 78,
    reach: 5000,
    cluster: 'maker-education',
    status: 'active',
    meta: { videos: 170, platform: 'YouTube' }
  },

  // ========== CAPABILITIES (Meta-skills) ==========
  {
    id: 'cap-rapid-prototyping',
    label: 'Rapid Prototyping',
    type: 'capability',
    description: 'Ability to go from idea to working prototype quickly.',
    timestamp: '2024-06',
    year: 2024,
    growthWeight: 75,
    impactScore: 72,
    momentum: 75,
    clusters: ['robotics', 'hardware-startup'],
    status: 'active',
    dependencies: ['3d-printing', 'electronics', 'arduino', 'python']
  },
  {
    id: 'cap-edge-ai',
    label: 'Edge AI Deployment',
    type: 'capability',
    description: 'Running AI models on resource-constrained devices.',
    timestamp: '2025-06',
    year: 2025,
    growthWeight: 70,
    impactScore: 68,
    momentum: 72,
    cluster: 'ai-ml',
    status: 'active',
    dependencies: ['tensorflow', 'raspberry-pi', 'python', 'machine-learning']
  },
  {
    id: 'cap-storytelling',
    label: 'Technical Storytelling',
    type: 'capability',
    description: 'Communicating complex projects to diverse audiences.',
    timestamp: '2024-06',
    year: 2024,
    growthWeight: 70,
    impactScore: 72,
    momentum: 75,
    cluster: 'public-speaking',
    status: 'active',
    dependencies: ['public-speaking', 'youtube-channel', 'projects']
  },
  {
    id: 'cap-hardware-business',
    label: 'Hardware Business',
    type: 'capability',
    description: 'Building and selling physical products.',
    timestamp: '2024-10',
    year: 2024,
    growthWeight: 80,
    impactScore: 78,
    momentum: 82,
    cluster: 'hardware-startup',
    status: 'active',
    dependencies: ['circuitheroes', 'entrepreneurship', 'trademark']
  },

  // ========== FUTURE POTENTIALS ==========
  {
    id: 'poss-ros',
    label: 'ROS (Robot Operating System)',
    type: 'potential',
    description: 'Industry-standard robotics framework. Next level autonomy.',
    timestamp: '2026-06',
    year: 2026,
    growthWeight: 40,
    impactScore: 60,
    momentum: 0,
    cluster: 'robotics',
    status: 'potential',
    dependencies: ['python', 'robotics', 'linux'],
    meta: { timeframe: '6 months', probability: 75 }
  },
  {
    id: 'poss-pcb-design',
    label: 'Custom PCB Design',
    type: 'potential',
    description: 'KiCAD/Altium for professional circuit boards.',
    timestamp: '2026-06',
    year: 2026,
    growthWeight: 45,
    impactScore: 55,
    momentum: 0,
    cluster: 'hardware-startup',
    status: 'potential',
    dependencies: ['electronics', 'cad-design'],
    meta: { timeframe: '6 months', probability: 70 }
  },
  {
    id: 'poss-ted-talk',
    label: 'TEDx Talk',
    type: 'potential',
    description: 'Public speaking milestone. Ready based on current trajectory.',
    timestamp: '2026-12',
    year: 2026,
    growthWeight: 50,
    impactScore: 80,
    momentum: 0,
    cluster: 'public-speaking',
    status: 'potential',
    dependencies: ['public-speaking', 'cap-storytelling'],
    meta: { timeframe: '1 year', probability: 60, reach: 100000 }
  },
  {
    id: 'poss-nvidia-jetson',
    label: 'NVIDIA Jetson Projects',
    type: 'potential',
    description: 'GPU-accelerated edge AI. Next level vision projects.',
    timestamp: '2026-09',
    year: 2026,
    growthWeight: 45,
    impactScore: 65,
    momentum: 0,
    cluster: 'ai-ml',
    status: 'potential',
    dependencies: ['machine-learning', 'computer-vision', 'python'],
    meta: { timeframe: '9 months', probability: 65 }
  },
  {
    id: 'poss-satellite',
    label: 'CubeSat Project',
    type: 'potential',
    description: 'Space tech. Enabled by ISRO connection.',
    timestamp: '2027-06',
    year: 2027,
    growthWeight: 55,
    impactScore: 85,
    momentum: 0,
    cluster: 'robotics',
    status: 'potential',
    dependencies: ['isro-demo', 'electronics', 'robotics'],
    meta: { timeframe: '18 months', probability: 40 }
  },
  {
    id: 'poss-maker-faire',
    label: 'Maker Faire Exhibition',
    type: 'potential',
    description: 'Global maker event. Showcase opportunity.',
    timestamp: '2026-09',
    year: 2026,
    growthWeight: 40,
    impactScore: 70,
    momentum: 0,
    cluster: 'recognition',
    status: 'potential',
    dependencies: ['projects', 'public-speaking'],
    meta: { timeframe: '9 months', probability: 55 }
  },
  {
    id: 'poss-series-product',
    label: 'Product Line Expansion',
    type: 'potential',
    description: 'CircuitHeroes expansion packs or new product line.',
    timestamp: '2026-06',
    year: 2026,
    growthWeight: 50,
    impactScore: 65,
    momentum: 0,
    cluster: 'hardware-startup',
    status: 'potential',
    dependencies: ['circuitheroes', 'entrepreneurship', 'cap-hardware-business'],
    meta: { timeframe: '6 months', probability: 80 }
  },
  {
    id: 'poss-online-course',
    label: 'Online Course Launch',
    type: 'potential',
    description: 'Structured learning program on ChhotaCreator.',
    timestamp: '2026-06',
    year: 2026,
    growthWeight: 45,
    impactScore: 60,
    momentum: 0,
    cluster: 'maker-education',
    status: 'potential',
    dependencies: ['teaching', 'chhotacreator', 'youtube-channel'],
    meta: { timeframe: '6 months', probability: 70 }
  },
  {
    id: 'poss-vc-funding',
    label: 'Seed Funding Round',
    type: 'potential',
    description: 'Institutional funding for hardware venture.',
    timestamp: '2027-01',
    year: 2027,
    growthWeight: 60,
    impactScore: 90,
    momentum: 0,
    cluster: 'hardware-startup',
    status: 'potential',
    dependencies: ['malpani-grant', 'the-residency', 'cap-hardware-business'],
    meta: { timeframe: '12 months', probability: 35 }
  },
  
  // ============================================
  // NEW MEDIA MENTIONS - MARCH 2026 UPDATE
  // ============================================
  
  // MaiT AI Agent Project (if not exists elsewhere)
  {
    id: 'mait-agent',
    label: 'MaiT AI Agent',
    type: 'project',
    description: 'AI agent that controls devices via Telegram messaging app.',
    timestamp: '2025-02',
    year: 2025,
    growthWeight: 80,
    impactScore: 85,
    momentum: 0,
    cluster: 'ai-ml',
    status: 'completed',
    dependencies: ['python', 'telegram-api', 'home-automation'],
    meta: { featured: 'Financial Express' }
  },
  
  // Yugaantar 2025 Event
  {
    id: 'yugaantar-2025',
    label: 'Yugaantar 2025',
    type: 'event',
    description: 'Student-led tech festival at Scaler School of Technology. Participated in demos and competitions.',
    url: 'https://www.jagranjosh.com/articles/yugaantar-2025-student-led-festival-at-sst-blends-technology-competition-and-culture-1800007602-1',
    timestamp: '2025-01',
    year: 2025,
    growthWeight: 70,
    impactScore: 75,
    momentum: 0,
    cluster: 'public-speaking',
    status: 'completed',
    dependencies: ['scaler-school']
  },
  
  // Scaler School Organization
  {
    id: 'scaler-school',
    label: 'Scaler School of Technology',
    type: 'organization',
    description: 'Tech education institution hosting student-led tech festivals.',
    url: 'https://www.scaler.com/',
    timestamp: '2025-01',
    year: 2025,
    growthWeight: 60,
    impactScore: 70,
    momentum: 0,
    cluster: 'network',
    status: 'completed'
  },
  
  // MEDIA COVERAGE NODES
  {
    id: 'media-jagran-josh-yugaantar',
    label: 'Jagran Josh Coverage',
    type: 'endorsement',
    description: 'National education media coverage of Lakshveer at Yugaantar 2025 tech fest.',
    url: 'https://www.jagranjosh.com/articles/yugaantar-2025-student-led-festival-at-sst-blends-technology-competition-and-culture-1800007602-1',
    timestamp: '2025-01',
    year: 2025,
    growthWeight: 60,
    impactScore: 65,
    momentum: 0,
    cluster: 'recognition',
    status: 'completed',
    dependencies: ['yugaantar-2025']
  },
  {
    id: 'media-sharav-medium',
    label: 'Medium: Tech Wunderkind',
    type: 'endorsement',
    description: 'In-depth feature article by Sharav Arora: "Meet India\'s 8-Year-Old Tech Wunderkind".',
    url: 'https://medium.com/@sharavarora80/meet-indias-8-year-old-tech-wunderkind-how-lakshveer-rao-is-redefining-childhood-innovation-9b76c12da34e',
    timestamp: '2025-02',
    year: 2025,
    growthWeight: 70,
    impactScore: 75,
    momentum: 0,
    cluster: 'recognition',
    status: 'completed'
  },
  {
    id: 'media-chekodi-telugu',
    label: 'Chekodi Telugu Feature',
    type: 'endorsement',
    description: 'Regional Telugu media feature on hardware achievements at age 8.',
    url: 'https://chekodi.com/p/meet-lakshveer-rao-just-8-years-age-lo-hardware-s-96384',
    timestamp: '2025-02',
    year: 2025,
    growthWeight: 55,
    impactScore: 60,
    momentum: 0,
    cluster: 'recognition',
    status: 'completed',
    meta: { language: 'Telugu', regional: true }
  },
  {
    id: 'media-fe-scaler-event',
    label: 'Financial Express: Tech Fest',
    type: 'endorsement',
    description: 'Financial Express coverage of Scaler tech fest with massive crowd and Lakshveer\'s participation.',
    url: 'https://www.financialexpress.com/jobs-career/education-scaler-school-of-technology-hosts-student-led-tech-fest-draws-massive-crowd-4114508/',
    timestamp: '2025-01',
    year: 2025,
    growthWeight: 70,
    impactScore: 80,
    momentum: 0,
    cluster: 'recognition',
    status: 'completed',
    dependencies: ['yugaantar-2025'],
    meta: { publication: 'Financial Express', tier: 'national' }
  },
  {
    id: 'media-fe-mait',
    label: 'Financial Express: MaiT Feature',
    type: 'endorsement',
    description: 'Financial Express technology feature: 8-year-old creates AI agent to control devices via Telegram.',
    url: 'https://www.financialexpress.com/life/technology-meet-lakshveer-the-8-year-old-who-created-an-ai-agent-to-control-devices-via-telegram-messaging-4159964/',
    timestamp: '2025-02',
    year: 2025,
    growthWeight: 75,
    impactScore: 85,
    momentum: 0,
    cluster: 'recognition',
    status: 'completed',
    dependencies: ['mait-agent'],
    meta: { publication: 'Financial Express', tier: 'national', category: 'technology' }
  },
  
  // INTERVIEWS & SOCIAL MEDIA
  {
    id: 'interview-sravya-fb',
    label: 'Sravya Interview',
    type: 'event',
    description: 'Video interview with Sravya published on Facebook.',
    url: 'https://www.facebook.com/watch/?v=911725544741111',
    timestamp: '2025-02',
    year: 2025,
    growthWeight: 60,
    impactScore: 65,
    momentum: 0,
    cluster: 'public-speaking',
    status: 'completed',
    meta: { format: 'video', platform: 'Facebook' }
  },
  {
    id: 'event-kids-carnival-hitex',
    label: 'Kids Carnival Hitex',
    type: 'event',
    description: 'Participation and demo at Kids Carnival, Hitex Hyderabad.',
    url: 'https://www.instagram.com/reel/DEHVEtWJkf1/',
    timestamp: '2024-12',
    year: 2024,
    growthWeight: 50,
    impactScore: 55,
    momentum: 0,
    cluster: 'public-speaking',
    status: 'completed',
    meta: { location: 'Hitex Hyderabad', format: 'demo' }
  },
  {
    id: 'endorsement-inav-param',
    label: 'Inav LinkedIn Post',
    type: 'endorsement',
    description: 'LinkedIn recognition post by Inav Amsi (Param Foundation) about meeting Lakshveer at hackathon.',
    url: 'https://www.linkedin.com/posts/inavamsi_met-this-8-year-old-lakshveer-in-our-hackathon-activity-7418284045475659776-zoBR/',
    timestamp: '2024-12',
    year: 2024,
    growthWeight: 65,
    impactScore: 70,
    momentum: 0,
    cluster: 'network',
    status: 'completed',
    dependencies: ['param-makeathon', 'param-foundation']
  },
  
  // AUGUST FEST ADDITIONAL RECOGNITION
  {
    id: 'august-fest-speaker-profile',
    label: 'August Fest Speaker Page',
    type: 'endorsement',
    description: 'Official speaker profile on August Fest 2025 website.',
    url: 'https://theaugustfest.com/speaker/r-lakshveer-rao/',
    timestamp: '2025-08',
    year: 2025,
    growthWeight: 70,
    impactScore: 75,
    momentum: 0,
    cluster: 'recognition',
    status: 'completed',
    dependencies: ['august-fest'],
    meta: { eventType: 'speaker_profile', official: true }
  },
];

// ============================================
// EDGES - All meaningful connections
// ============================================

export const edges: UniverseEdge[] = [
  // Core relationships
  { id: 'e1', source: 'lakshveer', target: 'capt-venkat', type: 'SUPPORTED_BY', label: 'backed by', weight: 100 },
  
  // Projects built
  { id: 'e2', source: 'lakshveer', target: 'circuitheroes', type: 'BUILT_WITH', label: 'created', weight: 90 },
  { id: 'e3', source: 'lakshveer', target: 'chhotacreator', type: 'BUILT_WITH', label: 'created', weight: 80 },
  { id: 'e4', source: 'lakshveer', target: 'motionx', type: 'BUILT_WITH', label: 'built', weight: 75 },
  { id: 'e5', source: 'lakshveer', target: 'hardvare', type: 'BUILT_WITH', label: 'building', weight: 70 },
  { id: 'e6', source: 'lakshveer', target: 'kyabol', type: 'BUILT_WITH', label: 'built', weight: 70 },
  { id: 'e7', source: 'lakshveer', target: 'drishtikon-yantra', type: 'BUILT_WITH', label: 'built', weight: 75 },
  
  // Skills acquired
  { id: 'e10', source: 'python', target: 'lakshveer', type: 'LEARNED_FROM', label: 'learned', weight: 80 },
  { id: 'e11', source: 'electronics', target: 'lakshveer', type: 'LEARNED_FROM', label: 'learned', weight: 85 },
  { id: 'e12', source: 'robotics', target: 'lakshveer', type: 'LEARNED_FROM', label: 'learned', weight: 80 },
  { id: 'e13', source: 'computer-vision', target: 'lakshveer', type: 'LEARNED_FROM', label: 'learning', weight: 70 },
  { id: 'e14', source: 'public-speaking', target: 'lakshveer', type: 'LEARNED_FROM', label: 'practicing', weight: 75 },
  { id: 'e15', source: 'entrepreneurship', target: 'lakshveer', type: 'LEARNED_FROM', label: 'practicing', weight: 80 },
  
  // Project → Technology
  { id: 'e20', source: 'motionx', target: 'mediapipe', type: 'BUILT_WITH', label: 'uses', weight: 75 },
  { id: 'e21', source: 'motionx', target: 'computer-vision', type: 'BUILT_WITH', label: 'uses', weight: 80 },
  { id: 'e22', source: 'motionx', target: 'python', type: 'BUILT_WITH', label: 'uses', weight: 70 },
  { id: 'e23', source: 'kyabol', target: 'gemini', type: 'BUILT_WITH', label: 'powered by', weight: 75 },
  { id: 'e24', source: 'drishtikon-yantra', target: 'opencv', type: 'BUILT_WITH', label: 'uses', weight: 75 },
  { id: 'e25', source: 'drishtikon-yantra', target: 'raspberry-pi', type: 'BUILT_WITH', label: 'runs on', weight: 70 },
  { id: 'e26', source: 'line-robot', target: 'arduino', type: 'BUILT_WITH', label: 'uses', weight: 70 },
  { id: 'e27', source: 'obstacle-car', target: 'arduino', type: 'BUILT_WITH', label: 'uses', weight: 70 },
  { id: 'e28', source: 'circuitheroes', target: 'electronics', type: 'BUILT_WITH', label: 'teaches', weight: 85 },
  { id: 'e29', source: 'grant-agent', target: 'openai-api', type: 'BUILT_WITH', label: 'uses', weight: 70 },
  { id: 'e30', source: 'grant-agent', target: 'ai-agents', type: 'BUILT_WITH', label: 'demonstrates', weight: 75 },
  
  // Events → Projects/Awards
  { id: 'e40', source: 'runtogether-hackathon', target: 'motionx', type: 'ENABLED_BY', label: 'produced', weight: 80 },
  { id: 'e41', source: 'gemini-hackathon', target: 'kyabol', type: 'ENABLED_BY', label: 'produced', weight: 80 },
  { id: 'e42', source: 'param-makeathon', target: 'drishtikon-yantra', type: 'ENABLED_BY', label: 'produced', weight: 85 },
  { id: 'e43', source: 'param-makeathon', target: 'param-award', type: 'WON_AT', label: 'won', weight: 85 },
  { id: 'e44', source: 'hardware-hackathon-1', target: 'hydration-assistant', type: 'ENABLED_BY', label: 'produced', weight: 70 },
  { id: 'e45', source: 'hardware-hackathon-2', target: 'hackathon-finalist', type: 'WON_AT', label: 'achieved', weight: 75 },
  { id: 'e46', source: 'the-residency', target: 'residency-youngest', type: 'WON_AT', label: 'achieved', weight: 80 },
  
  // Organization support
  { id: 'e50', source: 'malpani-ventures', target: 'lakshveer', type: 'SUPPORTED_BY', label: 'funds', weight: 80 },
  { id: 'e51', source: 'malpani-ventures', target: 'malpani-grant', type: 'ENABLED_BY', label: 'provided', weight: 85 },
  { id: 'e52', source: 'lion-circuits', target: 'lakshveer', type: 'SUPPORTED_BY', label: 'supports', weight: 65 },
  { id: 'e53', source: 'lion-circuits', target: 'hardware-hackathon-1', type: 'ENABLED_BY', label: 'organized', weight: 70 },
  { id: 'e54', source: 'lion-circuits', target: 'hardware-hackathon-2', type: 'ENABLED_BY', label: 'organized', weight: 70 },
  { id: 'e55', source: 'param-foundation', target: 'param-makeathon', type: 'ENABLED_BY', label: 'organized', weight: 75 },
  { id: 'e56', source: 'runable', target: 'runtogether-hackathon', type: 'ENABLED_BY', label: 'organized', weight: 70 },
  
  // Mentorship
  { id: 'e60', source: 'aniruddha-malpani', target: 'lakshveer', type: 'MENTORED_BY', label: 'mentors', weight: 70 },
  { id: 'e61', source: 'aniruddha-malpani', target: 'malpani-ventures', type: 'ENABLED_BY', label: 'runs', weight: 65 },
  { id: 'e62', source: 'murali-srinivasa', target: 'lakshveer', type: 'MENTORED_BY', label: 'guides', weight: 55 },
  { id: 'e63', source: 'bhasker-kode', target: 'lakshveer', type: 'MENTORED_BY', label: 'supports', weight: 55 },
  { id: 'e64', source: 'bhasker-kode', target: 'ai-grants-india', type: 'ENABLED_BY', label: 'runs', weight: 60 },
  { id: 'e65', source: 'ramsri-goutham', target: 'lakshveer', type: 'SUPPORTED_BY', label: 'supports', weight: 50 },
  
  // Skill → Technology
  { id: 'e70', source: 'python', target: 'tensorflow', type: 'UNLOCKS', label: 'enables', weight: 70 },
  { id: 'e71', source: 'python', target: 'opencv', type: 'UNLOCKS', label: 'enables', weight: 70 },
  { id: 'e72', source: 'cpp', target: 'arduino', type: 'UNLOCKS', label: 'required for', weight: 75 },
  { id: 'e73', source: 'cpp', target: 'esp32', type: 'UNLOCKS', label: 'required for', weight: 70 },
  { id: 'e74', source: 'machine-learning', target: 'tensorflow', type: 'USES', label: 'uses', weight: 75 },
  { id: 'e75', source: 'computer-vision', target: 'opencv', type: 'USES', label: 'uses', weight: 75 },
  { id: 'e76', source: 'computer-vision', target: 'mediapipe', type: 'USES', label: 'uses', weight: 70 },
  { id: 'e77', source: 'cad-design', target: '3d-printing', type: 'UNLOCKS', label: 'enables', weight: 70 },
  { id: 'e78', source: '3d-printing', target: 'prusa-printer', type: 'USES', label: 'uses', weight: 65 },
  { id: 'e79', source: '3d-printing', target: 'bambu-lab', type: 'USES', label: 'uses', weight: 65 },
  
  // Capability compound
  { id: 'e80', source: 'electronics', target: 'cap-rapid-prototyping', type: 'COMPOUNDS_INTO', label: 'enables', weight: 75 },
  { id: 'e81', source: '3d-printing', target: 'cap-rapid-prototyping', type: 'COMPOUNDS_INTO', label: 'enables', weight: 70 },
  { id: 'e82', source: 'arduino', target: 'cap-rapid-prototyping', type: 'COMPOUNDS_INTO', label: 'enables', weight: 70 },
  { id: 'e83', source: 'tensorflow', target: 'cap-edge-ai', type: 'COMPOUNDS_INTO', label: 'enables', weight: 70 },
  { id: 'e84', source: 'raspberry-pi', target: 'cap-edge-ai', type: 'COMPOUNDS_INTO', label: 'enables', weight: 65 },
  { id: 'e85', source: 'machine-learning', target: 'cap-edge-ai', type: 'COMPOUNDS_INTO', label: 'enables', weight: 75 },
  { id: 'e86', source: 'public-speaking', target: 'cap-storytelling', type: 'COMPOUNDS_INTO', label: 'enables', weight: 75 },
  { id: 'e87', source: 'youtube-channel', target: 'cap-storytelling', type: 'COMPOUNDS_INTO', label: 'enables', weight: 70 },
  { id: 'e88', source: 'circuitheroes', target: 'cap-hardware-business', type: 'COMPOUNDS_INTO', label: 'demonstrates', weight: 85 },
  { id: 'e89', source: 'entrepreneurship', target: 'cap-hardware-business', type: 'COMPOUNDS_INTO', label: 'enables', weight: 80 },
  { id: 'e90', source: 'trademark', target: 'cap-hardware-business', type: 'COMPOUNDS_INTO', label: 'validates', weight: 70 },
  
  // Cross-pollination (interesting combinations)
  { id: 'e100', source: 'electronics', target: 'entrepreneurship', type: 'CROSS_POLLINATED', label: '→ CircuitHeroes', weight: 85 },
  { id: 'e101', source: 'computer-vision', target: 'robotics', type: 'CROSS_POLLINATED', label: '→ Drishtikon', weight: 80 },
  { id: 'e102', source: 'ai-agents', target: 'entrepreneurship', type: 'CROSS_POLLINATED', label: '→ Grant Agent', weight: 70 },
  
  // Evolution chains
  { id: 'e110', source: 'first-dc-fan', target: 'electronics', type: 'EVOLVED_INTO', label: 'sparked', weight: 80 },
  { id: 'e111', source: 'self-driving-car', target: 'obstacle-car', type: 'EVOLVED_INTO', label: 'improved to', weight: 65 },
  { id: 'e112', source: 'obstacle-car', target: 'line-robot', type: 'EVOLVED_INTO', label: 'evolved to', weight: 65 },
  { id: 'e113', source: 'diy-ebook', target: 'chhotacreator', type: 'EVOLVED_INTO', label: 'expanded to', weight: 70 },
  
  // Future paths
  { id: 'e120', source: 'robotics', target: 'poss-ros', type: 'FUTURE_PATH', label: 'unlocks', weight: 60 },
  { id: 'e121', source: 'electronics', target: 'poss-pcb-design', type: 'FUTURE_PATH', label: 'unlocks', weight: 60 },
  { id: 'e122', source: 'public-speaking', target: 'poss-ted-talk', type: 'FUTURE_PATH', label: 'enables', weight: 65 },
  { id: 'e123', source: 'cap-storytelling', target: 'poss-ted-talk', type: 'FUTURE_PATH', label: 'enables', weight: 70 },
  { id: 'e124', source: 'machine-learning', target: 'poss-nvidia-jetson', type: 'FUTURE_PATH', label: 'unlocks', weight: 60 },
  { id: 'e125', source: 'isro-demo', target: 'poss-satellite', type: 'FUTURE_PATH', label: 'opens door', weight: 70 },
  { id: 'e126', source: 'circuitheroes', target: 'poss-series-product', type: 'FUTURE_PATH', label: 'enables', weight: 75 },
  { id: 'e127', source: 'cap-hardware-business', target: 'poss-series-product', type: 'FUTURE_PATH', label: 'enables', weight: 70 },
  { id: 'e128', source: 'teaching', target: 'poss-online-course', type: 'FUTURE_PATH', label: 'enables', weight: 65 },
  { id: 'e129', source: 'cap-hardware-business', target: 'poss-vc-funding', type: 'FUTURE_PATH', label: 'enables', weight: 55 },
  { id: 'e130', source: 'the-residency', target: 'poss-vc-funding', type: 'FUTURE_PATH', label: 'opens door', weight: 60 },
  
  // Media/influence connections
  { id: 'e140', source: 'beats-in-brief', target: 'lakshveer', type: 'ENDORSED_BY', label: 'featured', weight: 60 },
  { id: 'e141', source: 'startupnews-feature', target: 'lakshveer', type: 'ENDORSED_BY', label: 'featured', weight: 55 },
  
  // ============================================
  // NEW MEDIA EDGES - MARCH 2026 UPDATE
  // ============================================
  
  // MaiT project connections
  { id: 'e200', source: 'python', target: 'mait-agent', type: 'BUILT_WITH', label: 'built with', weight: 80 },
  { id: 'e201', source: 'mait-agent', target: 'media-fe-mait', type: 'ENABLED_BY', label: 'featured in', weight: 85 },
  
  // Yugaantar event connections
  { id: 'e202', source: 'scaler-school', target: 'yugaantar-2025', type: 'ENABLED_BY', label: 'hosted', weight: 85 },
  { id: 'e203', source: 'lakshveer', target: 'yugaantar-2025', type: 'PRESENTED_AT', label: 'participated', weight: 75 },
  { id: 'e204', source: 'yugaantar-2025', target: 'media-jagran-josh-yugaantar', type: 'ENABLED_BY', label: 'covered by', weight: 70 },
  { id: 'e205', source: 'yugaantar-2025', target: 'media-fe-scaler-event', type: 'ENABLED_BY', label: 'covered by', weight: 80 },
  
  // Media endorsement connections
  { id: 'e206', source: 'media-sharav-medium', target: 'lakshveer', type: 'ENDORSED_BY', label: 'featured', weight: 75 },
  { id: 'e207', source: 'media-chekodi-telugu', target: 'lakshveer', type: 'ENDORSED_BY', label: 'featured', weight: 65 },
  
  // Interview and social media connections
  { id: 'e208', source: 'interview-sravya-fb', target: 'lakshveer', type: 'PRESENTED_AT', label: 'interviewed', weight: 65 },
  { id: 'e209', source: 'event-kids-carnival-hitex', target: 'lakshveer', type: 'PRESENTED_AT', label: 'participated', weight: 55 },
  { id: 'e210', source: 'endorsement-inav-param', target: 'param-makeathon', type: 'ENDORSED_BY', label: 'recognition from', weight: 70 },
  { id: 'e211', source: 'param-foundation', target: 'endorsement-inav-param', type: 'ENDORSED_BY', label: 'posted by', weight: 65 },
  
  // August Fest connections
  { id: 'e212', source: 'august-fest', target: 'august-fest-speaker-profile', type: 'ENABLED_BY', label: 'official profile', weight: 80 },
];

// ============================================
// MOMENTUM SPIKES - Key compounding moments
// ============================================

export const momentumSpikes: MomentumSpike[] = [
  {
    id: 'spike-1',
    label: 'Hardware Hackathon → Grant Chain',
    description: 'Hardware Hackathon 1.0 → Top-5 Finalist → Malpani Grant in 6 months',
    nodes: ['hardware-hackathon-1', 'hackathon-finalist', 'malpani-grant'],
    timestamp: '2026-01',
    impactMultiplier: 3.5
  },
  {
    id: 'spike-2',
    label: 'The Residency Network Effect',
    description: 'Youngest founder → SPC pitch → International visibility',
    nodes: ['the-residency', 'residency-youngest', 'south-park-commons'],
    timestamp: '2025-11',
    impactMultiplier: 2.8
  },
  {
    id: 'spike-3',
    label: 'CircuitHeroes Business Validation',
    description: '300 sales + Trademark = Real hardware business',
    nodes: ['circuitheroes', 'trademark', 'cap-hardware-business'],
    timestamp: '2025-09',
    impactMultiplier: 2.5
  },
  {
    id: 'spike-4',
    label: 'AI/Vision Capability Explosion',
    description: 'MotionX + Drishtikon + Kyabol in 2 months',
    nodes: ['motionx', 'drishtikon-yantra', 'kyabol'],
    timestamp: '2026-02',
    impactMultiplier: 3.0
  },
  {
    id: 'spike-5',
    label: 'ISRO Connection',
    description: 'Demo to former ISRO chief opens space tech pathway',
    nodes: ['isro-demo', 'poss-satellite'],
    timestamp: '2026-02',
    impactMultiplier: 4.0
  }
];

// ============================================
// GROWTH ARCS - Skill development over time
// ============================================

export const growthArcs: GrowthArc[] = [
  {
    skill: 'electronics',
    startDate: '2022-08',
    milestones: [
      { date: '2022-08', event: 'First DC motor project', level: 10 },
      { date: '2023-06', event: 'Arduino projects', level: 30 },
      { date: '2024-06', event: 'ESP32 & sensors', level: 50 },
      { date: '2025-01', event: 'CircuitHeroes launch', level: 70 },
      { date: '2026-01', event: 'Hackathon builds', level: 85 },
    ],
    currentLevel: 85,
    projectedLevel: 95
  },
  {
    skill: 'computer-vision',
    startDate: '2025-03',
    milestones: [
      { date: '2025-03', event: 'First OpenCV', level: 15 },
      { date: '2025-09', event: 'MediaPipe exploration', level: 35 },
      { date: '2026-01', event: 'MotionX built', level: 55 },
      { date: '2026-01', event: 'Drishtikon Yantra', level: 70 },
    ],
    currentLevel: 70,
    projectedLevel: 90
  },
  {
    skill: 'entrepreneurship',
    startDate: '2024-03',
    milestones: [
      { date: '2024-03', event: 'First pitch', level: 15 },
      { date: '2024-09', event: 'eBook sales', level: 30 },
      { date: '2024-10', event: 'CircuitHeroes launch', level: 50 },
      { date: '2025-09', event: 'Trademark registered', level: 70 },
      { date: '2026-01', event: '₹1L grant', level: 85 },
    ],
    currentLevel: 85,
    projectedLevel: 95
  },
  {
    skill: 'public-speaking',
    startDate: '2024-03',
    milestones: [
      { date: '2024-03', event: 'First pitch', level: 20 },
      { date: '2025-02', event: 'TTOX panel', level: 35 },
      { date: '2025-08', event: 'August Fest', level: 50 },
      { date: '2025-10', event: 'The Residency', level: 65 },
      { date: '2025-11', event: 'SPC pitch', level: 75 },
    ],
    currentLevel: 75,
    projectedLevel: 90
  }
];

// ============================================
// FUTURE PATHS - Strategic next steps
// ============================================

export const futurePaths: FuturePath[] = [
  {
    id: 'path-ros',
    label: 'Learn ROS',
    description: 'Industry-standard robotics framework for advanced autonomy',
    requirements: ['python', 'robotics', 'linux-basics'],
    probability: 75,
    impact: 80,
    timeframe: '6 months',
    enabledBy: ['robotics', 'python', 'line-robot']
  },
  {
    id: 'path-pcb',
    label: 'Custom PCB Design',
    description: 'Move from breadboard to professional circuit boards',
    requirements: ['electronics', 'cad-design'],
    probability: 70,
    impact: 75,
    timeframe: '6 months',
    enabledBy: ['electronics', 'circuitheroes', 'lion-circuits']
  },
  {
    id: 'path-ted',
    label: 'TEDx Talk',
    description: 'Share the "building since age 4" story on global stage',
    requirements: ['public-speaking', 'story'],
    probability: 60,
    impact: 90,
    timeframe: '12 months',
    enabledBy: ['public-speaking', 'cap-storytelling', 'media-coverage']
  },
  {
    id: 'path-product-line',
    label: 'Expand Product Line',
    description: 'CircuitHeroes expansion packs or new hardware product',
    requirements: ['entrepreneurship', 'manufacturing'],
    probability: 80,
    impact: 70,
    timeframe: '6 months',
    enabledBy: ['circuitheroes', 'cap-hardware-business']
  },
  {
    id: 'path-course',
    label: 'Launch Online Course',
    description: 'Structured learning program for young builders',
    requirements: ['teaching', 'content'],
    probability: 70,
    impact: 65,
    timeframe: '6 months',
    enabledBy: ['chhotacreator', 'youtube-channel', 'diy-ebook']
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getNodeById = (id: string): UniverseNode | undefined => 
  nodes.find(n => n.id === id);

export const getEdgesByNode = (nodeId: string): UniverseEdge[] =>
  edges.filter(e => e.source === nodeId || e.target === nodeId);

export const getConnectedNodes = (nodeId: string): { node: UniverseNode; edge: UniverseEdge; direction: 'in' | 'out' }[] => {
  const result: { node: UniverseNode; edge: UniverseEdge; direction: 'in' | 'out' }[] = [];
  
  edges.forEach(edge => {
    if (edge.source === nodeId) {
      const node = getNodeById(edge.target);
      if (node) result.push({ node, edge, direction: 'out' });
    } else if (edge.target === nodeId) {
      const node = getNodeById(edge.source);
      if (node) result.push({ node, edge, direction: 'in' });
    }
  });
  
  return result;
};

export const getClusterNodes = (clusterId: ClusterType): UniverseNode[] =>
  nodes.filter(n => n.cluster === clusterId || n.clusters?.includes(clusterId));

export const getNodesByType = (type: NodeType): UniverseNode[] =>
  nodes.filter(n => n.type === type);

export const calculateOverallMomentum = (): number => {
  const activeNodes = nodes.filter(n => n.status === 'active');
  const totalMomentum = activeNodes.reduce((sum, n) => sum + n.momentum, 0);
  return Math.round(totalMomentum / activeNodes.length);
};

export const calculateTotalReach = (): number => 
  nodes.filter(n => n.reach).reduce((sum, n) => sum + (n.reach || 0), 0);

export const getTimelineNodes = (startYear: number, endYear: number): UniverseNode[] =>
  nodes.filter(n => n.year >= startYear && n.year <= endYear);

export const getStats = () => ({
  totalNodes: nodes.length,
  totalEdges: edges.length,
  clusters: clusters.length,
  momentum: calculateOverallMomentum(),
  reach: calculateTotalReach(),
  potentials: nodes.filter(n => n.type === 'potential').length,
  nodesByType: nodes.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<NodeType, number>),
});
