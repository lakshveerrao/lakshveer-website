import { SEO, PAGE_TITLES } from "@/components/seo";
import { Header } from "@/components/header";
import { useState } from "react";

interface JourneyEntry {
  date: string;
  month: string;
  year: string;
  title: string;
  category: "build" | "pitch" | "recognition" | "workshop" | "media" | "milestone";
  videoId: string;
}

// Full journey data from YouTube channel - chronological
const journeyData: JourneyEntry[] = [
  // 2026
  { date: "20260214", month: "Feb", year: "2026", title: "Kyabol demo (Gemini 3 Hackathon)", category: "build", videoId: "AgvJWdYLMUI" },
  { date: "20260202", month: "Feb", year: "2026", title: "Demo to Shri Somanath ji (Former ISRO Chief)", category: "recognition", videoId: "x9SHIKOnHvY" },
  { date: "20260202", month: "Feb", year: "2026", title: "Demo to Sri Sri Brahmananda Bharati Swamiji", category: "recognition", videoId: "H_s_Sv34ek4" },
  { date: "20260201", month: "Feb", year: "2026", title: "Blessings from Sri Sri Shankara Bharathi Mahaswamiji", category: "recognition", videoId: "wR3WDJB9v_Y" },
  { date: "20260131", month: "Jan", year: "2026", title: "RunTogether Hackathon by Runable", category: "pitch", videoId: "kGENI_zK7kk" },
  { date: "20260131", month: "Jan", year: "2026", title: "Drishtikon Yantra at Vedanta × Param Makeathon", category: "milestone", videoId: "ORPQW1_M-v8" },
  
  // 2025
  { date: "20251126", month: "Nov", year: "2025", title: "Line-Following Maze Robot", category: "build", videoId: "BY95VrwZ9ok" },
  { date: "20251108", month: "Nov", year: "2025", title: "Pitched at South Park Commons", category: "pitch", videoId: "Oxw5T8ZU1RI" },
  { date: "20251108", month: "Nov", year: "2025", title: "The Youngest Founder in the Room", category: "media", videoId: "ZVk1cisMLrg" },
  { date: "20251025", month: "Oct", year: "2025", title: "Circuit Heroes Road Map - The Residency Delta Program", category: "pitch", videoId: "PoFN1Mf0rOo" },
  { date: "20251016", month: "Oct", year: "2025", title: "Day 1 at Delta 2 - The Residency (USA)", category: "milestone", videoId: "RaoAFrpGr6U" },
  { date: "20250925", month: "Sep", year: "2025", title: "League of Components - CircuitHeroes Gameplay", category: "build", videoId: "11YnVOA9vZc" },
  { date: "20250810", month: "Aug", year: "2025", title: "Panel Discussion at August Fest 2025", category: "pitch", videoId: "ZDq-IEbFCXc" },
  { date: "20250727", month: "Jul", year: "2025", title: "Hardware Hackathon by Lion Circuits - Youngest Participant", category: "milestone", videoId: "bparB1aC_Wk" },
  { date: "20250629", month: "Jun", year: "2025", title: "IITEX 2025 at Hitex, Hyderabad", category: "recognition", videoId: "N9Fu9js2Gts" },
  { date: "20250626", month: "Jun", year: "2025", title: "7 Sales Lessons - Kids Business Carnival", category: "pitch", videoId: "oKX4EOO3NAQ" },
  { date: "20250626", month: "Jun", year: "2025", title: "IoT Workshop at IIT Hyderabad", category: "workshop", videoId: "e_bb0p3N3aA" },
  { date: "20250626", month: "Jun", year: "2025", title: "Factory Visit - Clapstore Toys", category: "workshop", videoId: "fPmippfjAtg" },
  { date: "20250624", month: "Jun", year: "2025", title: "Factory & Lab Visits - Pune", category: "workshop", videoId: "nlrQzeuCLdY" },
  { date: "20250624", month: "Jun", year: "2025", title: "Drone Workshop at IIT Hyderabad", category: "workshop", videoId: "4kF5J9M4WXg" },
  { date: "20250615", month: "Jun", year: "2025", title: "3D Printing with Prusa", category: "build", videoId: "IIQFKKJHBzw" },
  { date: "20250614", month: "Jun", year: "2025", title: "Flying Drone with Agam Auto Pilot", category: "build", videoId: "LxEzQklf8iw" },
  { date: "20250513", month: "May", year: "2025", title: "Pro Drone Flight Success", category: "milestone", videoId: "E3jBBPvbA1s" },
  { date: "20250430", month: "Apr", year: "2025", title: "Introduction at T-Hub", category: "pitch", videoId: "u6IeZwbG8uc" },
  { date: "20250425", month: "Apr", year: "2025", title: "Aerolyte Founder Mentorship", category: "recognition", videoId: "-xrTa7I2FHg" },
  { date: "20250424", month: "Apr", year: "2025", title: "Robu Founder Testimonial", category: "recognition", videoId: "Iztx6DofF98" },
  { date: "20250313", month: "Mar", year: "2025", title: "Robot Workshop - 4-channel remote", category: "workshop", videoId: "FtNnj8QtL_o" },
  { date: "20250220", month: "Feb", year: "2025", title: "CircuitHeroes Live Feedback Sessions", category: "build", videoId: "ao1TqViRXsw" },
  { date: "20250219", month: "Feb", year: "2025", title: "Panel Discussion at TTOX 2024", category: "pitch", videoId: "_Uznpm5_KEA" },
  { date: "20250212", month: "Feb", year: "2025", title: "Autonomous Car with 4 Ultrasonic Sensors", category: "build", videoId: "Wu83xHSBc-0" },
  { date: "20250209", month: "Feb", year: "2025", title: "IoT Session at IIT Hyderabad (Techobytes)", category: "workshop", videoId: "NEsjm3l3nq8" },
  { date: "20250206", month: "Feb", year: "2025", title: "Film Crew Interview", category: "media", videoId: "SRXA1wg49ks" },
  { date: "20250117", month: "Jan", year: "2025", title: "Obstacle Avoiding Car with Arduino", category: "build", videoId: "6fcI0t8tay0" },
  
  // 2024
  { date: "20241109", month: "Nov", year: "2024", title: "How to Play CircuitHeroes Card Game", category: "build", videoId: "OofpSb_Oc48" },
  { date: "20241029", month: "Oct", year: "2024", title: "CircuitHeroes Teaser Launch", category: "milestone", videoId: "DpL0nZdJ4xo" },
  { date: "20241014", month: "Oct", year: "2024", title: "CircuitHeroes Card Game Demo", category: "build", videoId: "QiLSDsGsS58" },
  { date: "20240902", month: "Sep", year: "2024", title: "DIY eBook Launch", category: "milestone", videoId: "Wy1cQUijyfA" },
  { date: "20240729", month: "Jul", year: "2024", title: "Obstacle Avoiding Truck", category: "build", videoId: "abRbgCAj-Jw" },
  { date: "20240611", month: "Jun", year: "2024", title: "L298N Motor Controller Course", category: "workshop", videoId: "3LYu3z3fzjQ" },
  { date: "20240604", month: "Jun", year: "2024", title: "First Kid-Conducted Robo Car Workshop", category: "workshop", videoId: "SzJchA8L6HY" },
  { date: "20240527", month: "May", year: "2024", title: "10 Circuit Components Explained", category: "workshop", videoId: "0Y0BLOLPc5g" },
  { date: "20240503", month: "May", year: "2024", title: "Introduction to Robotics for Kids", category: "workshop", videoId: "3Jp7EMU4Adw" },
  { date: "20240420", month: "Apr", year: "2024", title: "Electric Skateboard with DC 775 Motor", category: "build", videoId: "aREtA6lGHUw" },
  { date: "20240328", month: "Mar", year: "2024", title: "Soap Business - Make & Sell", category: "milestone", videoId: "7i16tMeGM-0" },
  { date: "20240320", month: "Mar", year: "2024", title: "Autonomous vs Human-Driven Vehicle Test", category: "build", videoId: "HEFecqL-Vxo" },
  { date: "20240309", month: "Mar", year: "2024", title: "First Business Pitch - DIY Cars", category: "pitch", videoId: "YyhfPQ6x77w" },
  
  // 2023
  { date: "20231224", month: "Dec", year: "2023", title: "Self-Driving Car with Witblox", category: "build", videoId: "sNV6-zMQgQw" },
  { date: "20231212", month: "Dec", year: "2023", title: "DIY Hovercraft with CPU Fan", category: "build", videoId: "d4yqC8wEG1A" },
  { date: "20231126", month: "Nov", year: "2023", title: "DIY Clothes Washer with Cordless Drill", category: "build", videoId: "FSNckQd0JKo" },
  { date: "20231121", month: "Nov", year: "2023", title: "Drill-Powered Bicycle", category: "build", videoId: "sEcY74XkafU" },
  { date: "20231118", month: "Nov", year: "2023", title: "DC Motors Explained", category: "workshop", videoId: "lELBUI_FbKc" },
  { date: "20231106", month: "Nov", year: "2023", title: "First Podcast Episode", category: "media", videoId: "D58JXzPdzcY" },
  { date: "20231101", month: "Nov", year: "2023", title: "4x4 BO Motor Off-Road Car", category: "build", videoId: "BHq3L4KWyNQ" },
  { date: "20231020", month: "Oct", year: "2023", title: "Robotic Table with BO Motors", category: "build", videoId: "CRJisgls0UY" },
  { date: "20231018", month: "Oct", year: "2023", title: "Python + BBC Microbit Programming", category: "build", videoId: "LuWPDUw1bb8" },
  { date: "20230924", month: "Sep", year: "2023", title: "BO Motor Food Crane", category: "build", videoId: "-ae28_BGAn8" },
  { date: "20230922", month: "Sep", year: "2023", title: "Cost & Profit Explained", category: "workshop", videoId: "4Wd-HAns-ok" },
  { date: "20230909", month: "Sep", year: "2023", title: "BO Motors Projects Presentation", category: "pitch", videoId: "aP6oVXIo57Q" },
  
  // 2022 - Early beginnings
  { date: "20220814", month: "Aug", year: "2022", title: "First DC Motor Fan", category: "build", videoId: "Lq64Ev7hLwc" },
  { date: "20220703", month: "Jul", year: "2022", title: "First YouTube Upload - How to Fix Drill Bits", category: "milestone", videoId: "17DZ8AXWz1w" },
];

