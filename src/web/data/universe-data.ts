// Lakshveer's Universe - Complete Knowledge Graph Data
// Every node is real, every edge is meaningful

export type NodeType = 
  | 'core' 
  | 'product' 
  | 'project' 
  | 'skill' 
  | 'tool' 
  | 'person' 
  | 'company' 
  | 'event' 
  | 'media' 
  | 'achievement'
  | 'possibility'
  | 'concept';

export interface UniverseNode {
  id: string;
  label: string;
  type: NodeType;
  description?: string;
  url?: string;
  year?: number;
  reach?: number; // For people/companies - potential reach/influence
  status?: 'live' | 'building' | 'completed' | 'potential';
  weight?: number; // Importance (affects size)
  meta?: Record<string, string | number>;
}

export interface UniverseEdge {
  source: string;
  target: string;
  relation: string;
  weight?: number;
}

// ============================================
// NODES - Every piece of Lakshveer's universe
// ============================================

export const nodes: UniverseNode[] = [
  // ========== CORE ==========
  {
    id: 'lakshveer',
    label: 'Lakshveer',
    type: 'core',
    description: '8-year-old Hardware + AI Systems Builder from Hyderabad. Building since age 4.',
    weight: 100,
    meta: { age: 8, startedAge: 4, location: 'Hyderabad, India' }
  },
  {
    id: 'capt-venkat',
    label: 'Capt. Venkat',
    type: 'person',
    description: 'Father & Co-Founder. The backbone of Lakshveer\'s journey.',
    url: 'https://x.com/CaptVenk',
    weight: 90,
    reach: 5000,
    meta: { role: 'Father & Co-Founder', handle: '@CaptVenk' }
  },

  // ========== PRODUCTS (Live) ==========
  {
    id: 'circuitheroes',
    label: 'CircuitHeroes',
    type: 'product',
    description: 'Circuit-building trading card game. 300+ decks sold. Trademark registered.',
    url: 'https://circuitheroes.com',
    status: 'live',
    weight: 85,
    meta: { sales: '300+', trademark: true }
  },
  {
    id: 'chhotacreator',
    label: 'ChhotaCreator',
    type: 'product',
    description: 'Peer-learning platform for hands-on learning.',
    url: 'https://chhotacreator.com',
    status: 'live',
    weight: 75
  },
  {
    id: 'motionx',
    label: 'MotionX',
    type: 'product',
    description: 'Full-body motion-control gaming system. Built at RunTogether Hackathon.',
    url: 'https://motionx.runable.site/',
    status: 'live',
    weight: 70,
    year: 2026
  },
  {
    id: 'hardvare',
    label: 'Hardvare',
    type: 'product',
    description: 'Hardware execution platform preventing unsafe wiring and invalid logic states.',
    status: 'building',
    weight: 65
  },
  {
    id: 'diy-ebook',
    label: 'DIY eBook',
    type: 'product',
    description: 'The Kids Book of Creative Ideas. 100+ sales.',
    url: 'https://chhotacreator.com',
    status: 'live',
    weight: 60,
    year: 2024,
    meta: { sales: '100+' }
  },

  // ========== PROJECTS/SYSTEMS ==========
  {
    id: 'kyabol',
    label: 'Kyabol',
    type: 'project',
    description: 'AI-powered conversational system built for Gemini 3 Hackathon.',
    year: 2026,
    weight: 55
  },
  {
    id: 'drishtikon-yantra',
    label: 'Drishtikon Yantra',
    type: 'project',
    description: 'Vision-based assistive device. Special Mention at Vedanta × Param Makeathon.',
    year: 2026,
    weight: 60
  },
  {
    id: 'line-robot',
    label: 'Line-Following Maze Robot',
    type: 'project',
    description: 'Autonomous navigation robot with sensor array for maze solving.',
    year: 2025,
    weight: 50
  },
  {
    id: 'grant-agent',
    label: 'Autonomous Grant Agent',
    type: 'project',
    description: 'AI agent sourcing and filing global grants autonomously using OpenClaw.',
    year: 2026,
    weight: 45
  },
  {
    id: 'obstacle-car',
    label: 'Obstacle Avoiding Car',
    type: 'project',
    description: 'Arduino-based car with 4 ultrasonic sensors for autonomous navigation.',
    year: 2025,
    weight: 40
  },
  {
    id: 'hydration-assistant',
    label: 'Hydration Assistant',
    type: 'project',
    description: 'Built at Hardware Hackathon 1.0 using Glyph board + sensor.',
    year: 2025,
    weight: 45
  },
  {
    id: 'electric-skateboard',
    label: 'Electric Skateboard',
    type: 'project',
    description: 'DC 775 Motor powered personal transport.',
    year: 2024,
    weight: 35
  },
  {
    id: 'hovercraft',
    label: 'DIY Hovercraft',
    type: 'project',
    description: 'CPU Fan powered hovercraft.',
    year: 2023,
    weight: 30
  },
  {
    id: 'self-driving-car',
    label: 'Self-Driving Car',
    type: 'project',
    description: 'Built with Witblox for autonomous navigation.',
    year: 2023,
    weight: 35
  },
  {
    id: 'robotic-table',
    label: 'Robotic Table',
    type: 'project',
    description: 'BO Motor powered moving table.',
    year: 2023,
    weight: 25
  },
  {
    id: 'food-crane',
    label: 'BO Motor Food Crane',
    type: 'project',
    description: 'Motorized crane for food transport.',
    year: 2023,
    weight: 25
  },
  {
    id: 'clothes-washer',
    label: 'DIY Clothes Washer',
    type: 'project',
    description: 'Built with cordless drill.',
    year: 2023,
    weight: 25
  },
  {
    id: 'drill-bicycle',
    label: 'Drill-Powered Bicycle',
    type: 'project',
    description: 'Bicycle powered by cordless drill motor.',
    year: 2023,
    weight: 30
  },
  {
    id: 'first-dc-fan',
    label: 'First DC Motor Fan',
    type: 'project',
    description: 'The first documented build - where it all began.',
    year: 2022,
    weight: 40,
    meta: { milestone: true }
  },

  // ========== SKILLS ==========
  {
    id: 'python',
    label: 'Python',
    type: 'skill',
    description: 'Primary programming language for AI/ML and automation.',
    weight: 70
  },
  {
    id: 'cpp',
    label: 'C++',
    type: 'skill',
    description: 'For embedded systems and Arduino programming.',
    weight: 60
  },
  {
    id: '3d-printing',
    label: '3D Printing',
    type: 'skill',
    description: 'Creating physical parts with Prusa and Bambu Lab printers.',
    weight: 65
  },
  {
    id: 'electronics',
    label: 'Electronics',
    type: 'skill',
    description: 'Circuit design, soldering, sensor integration.',
    weight: 75
  },
  {
    id: 'robotics',
    label: 'Robotics',
    type: 'skill',
    description: 'Building autonomous and controlled robots.',
    weight: 70
  },
  {
    id: 'computer-vision',
    label: 'Computer Vision',
    type: 'skill',
    description: 'OpenCV, MediaPipe, object detection and tracking.',
    weight: 55
  },
  {
    id: 'machine-learning',
    label: 'Machine Learning',
    type: 'skill',
    description: 'TensorFlow, PyTorch, TinyML for edge devices.',
    weight: 50
  },
  {
    id: 'cad-design',
    label: 'CAD Design',
    type: 'skill',
    description: 'Fusion 360 for 3D modeling and design.',
    weight: 45
  },
  {
    id: 'public-speaking',
    label: 'Public Speaking',
    type: 'skill',
    description: 'Pitching, panels, demos to diverse audiences.',
    weight: 55
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    type: 'skill',
    description: 'Product thinking, sales, trademark registration.',
    weight: 60
  },
  {
    id: 'drone-tech',
    label: 'Drone Technology',
    type: 'skill',
    description: 'Building and flying drones, FPV systems.',
    weight: 45
  },
  {
    id: 'iot',
    label: 'IoT',
    type: 'skill',
    description: 'Connected devices, sensors, automation.',
    weight: 50
  },

  // ========== TOOLS/HARDWARE ==========
  {
    id: 'raspberry-pi',
    label: 'Raspberry Pi',
    type: 'tool',
    description: 'Single-board computer for projects.',
    weight: 60
  },
  {
    id: 'arduino',
    label: 'Arduino',
    type: 'tool',
    description: 'Microcontroller platform for electronics.',
    weight: 65
  },
  {
    id: 'esp32',
    label: 'ESP32',
    type: 'tool',
    description: 'WiFi/Bluetooth microcontroller.',
    weight: 55
  },
  {
    id: 'bbc-microbit',
    label: 'BBC Micro:bit',
    type: 'tool',
    description: 'Educational microcontroller.',
    weight: 40
  },
  {
    id: 'vicharak',
    label: 'Vicharak',
    type: 'tool',
    description: 'FPGA-based development board.',
    weight: 35
  },
  {
    id: 'prusa-printer',
    label: 'Prusa 3D Printer',
    type: 'tool',
    description: 'High-quality FDM 3D printer.',
    weight: 45
  },
  {
    id: 'bambu-lab',
    label: 'Bambu Lab Printer',
    type: 'tool',
    description: 'Fast, reliable 3D printing.',
    weight: 45
  },
  {
    id: 'fusion360',
    label: 'Fusion 360',
    type: 'tool',
    description: 'CAD software for 3D design.',
    weight: 40
  },
  {
    id: 'tensorflow',
    label: 'TensorFlow',
    type: 'tool',
    description: 'ML framework for AI projects.',
    weight: 45
  },
  {
    id: 'opencv',
    label: 'OpenCV',
    type: 'tool',
    description: 'Computer vision library.',
    weight: 45
  },
  {
    id: 'mediapipe',
    label: 'MediaPipe',
    type: 'tool',
    description: 'ML solutions for vision tasks.',
    weight: 40
  },
  {
    id: 'openai-api',
    label: 'OpenAI API',
    type: 'tool',
    description: 'AI language models.',
    weight: 40
  },
  {
    id: 'gemini',
    label: 'Gemini',
    type: 'tool',
    description: 'Google\'s AI model.',
    weight: 40
  },
  {
    id: 'glyph-board',
    label: 'Glyph Board',
    type: 'tool',
    description: 'Lion Circuits development board.',
    weight: 35
  },

  // ========== ACHIEVEMENTS ==========
  {
    id: 'malpani-grant',
    label: '₹1L Malpani Grant',
    type: 'achievement',
    description: '₹1,00,000 grant from Malpani Ventures.',
    year: 2026,
    weight: 70
  },
  {
    id: 'param-award',
    label: 'Youngest Innovator Award',
    type: 'achievement',
    description: 'Special Mention at Param × Vedanta Makeathon.',
    year: 2026,
    weight: 65
  },
  {
    id: 'residency-youngest',
    label: 'Youngest Founder - The Residency',
    type: 'achievement',
    description: 'Youngest founder in Delta-2 Cohort.',
    year: 2025,
    weight: 60
  },
  {
    id: 'hackathon-finalist',
    label: 'Top-5 Hardware Hackathon',
    type: 'achievement',
    description: 'Youngest Top-5 finalist at Hardware Hackathon 2.0.',
    year: 2025,
    weight: 55
  },
  {
    id: 'trademark',
    label: 'Trademark Registered',
    type: 'achievement',
    description: 'CircuitHeroes trademark officially registered.',
    year: 2025,
    weight: 50
  },
  {
    id: 'first-youtube',
    label: 'First YouTube Video',
    type: 'achievement',
    description: 'First documented build - July 2022.',
    year: 2022,
    weight: 45,
    meta: { videoId: '17DZ8AXWz1w' }
  },
  {
    id: '170-projects',
    label: '170+ Projects Documented',
    type: 'achievement',
    description: 'Consistent building and documentation.',
    weight: 55
  },

  // ========== EVENTS/HACKATHONS ==========
  {
    id: 'gemini-hackathon',
    label: 'Gemini 3 Hackathon',
    type: 'event',
    description: 'Cerebral Valley × Google DeepMind hackathon.',
    year: 2026,
    weight: 55,
    meta: { location: 'San Francisco' }
  },
  {
    id: 'runtogether-hackathon',
    label: 'RunTogether Hackathon',
    type: 'event',
    description: 'Runable hackathon where MotionX was built.',
    year: 2026,
    weight: 50
  },
  {
    id: 'param-makeathon',
    label: 'Param × Vedanta Makeathon',
    type: 'event',
    description: 'Won Youngest Innovator & Special Mention.',
    year: 2026,
    weight: 55
  },
  {
    id: 'hardware-hackathon-2',
    label: 'Hardware Hackathon 2.0',
    type: 'event',
    description: 'Lion Circuits hardware hackathon - Top 5 finalist.',
    year: 2025,
    weight: 50
  },
  {
    id: 'hardware-hackathon-1',
    label: 'Hardware Hackathon 1.0',
    type: 'event',
    description: 'First Lion Circuits hackathon - built Hydration Assistant.',
    year: 2025,
    weight: 45
  },
  {
    id: 'the-residency',
    label: 'The Residency Delta-2',
    type: 'event',
    description: 'Startup program in USA - youngest founder.',
    year: 2025,
    weight: 55,
    meta: { location: 'USA' }
  },
  {
    id: 'south-park-commons',
    label: 'South Park Commons',
    type: 'event',
    description: 'Pitched at SPC Bengaluru.',
    year: 2025,
    weight: 50,
    meta: { location: 'Bengaluru' }
  },
  {
    id: 'august-fest',
    label: 'August Fest 2025',
    type: 'event',
    description: 'Panel discussion as featured speaker.',
    year: 2025,
    weight: 45
  },
  {
    id: 'iit-hyderabad-workshop',
    label: 'IIT Hyderabad Workshop',
    type: 'event',
    description: 'IoT and Drone workshops at IITH.',
    year: 2025,
    weight: 40
  },
  {
    id: 'isro-demo',
    label: 'Demo to ISRO Chief',
    type: 'event',
    description: 'Demonstrated projects to Shri Somanath ji (Former ISRO Chief).',
    year: 2026,
    weight: 60
  },

  // ========== COMPANIES/ORGANIZATIONS ==========
  {
    id: 'malpani-ventures',
    label: 'Malpani Ventures',
    type: 'company',
    description: 'Angel investor and grant provider.',
    url: 'https://malpaniventures.com',
    weight: 55,
    reach: 50000
  },
  {
    id: 'lion-circuits',
    label: 'Lion Circuits',
    type: 'company',
    description: 'PCB manufacturing and hardware support.',
    url: 'https://lioncircuits.com',
    weight: 50,
    reach: 20000
  },
  {
    id: 'param-foundation',
    label: 'Param Foundation',
    type: 'company',
    description: 'Science and innovation organization.',
    url: 'https://paramfoundation.org',
    weight: 45,
    reach: 15000
  },
  {
    id: 'ai-grants-india',
    label: 'AI Grants India',
    type: 'company',
    description: 'Supporting AI builders in India.',
    url: 'https://aigrants.in',
    weight: 40,
    reach: 10000
  },
  {
    id: 'runable',
    label: 'Runable',
    type: 'company',
    description: 'Builder tools and hackathon organizer.',
    url: 'https://runable.com',
    weight: 40,
    reach: 5000
  },
  {
    id: 'iit-hyderabad',
    label: 'IIT Hyderabad',
    type: 'company',
    description: 'Premier engineering institute - workshop venue.',
    weight: 45,
    reach: 100000
  },
  {
    id: 't-hub',
    label: 'T-Hub',
    type: 'company',
    description: 'Hyderabad\'s startup incubator.',
    weight: 40,
    reach: 50000
  },

  // ========== MEDIA ==========
  {
    id: 'beats-in-brief',
    label: 'Beats in Brief',
    type: 'media',
    description: 'Feature article on youngest hardware founder.',
    url: 'https://beatsinbrief.com/2026/01/11/lakshveer-rao-8-year-old-hardware-startup-founder-india/',
    year: 2026,
    weight: 45,
    reach: 50000
  },
  {
    id: 'startupnews-fyi',
    label: 'StartupNews.fyi',
    type: 'media',
    description: 'Instagram feature on young founder.',
    year: 2026,
    weight: 40,
    reach: 100000
  },
  {
    id: 'thinktac',
    label: 'ThinkTac',
    type: 'media',
    description: 'YouTube interview feature.',
    url: 'https://www.youtube.com/watch?v=8qmvDz-TJTE',
    weight: 35,
    reach: 20000
  },
  {
    id: 'medium-feature',
    label: 'Medium Feature',
    type: 'media',
    description: 'In-depth article by Sharav Arora.',
    url: 'https://medium.com/@sharavarora80/meet-indias-8-year-old-tech-wunderkind-how-lakshveer-rao-is-redefining-childhood-innovation-9b76c12da34e',
    weight: 35,
    reach: 30000
  },
  {
    id: 'sravya-interview',
    label: 'Sravya Interview',
    type: 'media',
    description: 'Facebook video interview feature.',
    url: 'https://www.facebook.com/watch/?v=911725544741111',
    weight: 35,
    reach: 25000
  },
  {
    id: 'kids-carnival-hitex',
    label: 'Kids Carnival Hitex',
    type: 'media',
    description: 'Instagram reel from kids carnival event.',
    url: 'https://www.instagram.com/reel/DEHVEtWJkf1/?hl=en',
    weight: 30,
    reach: 15000
  },
  {
    id: 'jagran-josh-scaler',
    label: 'Jagran Josh',
    type: 'media',
    description: 'Coverage of Yugaantar 2025 at Scaler School of Technology.',
    url: 'https://www.jagranjosh.com/articles/yugaantar-2025-student-led-festival-at-sst-blends-technology-competition-and-culture-1800007602-1',
    weight: 40,
    reach: 200000
  },
  {
    id: 'august-fest-speaker',
    label: 'August Fest 2025',
    type: 'media',
    description: 'Listed as speaker at August Fest 2025.',
    url: 'https://theaugustfest.com/speaker/r-lakshveer-rao/',
    weight: 45,
    reach: 50000
  },
  {
    id: 'chekodi-telugu',
    label: 'Chekodi Telugu',
    type: 'media',
    description: 'Telugu media coverage of 8-year-old hardware founder.',
    url: 'https://chekodi.com/p/meet-lakshveer-rao-just-8-years-age-lo-hardware-s-96384',
    weight: 35,
    reach: 40000
  },
  {
    id: 'param-foundation-inav',
    label: 'Param Foundation',
    type: 'media',
    description: 'LinkedIn post by Inav Amsi about meeting at hackathon.',
    url: 'https://www.linkedin.com/posts/inavamsi_met-this-8-year-old-lakshveer-in-our-hackathon-activity-7418284045475659776-zoBR/',
    weight: 30,
    reach: 10000
  },
  {
    id: 'financial-express-scaler',
    label: 'Financial Express (Scaler)',
    type: 'media',
    description: 'Coverage of Scaler School tech fest.',
    url: 'https://www.financialexpress.com/jobs-career/education-scaler-school-of-technology-hosts-student-led-tech-fest-draws-massive-crowd-4114508/',
    weight: 50,
    reach: 500000
  },
  {
    id: 'financial-express-motionx',
    label: 'Financial Express (MotionX)',
    type: 'media',
    description: 'Feature on AI agent to control devices via Telegram.',
    url: 'https://www.financialexpress.com/life/technology-meet-lakshveer-the-8-year-old-who-created-an-ai-agent-to-control-devices-via-telegram-messaging-4159964/',
    weight: 50,
    reach: 500000
  },
  {
    id: 'caleb-insta-reel',
    label: 'Caleb Instagram',
    type: 'media',
    description: 'Instagram reel feature by Caleb.',
    url: 'https://www.instagram.com/popular/how-was-hyderabad-merged-into-indian-union/reels/DQJ34sdjxA0/',
    weight: 30,
    reach: 20000
  },

  // ========== MENTORS/SUPPORTERS (Key ones) ==========
  {
    id: 'aniruddha-malpani',
    label: 'Dr. Aniruddha Malpani',
    type: 'person',
    description: 'Angel investing & startup thinking mentor.',
    url: 'https://x.com/malpani',
    weight: 50,
    reach: 100000,
    meta: { handle: '@malpani', guidance: 'Angel investing & startup thinking' }
  },
  {
    id: 'prem-sai',
    label: 'Besta Prem Sai',
    type: 'person',
    description: 'Drone technology & GPS-denied autonomy.',
    url: 'https://x.com/besta_tweets',
    weight: 40,
    reach: 5000,
    meta: { handle: '@besta_tweets', guidance: 'Drone technology' }
  },
  {
    id: 'premprasad',
    label: 'PremPrasad Mirthinti',
    type: 'person',
    description: 'EdgeAI & STEM education mentor.',
    url: 'https://x.com/premmirth',
    weight: 40,
    reach: 3000,
    meta: { handle: '@premmirth', guidance: 'EdgeAI & STEM' }
  },
  {
    id: 'nandini',
    label: 'Nandini Chilkam',
    type: 'person',
    description: 'Embedded systems & education.',
    url: 'https://x.com/NandiniChilkam',
    weight: 35,
    reach: 2000,
    meta: { handle: '@NandiniChilkam', guidance: 'Embedded systems' }
  },
  {
    id: 'murali-srinivasa',
    label: 'Murali Srinivasa',
    type: 'person',
    description: 'PCB design & electronics manufacturing.',
    url: 'https://x.com/MuraliSrinivasa',
    weight: 40,
    reach: 8000,
    meta: { handle: '@MuraliSrinivasa', guidance: 'PCB design' }
  },
  {
    id: 'karthik-rangarajan',
    label: 'Karthik Rangarajan',
    type: 'person',
    description: 'Drones, robotics & FPV systems.',
    url: 'https://x.com/karthikRanga92',
    weight: 35,
    reach: 3000,
    meta: { handle: '@karthikRanga92', guidance: 'Drones & robotics' }
  },
  {
    id: 'yuvraj-aaditya',
    label: 'Yuvraj Aaditya',
    type: 'person',
    description: 'Community building & acceleration.',
    url: 'https://x.com/AadityaYuvraj',
    weight: 35,
    reach: 5000,
    meta: { handle: '@AadityaYuvraj', guidance: 'Community building' }
  },
  {
    id: 'bhasker-kode',
    label: 'Bhasker Kode',
    type: 'person',
    description: 'AI Grants India & distributed systems.',
    url: 'https://x.com/0xBosky',
    weight: 40,
    reach: 15000,
    meta: { handle: '@0xBosky', guidance: 'AI Grants' }
  },
  {
    id: 'ramsri-goutham',
    label: 'Ramsri Goutham',
    type: 'person',
    description: 'AI SaaS & data science. Micro scholarship provider.',
    url: 'https://x.com/ramsri_goutham',
    weight: 35,
    reach: 20000,
    meta: { handle: '@ramsri_goutham', guidance: 'AI SaaS' }
  },
  {
    id: 'ganesh-sonawane',
    label: 'Ganesh Sonawane',
    type: 'person',
    description: 'Product building & D2C manufacturing.',
    url: 'https://x.com/ganeshsonawane',
    weight: 35,
    reach: 10000,
    meta: { handle: '@ganeshsonawane', guidance: 'Product building' }
  },
  {
    id: 'nimisha-chanda',
    label: 'Nimisha Chanda',
    type: 'person',
    description: 'Builder community & hackathons.',
    url: 'https://x.com/NimishaChanda',
    weight: 35,
    reach: 5000,
    meta: { handle: '@NimishaChanda', guidance: 'Builder community' }
  },

  // ========== CONCEPTS (Learning areas) ==========
  {
    id: 'concept-autonomy',
    label: 'Autonomous Systems',
    type: 'concept',
    description: 'Self-driving, self-navigating machines.',
    weight: 50
  },
  {
    id: 'concept-edge-ai',
    label: 'Edge AI',
    type: 'concept',
    description: 'Running AI on resource-constrained devices.',
    weight: 45
  },
  {
    id: 'concept-maker-education',
    label: 'Maker Education',
    type: 'concept',
    description: 'Learning by building, hands-on approach.',
    weight: 50
  },
  {
    id: 'concept-hardware-startup',
    label: 'Hardware Startups',
    type: 'concept',
    description: 'Building and shipping physical products.',
    weight: 55
  },
  {
    id: 'concept-young-builder',
    label: 'Young Builder Movement',
    type: 'concept',
    description: 'Kids building real things, not just learning.',
    weight: 45
  },

  // ========== POSSIBILITIES (Future potential) ==========
  {
    id: 'poss-ros',
    label: 'ROS (Robot OS)',
    type: 'possibility',
    description: 'Industry-standard robotics framework - 1 step away.',
    weight: 30,
    status: 'potential'
  },
  {
    id: 'poss-pcb-design',
    label: 'Custom PCB Design',
    type: 'possibility',
    description: 'KiCAD/Altium for professional circuit boards.',
    weight: 30,
    status: 'potential'
  },
  {
    id: 'poss-mobile-app',
    label: 'Mobile App Development',
    type: 'possibility',
    description: 'Flutter/React Native for companion apps.',
    weight: 25,
    status: 'potential'
  },
  {
    id: 'poss-satellite',
    label: 'CubeSat Project',
    type: 'possibility',
    description: 'Space tech - aligned with ISRO connection.',
    weight: 35,
    status: 'potential'
  },
  {
    id: 'poss-smart-farm',
    label: 'Smart Farming System',
    type: 'possibility',
    description: 'IoT sensors + automation for agriculture.',
    weight: 30,
    status: 'potential'
  },
  {
    id: 'poss-wearable',
    label: 'Wearable Health Device',
    type: 'possibility',
    description: 'Health monitoring with current sensor skills.',
    weight: 30,
    status: 'potential'
  },
  {
    id: 'poss-raspberry-pi-sponsor',
    label: 'Raspberry Pi Foundation',
    type: 'possibility',
    description: 'Potential sponsor - aligned with his work.',
    weight: 35,
    status: 'potential',
    reach: 1000000
  },
  {
    id: 'poss-arduino-sponsor',
    label: 'Arduino Partnership',
    type: 'possibility',
    description: 'Potential collaboration - uses Arduino extensively.',
    weight: 35,
    status: 'potential',
    reach: 500000
  },
  {
    id: 'poss-maker-faire',
    label: 'Maker Faire',
    type: 'possibility',
    description: 'Global maker event - showcase opportunity.',
    weight: 30,
    status: 'potential'
  },
  {
    id: 'poss-ted-talk',
    label: 'TEDx Talk',
    type: 'possibility',
    description: 'Public speaking milestone - ready for it.',
    weight: 35,
    status: 'potential',
    reach: 100000
  },
  {
    id: 'poss-nvidia-jetson',
    label: 'NVIDIA Jetson',
    type: 'possibility',
    description: 'Next-level AI edge computing.',
    weight: 30,
    status: 'potential'
  },
];

