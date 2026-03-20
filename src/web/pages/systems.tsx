import { Link } from "wouter";
import { SEO, PAGE_TITLES } from "@/components/seo";
import { Header } from "@/components/header";

interface SystemEntry {
  id: string;
  title: string;
  description: string;
  links: { label: string; href: string }[];
}

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="link-external text-sm"
  >
    {children}
  </a>
);

// Systems Data - flat list with real links
const systems: SystemEntry[] = [
  {
    id: "kyabol",
    title: "Kyabol",
    description: "AI-powered conversational system built for Gemini 3 Hackathon.",
    links: [
      { label: "Demo", href: "https://www.youtube.com/watch?v=AgvJWdYLMUI" },
    ],
  },
  {
    id: "hardvare",
    title: "Hardvare",
    description: "Hardware execution platform preventing unsafe wiring and invalid logic states.",
    links: [
      { label: "GitHub", href: "https://github.com/lakshveerrao" },
    ],
  },
  {
    id: "circuitheroes",
    title: "CircuitHeroes",
    description: "Circuit-building trading card game. 300+ decks shipped.",
    links: [
      { label: "Website", href: "https://circuitheroes.com" },
      { label: "Gameplay Demo", href: "https://www.youtube.com/watch?v=11YnVOA9vZc" },
    ],
  },
  {
    id: "drishtikon-yantra",
    title: "Drishtikon Yantra",
    description: "Vision-based assistive device. Special Mention at Vedanta x Param Makeathon.",
    links: [
      { label: "Demo", href: "https://www.youtube.com/watch?v=ORPQW1_M-v8" },
    ],
  },
  {
    id: "line-robot",
    title: "Line-Following Maze Robot",
    description: "Autonomous navigation robot with sensor array for maze solving.",
    links: [
      { label: "Demo", href: "https://www.youtube.com/watch?v=BY95VrwZ9ok" },
    ],
  },
  {
    id: "grant-agent",
    title: "Autonomous Grant Agent",
    description: "AI agent sourcing and filing global grants autonomously using OpenClaw.",
    links: [
      { label: "X Thread", href: "https://x.com/CaptVenk/status/2020894740473135460" },
    ],
  },
  {
    id: "motion",
    title: "Motion-Control Gaming Platform",
    description: "Full-body measurable gaming system driven by real movement.",
    links: [
      { label: "Demo", href: "https://motionx.runable.site/" },
    ],
  },
  {
    id: "vision",
    title: "Vision-Based Robotics",
    description: "OpenCV and TensorFlow Lite deployments on edge devices.",
    links: [
      { label: "GitHub", href: "https://github.com/lakshveerrao" },
    ],
  },
  {
    id: "navigation",
    title: "Autonomous Navigation Systems",
    description: "GPS-guided and gesture-controlled robotic vehicles.",
    links: [
      { label: "Demo", href: "https://www.youtube.com/watch?v=Wu83xHSBc-0" },
    ],
  },
  {
    id: "firstclue",
    title: "IdeasByKids / FirstClue",
    description: "AI system decoding children's ideas into structured development insights.",
    links: [
      { label: "Website", href: "https://chhotacreator.com" },
    ],
  },
];

function Systems() {
  return (
    <div className="min-h-screen">
      <SEO title={PAGE_TITLES.systems} />
      <Header />
      <main className="container-main py-8 md:py-16">
        {/* Page Title */}
        <div className="mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Systems
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Engineering-first systems across robotics, edge AI, autonomous agents, and hardware execution platforms.
          </p>
        </div>

        {/* Systems List - Flat, no categories */}
        <div className="space-y-0">
          {systems.map((system) => (
            <article 
              key={system.id}
              id={system.id}
              className="py-6 border-b border-[var(--border-subtle)] group scroll-mt-24"
            >
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 md:gap-8">
                {/* Title and description */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                    {system.title}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm md:text-base">
                    {system.description}
                  </p>
                </div>
                
                {/* Links */}
                <div className="flex items-center gap-6 shrink-0">
                  {system.links.map((link) => (
                    <ExternalLink key={link.label} href={link.href}>
                      {link.label}
                    </ExternalLink>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Systems;