const categoryColors: Record<string, string> = {
  build: "text-emerald-400",
  pitch: "text-cyan-400",
  recognition: "text-amber-400",
  workshop: "text-violet-400",
  media: "text-rose-400",
  milestone: "text-sky-400",
};

const categoryLabels: Record<string, string> = {
  build: "Build",
  pitch: "Pitch",
  recognition: "Recognition",
  workshop: "Workshop",
  media: "Media",
  milestone: "Milestone",
};

function Journey() {
  const [filter, setFilter] = useState<string | null>(null);
  
  // Group entries by year
  const years = [...new Set(journeyData.map(e => e.year))];
  
  const filteredData = filter 
    ? journeyData.filter(e => e.category === filter)
    : journeyData;
  
  const groupedByYear = years.reduce((acc, year) => {
    const entries = filteredData.filter(e => e.year === year);
    if (entries.length > 0) {
      acc[year] = entries;
    }
    return acc;
  }, {} as Record<string, JourneyEntry[]>);

  return (
    <div className="min-h-screen">
      <SEO title="Journey — Lakshveer Rao" />
      <Header />
      <main className="container-main py-8 md:py-16">
        {/* Page Title */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            The Journey
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-4">
            Select highlights from 170+ documented projects. Every entry links to video proof.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Full archive: <a href="https://www.youtube.com/@ProjectsByLaksh" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:opacity-80">@ProjectsByLaksh ↗</a>
          </p>
          
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setFilter(null)}
              className={`px-3 py-1.5 text-sm border transition-all duration-150 ${
                filter === null 
                  ? "border-[var(--accent)] text-[var(--accent)]" 
                  : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              }`}
            >
              All ({journeyData.length})
            </button>
            {Object.keys(categoryLabels).map(cat => {
              const count = journeyData.filter(e => e.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(filter === cat ? null : cat)}
                  className={`px-3 py-1.5 text-sm border transition-all duration-150 ${
                    filter === cat 
                      ? "border-[var(--accent)] text-[var(--accent)]" 
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {categoryLabels[cat]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-16">
          {Object.keys(groupedByYear).map(year => (
            <section key={year}>
              {/* Year marker */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-mono text-2xl md:text-3xl text-[var(--text-primary)] font-semibold">
                  {year}
                </h2>
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                <span className="font-mono text-sm text-[var(--text-muted)]">
                  {groupedByYear[year].length} entries
                </span>
              </div>
              
              {/* Entries for this year */}
              <div className="space-y-0">
                {groupedByYear[year].map((entry, idx) => (
                  <a
                    key={`${entry.videoId}-${idx}`}
                    href={`https://www.youtube.com/watch?v=${entry.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 py-4 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors duration-150"
                  >
                    {/* Month */}
                    <span className="font-mono text-sm text-[var(--text-muted)] w-10 shrink-0">
                      {entry.month}
                    </span>
                    
                    {/* Category indicator */}
                    <span className={`font-mono text-xs uppercase tracking-wider w-20 shrink-0 ${categoryColors[entry.category]}`}>
                      {categoryLabels[entry.category]}
                    </span>
                    
                    {/* Title */}
                    <span className="flex-1 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-150">
                      {entry.title}
                    </span>
                    
                    {/* Watch link - visible on mobile, fades in on desktop hover */}
                    <span className="text-sm text-[var(--accent)] shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                      Watch ↗
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
        
        {/* Stats summary */}
        <div className="mt-20 pt-12 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="font-mono text-2xl text-[var(--text-primary)] mb-1">{journeyData.length}</div>
              <div className="text-sm text-[var(--text-muted)]">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl text-emerald-400 mb-1">{journeyData.filter(e => e.category === 'build').length}</div>
              <div className="text-sm text-[var(--text-muted)]">Builds</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl text-cyan-400 mb-1">{journeyData.filter(e => e.category === 'pitch').length}</div>
              <div className="text-sm text-[var(--text-muted)]">Pitches</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl text-violet-400 mb-1">{journeyData.filter(e => e.category === 'workshop').length}</div>
              <div className="text-sm text-[var(--text-muted)]">Workshops</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl text-sky-400 mb-1">{journeyData.filter(e => e.category === 'milestone').length}</div>
              <div className="text-sm text-[var(--text-muted)]">Milestones</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl text-[var(--text-primary)] mb-1">{years.length}</div>
              <div className="text-sm text-[var(--text-muted)]">Years Active</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Journey;