// ============================================
// EDGES - All meaningful connections
// ============================================

export const edges: UniverseEdge[] = [
  // Core connections
  { source: 'lakshveer', target: 'capt-venkat', relation: 'backed by', weight: 100 },
  
  // Products built by Lakshveer
  { source: 'lakshveer', target: 'circuitheroes', relation: 'created', weight: 90 },
  { source: 'lakshveer', target: 'chhotacreator', relation: 'created', weight: 80 },
  { source: 'lakshveer', target: 'motionx', relation: 'built', weight: 75 },
  { source: 'lakshveer', target: 'hardvare', relation: 'building', weight: 70 },
  { source: 'lakshveer', target: 'diy-ebook', relation: 'authored', weight: 65 },
  
  // Projects built
  { source: 'lakshveer', target: 'kyabol', relation: 'built', weight: 60 },
  { source: 'lakshveer', target: 'drishtikon-yantra', relation: 'built', weight: 65 },
  { source: 'lakshveer', target: 'line-robot', relation: 'built', weight: 55 },
  { source: 'lakshveer', target: 'grant-agent', relation: 'built', weight: 50 },
  { source: 'lakshveer', target: 'obstacle-car', relation: 'built', weight: 50 },
  { source: 'lakshveer', target: 'hydration-assistant', relation: 'built', weight: 55 },
  { source: 'lakshveer', target: 'electric-skateboard', relation: 'built', weight: 45 },
  { source: 'lakshveer', target: 'hovercraft', relation: 'built', weight: 40 },
  { source: 'lakshveer', target: 'self-driving-car', relation: 'built', weight: 45 },
  { source: 'lakshveer', target: 'first-dc-fan', relation: 'built', weight: 50 },
  
  // Skills
  { source: 'lakshveer', target: 'python', relation: 'knows', weight: 70 },
  { source: 'lakshveer', target: 'cpp', relation: 'knows', weight: 60 },
  { source: 'lakshveer', target: '3d-printing', relation: 'knows', weight: 65 },
  { source: 'lakshveer', target: 'electronics', relation: 'knows', weight: 75 },
  { source: 'lakshveer', target: 'robotics', relation: 'knows', weight: 70 },
  { source: 'lakshveer', target: 'computer-vision', relation: 'learning', weight: 50 },
  { source: 'lakshveer', target: 'machine-learning', relation: 'learning', weight: 45 },
  { source: 'lakshveer', target: 'public-speaking', relation: 'knows', weight: 55 },
  { source: 'lakshveer', target: 'entrepreneurship', relation: 'practicing', weight: 60 },
  
  // Tools used
  { source: 'lakshveer', target: 'raspberry-pi', relation: 'uses', weight: 60 },
  { source: 'lakshveer', target: 'arduino', relation: 'uses', weight: 65 },
  { source: 'lakshveer', target: 'esp32', relation: 'uses', weight: 55 },
  { source: 'lakshveer', target: 'prusa-printer', relation: 'uses', weight: 45 },
  { source: 'lakshveer', target: 'bambu-lab', relation: 'uses', weight: 45 },
  
  // Achievements earned
  { source: 'lakshveer', target: 'malpani-grant', relation: 'earned', weight: 70 },
  { source: 'lakshveer', target: 'param-award', relation: 'won', weight: 65 },
  { source: 'lakshveer', target: 'residency-youngest', relation: 'achieved', weight: 60 },
  { source: 'lakshveer', target: 'hackathon-finalist', relation: 'achieved', weight: 55 },
  { source: 'lakshveer', target: 'trademark', relation: 'registered', weight: 50 },
  { source: 'lakshveer', target: '170-projects', relation: 'documented', weight: 55 },
  
  // Events participated
  { source: 'lakshveer', target: 'gemini-hackathon', relation: 'participated', weight: 55 },
  { source: 'lakshveer', target: 'runtogether-hackathon', relation: 'participated', weight: 50 },
  { source: 'lakshveer', target: 'param-makeathon', relation: 'won at', weight: 55 },
  { source: 'lakshveer', target: 'hardware-hackathon-2', relation: 'finalist at', weight: 50 },
  { source: 'lakshveer', target: 'hardware-hackathon-1', relation: 'participated', weight: 45 },
  { source: 'lakshveer', target: 'the-residency', relation: 'member of', weight: 55 },
  { source: 'lakshveer', target: 'south-park-commons', relation: 'pitched at', weight: 50 },
  { source: 'lakshveer', target: 'august-fest', relation: 'spoke at', weight: 45 },
  { source: 'lakshveer', target: 'isro-demo', relation: 'presented at', weight: 60 },
  
  // Company support
  { source: 'malpani-ventures', target: 'lakshveer', relation: 'funds', weight: 55 },
  { source: 'lion-circuits', target: 'lakshveer', relation: 'supports', weight: 50 },
  { source: 'param-foundation', target: 'lakshveer', relation: 'supports', weight: 45 },
  { source: 'ai-grants-india', target: 'lakshveer', relation: 'supports', weight: 40 },
  { source: 'runable', target: 'lakshveer', relation: 'hosted', weight: 40 },
  
  // Media coverage
  { source: 'beats-in-brief', target: 'lakshveer', relation: 'featured', weight: 45 },
  { source: 'startupnews-fyi', target: 'lakshveer', relation: 'featured', weight: 40 },
  { source: 'thinktac', target: 'lakshveer', relation: 'interviewed', weight: 35 },
  { source: 'medium-feature', target: 'lakshveer', relation: 'profiled', weight: 35 },
  { source: 'sravya-interview', target: 'lakshveer', relation: 'interviewed', weight: 35 },
  { source: 'kids-carnival-hitex', target: 'lakshveer', relation: 'featured', weight: 30 },
  { source: 'jagran-josh-scaler', target: 'lakshveer', relation: 'covered', weight: 40 },
  { source: 'jagran-josh-scaler', target: 'yugaantar-2025', relation: 'covered event', weight: 40 },
  { source: 'august-fest-speaker', target: 'lakshveer', relation: 'listed speaker', weight: 45 },
  { source: 'chekodi-telugu', target: 'lakshveer', relation: 'featured', weight: 35 },
  { source: 'param-foundation-inav', target: 'lakshveer', relation: 'highlighted', weight: 30 },
  { source: 'param-foundation-inav', target: 'param-foundation', relation: 'by organization', weight: 40 },
  { source: 'financial-express-scaler', target: 'lakshveer', relation: 'covered', weight: 50 },
  { source: 'financial-express-scaler', target: 'yugaantar-2025', relation: 'covered event', weight: 50 },
  { source: 'financial-express-motionx', target: 'lakshveer', relation: 'featured', weight: 50 },
  { source: 'financial-express-motionx', target: 'motionx', relation: 'featured project', weight: 50 },
  { source: 'caleb-insta-reel', target: 'lakshveer', relation: 'featured', weight: 30 },
  
  // Mentor relationships
  { source: 'aniruddha-malpani', target: 'lakshveer', relation: 'mentors', weight: 50 },
  { source: 'prem-sai', target: 'lakshveer', relation: 'guides', weight: 40 },
  { source: 'premprasad', target: 'lakshveer', relation: 'teaches', weight: 40 },
  { source: 'nandini', target: 'lakshveer', relation: 'guides', weight: 35 },
  { source: 'murali-srinivasa', target: 'lakshveer', relation: 'mentors', weight: 40 },
  { source: 'karthik-rangarajan', target: 'lakshveer', relation: 'teaches', weight: 35 },
  { source: 'yuvraj-aaditya', target: 'lakshveer', relation: 'supports', weight: 35 },
  { source: 'bhasker-kode', target: 'lakshveer', relation: 'funds', weight: 40 },
  { source: 'ramsri-goutham', target: 'lakshveer', relation: 'supports', weight: 35 },
  { source: 'ganesh-sonawane', target: 'lakshveer', relation: 'advises', weight: 35 },
  { source: 'nimisha-chanda', target: 'lakshveer', relation: 'connects', weight: 35 },
  
  // Capt Venkat connections
  { source: 'capt-venkat', target: 'circuitheroes', relation: 'co-created', weight: 80 },
  { source: 'capt-venkat', target: 'chhotacreator', relation: 'co-created', weight: 75 },
  { source: 'capt-venkat', target: 'aniruddha-malpani', relation: 'connected with', weight: 45 },
  
  // Project → Skill connections
  { source: 'circuitheroes', target: 'electronics', relation: 'teaches', weight: 70 },
  { source: 'circuitheroes', target: 'entrepreneurship', relation: 'requires', weight: 60 },
  { source: 'motionx', target: 'computer-vision', relation: 'uses', weight: 55 },
  { source: 'motionx', target: 'mediapipe', relation: 'built with', weight: 50 },
  { source: 'kyabol', target: 'machine-learning', relation: 'uses', weight: 50 },
  { source: 'kyabol', target: 'gemini', relation: 'powered by', weight: 45 },
  { source: 'drishtikon-yantra', target: 'computer-vision', relation: 'uses', weight: 55 },
  { source: 'drishtikon-yantra', target: 'opencv', relation: 'built with', weight: 50 },
  { source: 'line-robot', target: 'robotics', relation: 'demonstrates', weight: 50 },
  { source: 'line-robot', target: 'arduino', relation: 'built with', weight: 50 },
  { source: 'obstacle-car', target: 'arduino', relation: 'built with', weight: 50 },
  { source: 'obstacle-car', target: 'robotics', relation: 'demonstrates', weight: 45 },
  { source: 'hydration-assistant', target: 'glyph-board', relation: 'built with', weight: 45 },
  { source: 'hydration-assistant', target: 'iot', relation: 'demonstrates', weight: 40 },
  { source: 'self-driving-car', target: 'concept-autonomy', relation: 'explores', weight: 45 },
  { source: 'grant-agent', target: 'openai-api', relation: 'uses', weight: 40 },
  
  // Skill → Tool connections
  { source: 'python', target: 'tensorflow', relation: 'enables', weight: 50 },
  { source: 'python', target: 'opencv', relation: 'enables', weight: 50 },
  { source: 'cpp', target: 'arduino', relation: 'required for', weight: 55 },
  { source: 'cpp', target: 'esp32', relation: 'required for', weight: 50 },
  { source: '3d-printing', target: 'prusa-printer', relation: 'uses', weight: 50 },
  { source: '3d-printing', target: 'bambu-lab', relation: 'uses', weight: 50 },
  { source: 'cad-design', target: 'fusion360', relation: 'uses', weight: 45 },
  { source: 'cad-design', target: '3d-printing', relation: 'enables', weight: 50 },
  { source: 'machine-learning', target: 'tensorflow', relation: 'uses', weight: 50 },
  { source: 'computer-vision', target: 'opencv', relation: 'uses', weight: 50 },
  { source: 'computer-vision', target: 'mediapipe', relation: 'uses', weight: 45 },
  
  // Event → Project/Achievement connections
  { source: 'gemini-hackathon', target: 'kyabol', relation: 'produced', weight: 55 },
  { source: 'runtogether-hackathon', target: 'motionx', relation: 'produced', weight: 50 },
  { source: 'param-makeathon', target: 'drishtikon-yantra', relation: 'produced', weight: 55 },
  { source: 'param-makeathon', target: 'param-award', relation: 'led to', weight: 50 },
  { source: 'hardware-hackathon-1', target: 'hydration-assistant', relation: 'produced', weight: 45 },
  { source: 'hardware-hackathon-2', target: 'hackathon-finalist', relation: 'led to', weight: 50 },
  
  // Company → Event connections
  { source: 'lion-circuits', target: 'hardware-hackathon-1', relation: 'organized', weight: 45 },
  { source: 'lion-circuits', target: 'hardware-hackathon-2', relation: 'organized', weight: 45 },
  { source: 'param-foundation', target: 'param-makeathon', relation: 'organized', weight: 50 },
  { source: 'runable', target: 'runtogether-hackathon', relation: 'organized', weight: 45 },
  { source: 'malpani-ventures', target: 'malpani-grant', relation: 'provided', weight: 55 },
  
  // Concept connections
  { source: 'robotics', target: 'concept-autonomy', relation: 'enables', weight: 50 },
  { source: 'concept-edge-ai', target: 'machine-learning', relation: 'specializes', weight: 45 },
  { source: 'concept-edge-ai', target: 'tensorflow', relation: 'uses', weight: 40 },
  { source: 'diy-ebook', target: 'concept-maker-education', relation: 'promotes', weight: 45 },
  { source: 'chhotacreator', target: 'concept-maker-education', relation: 'enables', weight: 50 },
  { source: 'circuitheroes', target: 'concept-hardware-startup', relation: 'exemplifies', weight: 55 },
  { source: 'lakshveer', target: 'concept-young-builder', relation: 'represents', weight: 60 },
  
  // Possibility connections (what skills unlock)
  { source: 'robotics', target: 'poss-ros', relation: 'unlocks', weight: 35 },
  { source: 'electronics', target: 'poss-pcb-design', relation: 'unlocks', weight: 35 },
  { source: 'python', target: 'poss-mobile-app', relation: 'enables', weight: 30 },
  { source: 'isro-demo', target: 'poss-satellite', relation: 'opens door to', weight: 35 },
  { source: 'iot', target: 'poss-smart-farm', relation: 'enables', weight: 30 },
  { source: 'electronics', target: 'poss-wearable', relation: 'enables', weight: 30 },
  { source: 'raspberry-pi', target: 'poss-raspberry-pi-sponsor', relation: 'aligns with', weight: 35 },
  { source: 'arduino', target: 'poss-arduino-sponsor', relation: 'aligns with', weight: 35 },
  { source: 'lakshveer', target: 'poss-maker-faire', relation: 'ready for', weight: 30 },
  { source: 'public-speaking', target: 'poss-ted-talk', relation: 'enables', weight: 35 },
  { source: 'machine-learning', target: 'poss-nvidia-jetson', relation: 'unlocks', weight: 30 },
  
  // Cross-connections for richer graph
  { source: 'aniruddha-malpani', target: 'malpani-ventures', relation: 'runs', weight: 50 },
  { source: 'bhasker-kode', target: 'ai-grants-india', relation: 'runs', weight: 45 },
  { source: 'murali-srinivasa', target: 'lion-circuits', relation: 'connected to', weight: 40 },
  { source: 'premprasad', target: 'concept-edge-ai', relation: 'expert in', weight: 40 },
  { source: 'karthik-rangarajan', target: 'drone-tech', relation: 'expert in', weight: 40 },
  { source: 'iit-hyderabad', target: 'iit-hyderabad-workshop', relation: 'hosted', weight: 40 },
];

