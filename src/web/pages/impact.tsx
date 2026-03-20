import { SEO, PAGE_TITLES } from "@/components/seo";
import { Header } from "@/components/header";

interface ImpactEntry {
  title: string;
  organization?: string;
  link?: { label: string; href: string };
}

interface ImpactCategory {
  name: string;
  entries: ImpactEntry[];
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

// Impact Data with real links
const impactCategories: ImpactCategory[] = [
  {
    name: "Hackathons",
    entries: [
      {
        title: "Top-5 Finalist (Youngest Participant)",
        organization: "Hardware Hackathon 2.0 — LionCircuits × PCB Cupid",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=bparB1aC_Wk" },
      },
      {
        title: "Participated (Youngest)",
        organization: "Hardware Hackathon 1.0 — LionCircuits × PCB Cupid",
        link: { label: "View", href: "https://x.com/LionCircuits/status/1950132910667026934" },
      },
      {
        title: "Finalist (Youngest)",
        organization: "VibeHack — Emergent",
        link: { label: "View", href: "https://x.com/CaptVenk/status/2000206808917623033" },
      },
      {
        title: "Special Mention Winner",
        organization: "RunTogether Hackathon — Runable",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=kGENI_zK7kk" },
      },
      {
        title: "Youngest Innovator & Special Mention Winner",
        organization: "Makeathon — Param Foundation × Vedanta",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=ORPQW1_M-v8" },
      },
      {
        title: "Participated",
        organization: "Gemini 3 Hackathon — Cerebral Valley × Google DeepMind",
        link: { label: "Demo", href: "https://www.youtube.com/watch?v=AgvJWdYLMUI" },
      },
    ],
  },
  {
    name: "Pitches",
    entries: [
      {
        title: "Pitched Circuit Heroes",
        organization: "South Park Commons",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=Oxw5T8ZU1RI" },
      },
      {
        title: "Pitched",
        organization: "AI Collective Hyderabad",
        link: { label: "View", href: "https://x.com/CaptVenk/status/1984589350450188397" },
      },
      {
        title: "Pitched at VibeHack",
        organization: "Emergent",
        link: { label: "View", href: "https://x.com/CaptVenk/status/2000205469705797695" },
      },
      {
        title: "Pitched at RunTogether",
        organization: "Runable",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=kGENI_zK7kk" },
      },
      {
        title: "Introduced at T-Hub",
        organization: "T-Hub Hyderabad",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=u6IeZwbG8uc" },
      },
    ],
  },
  {
    name: "Accelerators & Programs",
    entries: [
      {
        title: "Selected (Youngest Founder)",
        organization: "Delta-2 Cohort — The Residency (USA)",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=PoFN1Mf0rOo" },
      },
    ],
  },
  {
    name: "Competition Wins & Recognition",
    entries: [
      {
        title: "Youngest Participant & Special Winner",
        organization: "Yugantar Tech Fest — Scaler School of Technology, Bengaluru",
        link: { label: "View", href: "https://x.com/CaptVenk/status/1994709956906684543" },
      },
      {
        title: "Special Invite",
        organization: "Robotics & Hardware Founders Meet",
        link: { label: "View", href: "https://x.com/LionCircuits/status/1950132910667026934" },
      },
      {
        title: "Panel Speaker",
        organization: "August Fest 2025",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=ZDq-IEbFCXc" },
      },
      {
        title: "Demo to Former ISRO Chief",
        organization: "Shri Somanath ji",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=x9SHIKOnHvY" },
      },
    ],
  },
  {
    name: "Partnerships",
    entries: [
      {
        title: "Co-creation Agreement",
        organization: "Lion Circuits",
        link: { label: "View", href: "https://x.com/LionCircuits/status/1950132910667026934" },
      },
    ],
  },
  {
    name: "Competitions (Advanced Rounds)",
    entries: [
      {
        title: "Shortlisted",
        organization: "Shark Tank India S5 (Level 2)",
      },
      {
        title: "Shortlisted",
        organization: "ISF Junicorns (Level 3)",
      },
    ],
  },
  {
    name: "Grants & Scholarships",
    entries: [
      {
        title: "₹1,00,000 Grant",
        organization: "Malpani Ventures",
        link: { label: "View", href: "https://malpaniventures.com" },
      },
      {
        title: "Grants",
        organization: "AI Grants India",
        link: { label: "View", href: "https://aigrants.in" },
      },
      {
        title: "₹40,000 Creator Micro-Scholarship",
        link: { label: "View", href: "https://x.com/ramsri_goutham/status/1931942764004192611" },
      },
    ],
  },
  {
    name: "Media",
    entries: [
      {
        title: "Feature Story",
        organization: "Beats in Brief",
        link: { label: "Read", href: "https://beatsinbrief.com/2026/01/11/lakshveer-rao-8-year-old-hardware-startup-founder-india/" },
      },
      {
        title: "Covered twice",
        organization: "Runtime Magazine",
        link: { label: "Watch", href: "https://www.instagram.com/reel/DQJ34sdjxA0/" },
      },
      {
        title: "Feature",
        organization: "ThinkTac",
        link: { label: "Watch", href: "https://www.youtube.com/watch?v=8qmvDz-TJTE" },
      },
      {
        title: "Coverage",
        organization: "Maverick News",
        link: { label: "Read", href: "https://mavericknews30.com/?p=103498" },
      },
    ],
  },
];

function Impact() {
  return (
    <div className="min-h-screen">
      <SEO title={PAGE_TITLES.impact} />
      <Header />
      <main className="container-main py-8 md:py-16">
        {/* Page Title */}
        <div className="mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Impact
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Real-world outcomes across grants, awards, panels, workshops, product sales, and media coverage.
          </p>
        </div>

        {/* Impact Categories */}
        <div className="space-y-12 md:space-y-16">
          {impactCategories.map((category) => (
            <section key={category.name}>
              <h2 className="text-lg md:text-xl font-semibold mb-6 text-[var(--text-primary)] pb-3 border-b border-[var(--border-subtle)]">
                {category.name}
              </h2>
              <div className="space-y-0">
                {category.entries.map((entry, idx) => (
                  <article
                    key={`${entry.title}-${idx}`}
                    className="py-4 border-b border-[var(--border-subtle)] last:border-b-0"
                  >
                    {/* Main entry line - ledger style */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {entry.title}
                        </span>
                        {entry.organization && (
                          <>
                            <span className="hidden sm:inline text-[var(--text-secondary)] mx-3">—</span>
                            <span className="text-[var(--text-secondary)]">
                              {entry.organization}
                            </span>
                          </>
                        )}
                      </div>

                      {/* External link */}
                      {entry.link && (
                        <div className="shrink-0">
                          <ExternalLink href={entry.link.href}>
                            {entry.link.label}
                          </ExternalLink>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Impact;
