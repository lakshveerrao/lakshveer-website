// Single source of truth for all portfolio data
// Update here = updates everywhere (homepage, share, invite, press kit, PDF)

export const portfolioData = {
  // Core identity
  name: "R Lakshveer Rao",
  shortName: "Laksh",
  age: 8,
  tagline: "Builds to Learn",
  title: "Hardware + AI Systems Builder",
  role: "Co-Founder",
  company: "Projects by Laksh",
  location: "Hyderabad, India",
  timezone: "UTC+5:30",
  website: "https://lakshveer.com",
  
  // One-liner for sharing
  oneLiner: "8-year-old hardware and AI builder from India. Shipped 3 products. ₹1.4L+ in grants. lakshveer.com",
  
  // Stats - update these as they change
  stats: {
    ebookSales: "100+",
    projectsDocumented: "170+",
    productsShipped: 3,
    workshopsConducted: "5+",
    grantsReceived: "₹1.4L+",
    trademarksOwned: 1,
  },
  
  // Key achievements (most recent first)
  achievements: [
    { title: "Youngest Innovator & Special Mention", event: "Param × Vedanta Makeathon", year: 2026 },
    { title: "₹1,00,000 Grant", event: "Malpani Ventures", year: 2026 },
    { title: "Participant", event: "Gemini 3 Hackathon — Cerebral Valley × Google DeepMind", year: 2026 },
    { title: "Top-5 Finalist (Youngest)", event: "Hardware Hackathon 2.0", year: 2025 },
    { title: "Youngest Founder", event: "Delta-2 Cohort, The Residency", year: 2025 },
  ],
  
  // Products & platforms
  products: [
    { 
      name: "CircuitHeroes.com", 
      desc: "Circuit-building trading card game", 
      highlight: "300+ decks sold. Trademark registered.",
      url: "https://circuitheroes.com",
      status: "live"
    },
    { 
      name: "ChhotaCreator.com", 
      desc: "Peer-learning platform for hands-on learning",
      url: "https://chhotacreator.com",
      status: "live"
    },
    { 
      name: "Hardvare", 
      desc: "Hardware execution platform enforcing safe electrical and logical states",
      url: "/systems#hardvare",
      status: "building"
    },
    { 
      name: "MotionX", 
      desc: "Full-body motion-control gaming system",
      highlight: "Built at RunTogether Hackathon",
      url: "https://motionx.runable.site/",
      status: "live"
    },
  ],
  
  // Backers & supporters
  backers: [
    { name: "Malpani Ventures", url: "https://malpaniventures.com", type: "grant" },
    { name: "Lion Circuits", url: "https://lioncircuits.com", type: "hardware" },
    { name: "Param Foundation", url: "https://paramfoundation.org", type: "grant" },
    { name: "AI Grants India", url: "https://aigrants.in", type: "grant" },
  ],
  
  // Media coverage
  media: [
    // Press & News Outlets
    { name: "Financial Express - MotionX AI Feature", url: "https://www.financialexpress.com/life/technology-meet-lakshveer-the-8-year-old-who-created-an-ai-agent-to-control-devices-via-telegram-messaging-4159964/" },
    { name: "Financial Express - Scaler Tech Fest", url: "https://www.financialexpress.com/jobs-career/education-scaler-school-of-technology-hosts-student-led-tech-fest-draws-massive-crowd-4114508/" },
    { name: "Jagran Josh - Yugaantar 2025", url: "https://www.jagranjosh.com/articles/yugaantar-2025-student-led-festival-at-sst-blends-technology-competition-and-culture-1800007602-1" },
    { name: "Beats in Brief", url: "https://beatsinbrief.com/2026/01/11/lakshveer-rao-8-year-old-hardware-startup-founder-india/" },
    { name: "Chekodi Telugu Media", url: "https://chekodi.com/p/meet-lakshveer-rao-just-8-years-age-lo-hardware-s-96384" },
    { name: "Maverick News", url: "https://mavericknews30.com/?p=103498" },
    
    // Long-form Articles
    { name: "Medium - Tech Wunderkind by Sharav Arora", url: "https://medium.com/@sharavarora80/meet-indias-8-year-old-tech-wunderkind-how-lakshveer-rao-is-redefining-childhood-innovation-9b76c12da34e" },
    
    // Video Interviews
    { name: "ThinkTac YouTube Interview", url: "https://www.youtube.com/watch?v=8qmvDz-TJTE" },
    { name: "Sravya Interview (Facebook)", url: "https://www.facebook.com/watch/?v=911725544741111" },
    
    // Social Media Features
    { name: "Runtime Instagram", url: "https://www.instagram.com/reel/DQJ34sdjxA0/" },
    { name: "Caleb Instagram Reel", url: "https://www.instagram.com/popular/how-was-hyderabad-merged-into-indian-union/reels/DQJ34sdjxA0/" },
    { name: "Kids Carnival Hitex", url: "https://www.instagram.com/reel/DEHVEtWJkf1/?hl=en" },
    { name: "Param Foundation LinkedIn", url: "https://www.linkedin.com/posts/inavamsi_met-this-8-year-old-lakshveer-in-our-hackathon-activity-7418284045475659776-zoBR/" },
    { name: "Lion Circuits", url: "https://x.com/LionCircuits/status/1950132910667026934" },
    
    // Event Listings
    { name: "August Fest 2025 Speaker", url: "https://theaugustfest.com/speaker/r-lakshveer-rao/" },
  ],
  
  // Social links
  social: {
    twitter: { handle: "@LakshveerRao", url: "https://x.com/LakshveerRao" },
    linkedin: { handle: "lakshveerrao", url: "https://www.linkedin.com/in/lakshveerrao/" },
    github: { handle: "lakshveerrao", url: "https://github.com/lakshveerrao" },
    youtube: { handle: "@ProjectsByLaksh", url: "https://www.youtube.com/@ProjectsByLaksh" },
  },
  
  // Contact
  contact: {
    primary: {
      name: "Capt. Venkat",
      role: "Father & Co-Founder",
      twitter: "@CaptVenk",
      linkedin: "https://www.linkedin.com/in/captvenkat/",
    },
  },
  
  // What Laksh is open to (for invite page & banner)
  openTo: [
    { type: "hackathon", label: "Hackathon Invites", icon: "🏆" },
    { type: "guest-talk", label: "Guest Talks & Lectures", icon: "🎤" },
    { type: "grant", label: "Grants & Scholarships", icon: "💰" },
    { type: "sponsorship", label: "Hardware Sponsorship", icon: "🔧" },
    { type: "collaboration", label: "Builder Collaborations", icon: "🤝" },
  ],
  
  // Topics Laksh can speak about
  talkTopics: [
    {
      title: "Building Hardware at Age 8",
      description: "From curiosity to shipping real products — the journey of a young maker",
      duration: "20-30 min",
      audience: ["Schools", "STEM Programs", "Maker Events"],
    },
    {
      title: "AI + Hardware Integration",
      description: "Using computer vision and ML in physical projects with ESP32, Raspberry Pi",
      duration: "30-45 min",
      audience: ["Tech Events", "Hackathons", "Developer Meetups"],
    },
    {
      title: "From Idea to Product",
      description: "How CircuitHeroes went from concept to 300+ sales with trademark",
      duration: "20-30 min",
      audience: ["Entrepreneurship Events", "Schools", "Startup Programs"],
    },
    {
      title: "Learning by Building",
      description: "Why hands-on projects beat traditional education for curious kids",
      duration: "15-20 min",
      audience: ["Parents", "Educators", "Schools"],
    },
  ],
  
  // Tech stack for credibility
  techStack: {
    hardware: ["ESP32", "Arduino", "Raspberry Pi", "Vicharak", "BBC Micro:bit", "Sensors & Actuators", "3D Printing"],
    software: ["Python", "C++", "TensorFlow", "PyTorch", "TinyML", "OpenCV", "MediaPipe", "Fusion 360"],
    ai: ["OpenAI", "Claude", "Gemini", "YOLO", "SAM3", "Depth Estimation"],
  },
};

// Helper functions
export const getAge = () => portfolioData.age;
export const getStats = () => portfolioData.stats;
export const getOneLiner = () => portfolioData.oneLiner;
export const getOpenTo = () => portfolioData.openTo;
export const getTalkTopics = () => portfolioData.talkTopics;

// Generate current date string
export const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });
};