// Helper to get node by id
export const getNodeById = (id: string): UniverseNode | undefined => 
  nodes.find(n => n.id === id);

// Helper to get connected nodes
export const getConnectedNodes = (nodeId: string): { node: UniverseNode; edge: UniverseEdge }[] => {
  const connected: { node: UniverseNode; edge: UniverseEdge }[] = [];
  
  edges.forEach(edge => {
    if (edge.source === nodeId) {
      const targetNode = getNodeById(edge.target);
      if (targetNode) connected.push({ node: targetNode, edge });
    } else if (edge.target === nodeId) {
      const sourceNode = getNodeById(edge.source);
      if (sourceNode) connected.push({ node: sourceNode, edge });
    }
  });
  
  return connected;
};

// Calculate total potential reach
export const calculateTotalReach = (): number => {
  return nodes
    .filter(n => n.reach)
    .reduce((sum, n) => sum + (n.reach || 0), 0);
};

// Get all possibilities
export const getPossibilities = (): UniverseNode[] => 
  nodes.filter(n => n.type === 'possibility');

// Get stats
export const getUniverseStats = () => ({
  totalNodes: nodes.length,
  totalEdges: edges.length,
  nodesByType: nodes.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<NodeType, number>),
  totalReach: calculateTotalReach(),
  possibilities: getPossibilities().length,
});
