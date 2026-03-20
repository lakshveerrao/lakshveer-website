import { useState } from "react";
import { SEO } from "@/components/seo";
import { Header } from "@/components/header";
import { portfolioData, getCurrentDate } from "@/data/portfolio";

// ── All media mentions ────────────────────────────────────────────────

type MentionType = "media" | "company" | "founder" | "community";

interface MediaMention {
  name: string;
  handle: string;
  type: MentionType;
  quote: string;
  url: string;
  context: string;
  platform: "article" | "linkedin" | "instagram" | "youtube" | "twitter" | "reddit" | "website";
}

const PLATFORM_ICON: Record<MediaMention["platform"], string> = {
  article:   "📰",
  linkedin:  "💼",
  instagram: "📸",
  youtube:   "▶️",
  twitter:   "𝕏",
  reddit:    "🗨️",
  website:   "🌐",
};

const ALL_MENTIONS: MediaMention[] = [
  // ── Press / Article ──
  {
    name: "Financial Express",
    handle: "financialexpress.com",
    type: "media",
    quote: "Meet Lakshveer — the 8-year-old who created an AI agent to control devices via Telegram messaging.",
    url: "https://www.financialexpress.com/life/technology-meet-lakshveer-the-8-year-old-who-created-an-ai-agent-to-control-devices-via-telegram-messaging-4159964/",
    context: "Feature Article",
    platform: "article",
  },
  {
    name: "StartupPedia",
    handle: "startuppedia.in",
    type: "media",
    quote: "Meet 8-year-old Lakshveer who created an AI agent to control devices via Telegram messaging.",
    url: "https://startuppedia.in/trending/meet-8-year-old-lakshveer-who-created-an-ai-agent-to-control-devices-via-telegram-messaging-11212926",
    context: "Feature Article",
    platform: "article",
  },
  {
    name: "Beats in Brief",
    handle: "beatsinbrief.com",
    type: "media",
    quote: "Eight-year-old Lakshveer Rao is India's youngest hardware startup founder, building and shipping real products through Projects by Laksh.",
    url: "https://beatsinbrief.com/2026/01/11/lakshveer-rao-8-year-old-hardware-startup-founder-india/",
    context: "Feature Article",
    platform: "article",
  },
  {
    name: "Medium",
    handle: "Sharav Arora",
    type: "media",
    quote: "Lakshveer's story is more than just a tale of technical genius — it is a testament to the power of curiosity, hands-on experience, and supportive mentorship.",
    url: "https://medium.com/@sharavarora80/meet-indias-8-year-old-tech-wunderkind-how-lakshveer-rao-is-redefining-childhood-innovation-9b76c12da34e",
    context: "Feature Article",
    platform: "article",
  },
  {
    name: "Jagran Josh",
    handle: "jagranjosh.com",
    type: "media",
    quote: "Lakshveer Rao featured at Yugaantar 2025 — student-led festival blending technology, competition, and culture.",
    url: "https://www.jagranjosh.com/articles/yugaantar-2025-student-led-festival-at-sst-blends-technology-competition-and-culture-1800007602-1",
    context: "Event Coverage",
    platform: "article",
  },
  {
    name: "Chekodi",
    handle: "chekodi.com",
    type: "media",
    quote: "Meet Lakshveer Rao — just 8 years old, hardware startup founder from India.",
    url: "https://chekodi.com/p/meet-lakshveer-rao-just-8-years-age-lo-hardware-s-96384",
    context: "Feature Article",
    platform: "article",
  },
  // ── LinkedIn ──
  {
    name: "RediMinds",
    handle: "rediminds",
    type: "media",
    quote: "8-year-old built an ESP32 agent that codes. This is what the future of hardware + AI looks like.",
    url: "https://www.linkedin.com/posts/rediminds_8-year-old-built-an-esp32-agent-that-codes-activity-7434258624761446400-gHOS/",
    context: "LinkedIn Feature",
    platform: "linkedin",
  },
  {
    name: "Somi AI",
    handle: "somi-ai",
    type: "media",
    quote: "An 8-year-old just built an AI agent that controls real hardware via Telegram. That's Lakshveer Rao.",
    url: "https://www.linkedin.com/posts/somi-ai_an-8-year-old-just-built-an-ai-agent-that-activity-7434205969292914688-fRzB/",
    context: "LinkedIn Feature",
    platform: "linkedin",
  },
  {
    name: "StartupPedia",
    handle: "startup-pedia",
    type: "media",
    quote: "Lakshveer Rao — India's youngest AI agent builder, featured on StartupPedia LinkedIn.",
    url: "https://www.linkedin.com/posts/startup-pedia_startuppedia-startupjourney-startupbusiness-activity-7439228289589809153-0HOY/",
    context: "LinkedIn Feature",
    platform: "linkedin",
  },
  {
    name: "StartupG",
    handle: "startup-g",
    type: "media",
    quote: "Lakshveer Rao featured in StartupG's AI builder roundup.",
    url: "https://www.linkedin.com/posts/startup-g_startupg-ai-activity-7439599135026130944-_H9l/",
    context: "LinkedIn Feature",
    platform: "linkedin",
  },
  {
    name: "Dileep Gupta",
    handle: "dileep-gupta-aa19a133",
    type: "founder",
    quote: "8-year-old Lakshveer Rao is India's youngest hardware startup founder. He is the co-founder of Projects by Laksh and the creator of Circuit Heroes.",
    url: "https://www.linkedin.com/posts/dileep-gupta-aa19a133_india-hardware-activity-7416424030334791681-TXVf/",
    context: "LinkedIn Post",
    platform: "linkedin",
  },
  {
    name: "Param Foundation",
    handle: "inavamsi",
    type: "company",
    quote: "Met this 8-year-old Lakshveer in our hackathon and was blown away by his hardware depth.",
    url: "https://www.linkedin.com/posts/inavamsi_met-this-8-year-old-lakshveer-in-our-hackathon-activity-7418284045475659776-zoBR/",
    context: "LinkedIn Post",
    platform: "linkedin",
  },
  {
    name: "Scaler Innovation Lab",
    handle: "scaler-innovation-lab",
    type: "company",
    quote: "200 teams signed up. Only 8 made it to the finals — Lakshveer was one of them.",
    url: "https://www.linkedin.com/posts/scaler-innovation-lab_200-teams-signed-up-only-8-made-it-to-the-activity-7409521660606722048-wGu0/",
    context: "Hackathon Finalist",
    platform: "linkedin",
  },
  {
    name: "Polaris School of Technology",
    handle: "polaris-school-of-technology",
    type: "company",
    quote: "7-year-old hacker at VibeHack — Lakshveer is the youngest builder we've ever hosted.",
    url: "https://www.linkedin.com/posts/polaris-school-of-technology_hackathon-7yearsoldhacker-vibehack-activity-7406303087159726080-ial5/",
    context: "VibeHack Hackathon",
    platform: "linkedin",
  },
  // ── Instagram ──
  {
    name: "StartupPedia",
    handle: "@startup.pedia",
    type: "media",
    quote: "Lakshveer's AI agent that controls devices via Telegram — making waves in India's startup ecosystem.",
    url: "https://www.instagram.com/startup.pedia/reel/DV8FhcWCUgf/",
    context: "Instagram Reel",
    platform: "instagram",
  },
  {
    name: "StartupPedia",
    handle: "@startup.pedia",
    type: "media",
    quote: "8-year-old Lakshveer Rao — builder, founder, AI engineer.",
    url: "https://www.instagram.com/p/DVYJ8mYCFpv/",
    context: "Instagram Feature",
    platform: "instagram",
  },
  {
    name: "StartupNews.fyi",
    handle: "@startupnewsfyi",
    type: "media",
    quote: "India's Youngest Hardware Founder Is Only 8 Years Old. Lakshveer Rao built Marcy, a wrist companion for astronauts.",
    url: "https://www.instagram.com/reel/DTPcKnvEany/",
    context: "Instagram Reel",
    platform: "instagram",
  },
  {
    name: "Instagram Feature",
    handle: "Instagram",
    type: "media",
    quote: "Lakshveer Rao — AI agent builder at 8 years old.",
    url: "https://www.instagram.com/reel/DWAQpAlARG4/",
    context: "Instagram Reel",
    platform: "instagram",
  },
  {
    name: "Instagram Feature",
    handle: "Instagram",
    type: "media",
    quote: "Hardware + AI builder Lakshveer Rao featured on Instagram.",
    url: "https://www.instagram.com/p/DWDmWYFEWlP/",
    context: "Instagram Feature",
    platform: "instagram",
  },
  {
    name: "Instagram Feature",
    handle: "Instagram",
    type: "media",
    quote: "Lakshveer's builder journey covered across Instagram.",
    url: "https://www.instagram.com/reel/DV-dalvE5xw/",
    context: "Instagram Reel",
    platform: "instagram",
  },
  {
    name: "Instagram Feature",
    handle: "Instagram",
    type: "media",
    quote: "AI + hardware projects by Lakshveer Rao — covered on Instagram.",
    url: "https://www.instagram.com/reel/DV-t-LUgVLj/",
    context: "Instagram Reel",
    platform: "instagram",
  },
  {
    name: "Lion Circuits",
    handle: "@lioncircuits",
    type: "company",
    quote: "Say hello to Lakshveer Rao, the 8-year-old genius who turned heads at our Hardware Hackathon 1.0!",
    url: "https://www.instagram.com/reel/DMr-2tdss7-/",
    context: "Instagram Feature",
    platform: "instagram",
  },
  {
    name: "Instagram Feature",
    handle: "Instagram",
    type: "media",
    quote: "Lakshveer Rao builder feature on Instagram.",
    url: "https://www.instagram.com/p/DTbGXAzkyWf/",
    context: "Instagram Feature",
    platform: "instagram",
  },
  // ── YouTube ──
  {
    name: "ThinkTac",
    handle: "@think_tac",
    type: "media",
    quote: "Meet Lakshveer Rao at ThinkTac! A bright and curious Grade 2 student who loves exploring how things work!",
    url: "https://www.youtube.com/watch?v=8qmvDz-TJTE",
    context: "YouTube Feature",
    platform: "youtube",
  },
  {
    name: "Projects by Laksh",
    handle: "@ProjectsByLaksh",
    type: "media",
    quote: "YouTube Short — Lakshveer's AI Telegram agent demo. ESP32 controlled via messaging.",
    url: "https://m.youtube.com/shorts/tMkS4K1L5I4",
    context: "YouTube Short",
    platform: "youtube",
  },
  {
    name: "Projects by Laksh",
    handle: "@ProjectsByLaksh",
    type: "media",
    quote: "YouTube Short — Latest hardware + AI build demo by Lakshveer Rao.",
    url: "https://www.youtube.com/shorts/CMLBWDSIxlY",
    context: "YouTube Short",
    platform: "youtube",
  },
  {
    name: "Projects by Laksh",
    handle: "@ProjectsByLaksh",
    type: "media",
    quote: "Full YouTube feature — Lakshveer Rao complete build walkthrough.",
    url: "https://www.youtube.com/watch?v=l6gvC81Ql10",
    context: "YouTube Feature",
    platform: "youtube",
  },
  // ── Twitter/X ──
  {
    name: "Lion Circuits",
    handle: "@LionCircuits",
    type: "company",
    quote: "An 8-year-old just schooled us all at Hardware Hackathon 1.0. Lakshveer Rao built a hydration assistant using a Glyph board + sensor.",
    url: "https://x.com/LionCircuits/status/1950132910667026934",
    context: "Hardware Hackathon",
    platform: "twitter",
  },
  {
    name: "Runable",
    handle: "@runable_hq",
    type: "company",
    quote: "An 8-year-old showed up and built. That alone changed what we thought was possible.",
    url: "https://x.com/runable_hq/status/2018337544975646832",
    context: "RunTogether Hackathon",
    platform: "twitter",
  },
  {
    name: "Together",
    handle: "@scaletogether",
    type: "company",
    quote: "Full body Motion Gaming built by Laksh (our youngest builder, all of 8yrs old) at #RunTogether Hackathon.",
    url: "https://x.com/scaletogether/status/2018556342282453396",
    context: "RunTogether Hackathon",
    platform: "twitter",
  },
  {
    name: "Adil Mania",
    handle: "@adilmania",
    type: "founder",
    quote: "Lakshveer Rao featured — India's youngest AI + hardware builder.",
    url: "https://x.com/adilmania/status/1998158073027043345",
    context: "Twitter Feature",
    platform: "twitter",
  },
  {
    name: "Beats in Brief",
    handle: "@beatsinbrief",
    type: "media",
    quote: "Young Generation of India is growing up as builders. Meet Lakshveer Rao: India's youngest hardware startup founder.",
    url: "https://x.com/beatsinbrief/status/2010345060362301515",
    context: "Twitter Feature",
    platform: "twitter",
  },
  {
    name: "Ramsri Goutham",
    handle: "@ramsri_goutham",
    type: "founder",
    quote: "Lakshveer — He is a 7yr old builder working on hands-on tech and robotics projects along with his dad.",
    url: "https://x.com/ramsri_goutham/status/1929432690954215762",
    context: "Micro Scholarship",
    platform: "twitter",
  },
  {
    name: "Roohi Kirit",
    handle: "@roohi_kr",
    type: "founder",
    quote: "4 folks/founders I am really bullish on... Laksh of Circuit Heroes. Each of these people has been building in public.",
    url: "https://x.com/roohi_kr/status/1907424206075330926",
    context: "Builder Spotlight",
    platform: "twitter",
  },
  {
    name: "Shantanu Goel",
    handle: "@shantanugoel",
    type: "founder",
    quote: "Just bought @CaptVenk and Laksh's Circuit Heroes card game on Amazon. This should be great for introducing kids to components!",
    url: "https://x.com/shantanugoel/status/1982027217690579157",
    context: "Circuit Heroes",
    platform: "twitter",
  },
  // ── Reddit ──
  {
    name: "Reddit r/IndiaTech",
    handle: "r/IndiaTech",
    type: "community",
    quote: "The rise of AI kids and vibe-coding prodigies in India — Lakshveer featured in community discussion.",
    url: "https://www.reddit.com/r/IndiaTech/comments/1rpvm71/the_rise_of_ai_kids_and_vibecoding_prodigies_in/",
    context: "Reddit Community",
    platform: "reddit",
  },
  {
    name: "Reddit r/india",
    handle: "r/india",
    type: "community",
    quote: "Most Indian builders go through these 3 phases — community discussion featuring Lakshveer.",
    url: "https://www.reddit.com/r/india/comments/1ru8mqz/most_indian_builders_go_through_these_3_ph/",
    context: "Reddit Community",
    platform: "reddit",
  },
  // ── August Fest / Website ──
  {
    name: "August Fest 2025",
    handle: "theaugustfest.com",
    type: "company",
    quote: "Lakshveer is the co-founder of Projects by Laksh, Circuit Heroes, and Chhota Creator. He is a 7-year-old builder who has already shipped real products.",
    url: "https://theaugustfest.com/speaker/r-lakshveer-rao/",
    context: "Featured Speaker",
    platform: "website",
  },
  {
    name: "The Residency",
    handle: "@theresidency",
    type: "company",
    quote: "Meet the youngest founder ever currently in our Delta Chapter II cohort: Lakshveer Rao.",
    url: "https://www.linkedin.com/posts/live-the-residency_meet-the-youngest-founder-ever-currently-activity-7386778374008057857-S8Wm",
    context: "Delta Chapter II",
    platform: "linkedin",
  },
];

// ── Editorial story cards (top 5 biggest hits) ───────────────────────
const TOP_STORIES = [
  {
    outlet: "Financial Express",
    headline: "Meet Lakshveer — the 8-year-old who built an AI agent to control devices via Telegram",
    tag: "National Press",
    url: "https://www.financialexpress.com/life/technology-meet-lakshveer-the-8-year-old-who-created-an-ai-agent-to-control-devices-via-telegram-messaging-4159964/",
  },
  {
    outlet: "StartupPedia",
    headline: "8-year-old Lakshveer created an AI agent to control devices via Telegram messaging",
    tag: "Startup Media",
    url: "https://startuppedia.in/trending/meet-8-year-old-lakshveer-who-created-an-ai-agent-to-control-devices-via-telegram-messaging-11212926",
  },
  {
    outlet: "Reddit r/IndiaTech",
    headline: "The rise of AI kids and vibe-coding prodigies in India",
    tag: "Community",
    url: "https://www.reddit.com/r/IndiaTech/comments/1rpvm71/the_rise_of_ai_kids_and_vibecoding_prodigies_in/",
  },
  {
    outlet: "Beats in Brief",
    headline: "India's youngest hardware startup founder — building and shipping real products at age 8",
    tag: "Feature Story",
    url: "https://beatsinbrief.com/2026/01/11/lakshveer-rao-8-year-old-hardware-startup-founder-india/",
  },
  {
    outlet: "Scaler Innovation Lab",
    headline: "200 teams signed up. Only 8 made it to the finals. Lakshveer was one of them.",
    tag: "Hackathon",
    url: "https://www.linkedin.com/posts/scaler-innovation-lab_200-teams-signed-up-only-8-made-it-to-the-activity-7409521660606722048-wGu0/",
  },
];

type FilterType = "all" | MentionType;

const TYPE_LABELS: Record<FilterType, string> = {
  all: "All",
  media: "Press & Media",
  company: "Companies",
  founder: "Founders",
  community: "Community",
};

const PLATFORM_LABEL: Record<MediaMention["platform"], string> = {
  article: "Article",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  twitter: "X / Twitter",
  reddit: "Reddit",
  website: "Website",
};

export default function Press() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [platform, setPlatform] = useState<"all" | MediaMention["platform"]>("all");

  const filtered = ALL_MENTIONS.filter(m => {
    const typeMatch = filter === "all" || m.type === filter;
    const platformMatch = platform === "all" || m.platform === platform;
    return typeMatch && platformMatch;
  });

  const platforms = Array.from(new Set(ALL_MENTIONS.map(m => m.platform)));

  return (
    <div className="min-h-screen">
      <SEO
        title="Press & Media | Lakshveer Rao"
        description="Media coverage, press mentions, and social proof for Lakshveer Rao — India's youngest hardware and AI builder."
      />
      <Header />

      <main className="container-main py-8 md:py-16">

        {/* ── Hero ── */}
        <div className="mb-16">
          <p className="text-sm text-[var(--accent)] font-medium tracking-wide uppercase mb-3">Press & Media</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5 leading-[1.1]">
            The world is watching.
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed">
            National press, startup media, LinkedIn, YouTube, Reddit — coverage across every major platform.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div id="coverage" className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border-subtle)] border border-[var(--border-subtle)] mb-16">
          {[
            { value: `${ALL_MENTIONS.length}+`, label: "Total Mentions" },
            { value: "16+", label: "Publications & Outlets" },
            { value: "7", label: "Platforms" },
            { value: "3", label: "Countries" },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--bg)] px-6 py-6 text-center">
              <p className="text-3xl md:text-4xl font-semibold text-[var(--accent)] mb-1">{stat.value}</p>
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Top Stories ── */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-8">Top Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOP_STORIES.map((story, i) => (
              <a
                key={i}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 transition-all duration-200 ${i === 0 ? "md:col-span-2" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wide px-2 py-1 bg-[var(--accent)]/10 rounded">
                    {story.tag}
                  </span>
                  <span className="text-[var(--text-muted)] text-xs">{story.outlet}</span>
                </div>
                <p className={`font-medium leading-snug group-hover:text-[var(--accent)] transition-colors ${i === 0 ? "text-xl" : "text-base"}`}>
                  {story.headline}
                </p>
                <p className="text-[var(--text-muted)] text-xs mt-3 group-hover:text-[var(--text-secondary)] transition-colors">
                  Read coverage ↗
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* ── All mentions wall ── */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">All Coverage <span className="text-[var(--text-muted)] font-normal text-lg">({filtered.length})</span></h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(["all", "media", "company", "founder", "community"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm border transition-all duration-150 ${
                  filter === f
                    ? "bg-[var(--accent)]/10 border-[var(--accent)]/40 text-[var(--accent)]"
                    : "bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                {TYPE_LABELS[f]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setPlatform("all")}
              className={`px-3 py-1 text-xs border transition-all duration-150 ${platform === "all" ? "bg-[var(--bg-elevated)] border-[var(--text-muted)] text-[var(--text-primary)]" : "bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"}`}
            >
              All platforms
            </button>
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1 text-xs border transition-all duration-150 ${platform === p ? "bg-[var(--bg-elevated)] border-[var(--text-muted)] text-[var(--text-primary)]" : "bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"}`}
              >
                {PLATFORM_ICON[p]} {PLATFORM_LABEL[p]}
              </button>
            ))}
          </div>

          {/* Masonry-style mention cards */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
            {filtered.map((mention, i) => (
              <a
                key={i}
                href={mention.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block mb-4 break-inside-avoid p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all duration-200"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-sm">{mention.name}</p>
                    <p className="text-[var(--text-muted)] text-xs">{mention.handle}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-base">{PLATFORM_ICON[mention.platform]}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 border ${
                      mention.type === "media"    ? "border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent)]/5" :
                      mention.type === "company"  ? "border-purple-500/30 text-purple-400 bg-purple-500/5" :
                      mention.type === "founder"  ? "border-amber-500/30 text-amber-400 bg-amber-500/5" :
                                                    "border-zinc-600 text-zinc-400 bg-zinc-800/50"
                    }`}>
                      {mention.type}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3 group-hover:text-[var(--text-primary)] transition-colors">
                  "{mention.quote}"
                </p>

                {/* Context */}
                <p className="text-xs text-[var(--text-muted)]">
                  {mention.context} ↗
                </p>
              </a>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--text-muted)]">
              No mentions match this filter.
            </div>
          )}
        </section>

        {/* ── Press Kit section (existing content) ── */}
        <div className="border-t border-[var(--border-subtle)] pt-16">
          <h2 className="text-2xl font-semibold mb-10">Press Kit</h2>

          {/* Quick Copy */}
          <section className="mb-12">
            <h3 className="text-lg font-semibold mb-5 text-[var(--text-secondary)]">Quick Copy</h3>
            <div className="space-y-3">
              <CopyBlock label="One-Liner" text={portfolioData.oneLiner} />
              <CopyBlock
                label="Short Bio (50 words)"
                text={`${portfolioData.name} is an ${portfolioData.age}-year-old hardware and AI builder from ${portfolioData.location}. Co-founder of Projects by Laksh, he has shipped ${portfolioData.stats.productsShipped} products including CircuitHeroes (a circuit-building card game with 300+ sales and registered trademark), secured ${portfolioData.stats.grantsReceived} in grants, and documented ${portfolioData.stats.projectsDocumented} projects.`}
              />
            </div>
          </section>

          {/* Key Numbers */}
          <section className="mb-12">
            <h3 className="text-lg font-semibold mb-5 text-[var(--text-secondary)]">Key Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--border-subtle)] border border-[var(--border-subtle)]">
              {[
                { label: "Age", value: `${portfolioData.age}` },
                { label: "Products Shipped", value: portfolioData.stats.productsShipped },
                { label: "Projects Documented", value: portfolioData.stats.projectsDocumented },
                { label: "Grants Received", value: portfolioData.stats.grantsReceived },
                { label: "Ebook Sales", value: portfolioData.stats.ebookSales },
                { label: "Trademarks", value: portfolioData.stats.trademarksOwned },
              ].map(s => (
                <div key={s.label} className="bg-[var(--bg)] px-5 py-4">
                  <p className="text-xl font-semibold">{s.value}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Assets */}
          <section className="mb-12">
            <h3 className="text-lg font-semibold mb-5 text-[var(--text-secondary)]">Assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/qr-code.png" download className="p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-colors text-center">
                <img src="/qr-code.png" alt="QR" className="w-16 h-16 mx-auto mb-3" />
                <p className="font-medium text-sm">QR Code</p>
                <p className="text-xs text-[var(--text-muted)]">PNG · High Res</p>
              </a>
              <a href="/og-image.png" download className="p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-colors text-center">
                <img src="/og-image.png" alt="OG" className="w-full max-w-[160px] h-auto mx-auto mb-3 rounded" />
                <p className="font-medium text-sm">Social Image</p>
                <p className="text-xs text-[var(--text-muted)]">1200×630 · OG Ready</p>
              </a>
              <a href="/api/portfolio.pdf" target="_blank" className="p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-colors text-center flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">📄</span>
                <p className="font-medium text-sm">Portfolio PDF</p>
                <p className="text-xs text-[var(--text-muted)]">One-page summary</p>
              </a>
            </div>
          </section>

          {/* Media Inquiries */}
          <section className="p-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center">
            <h3 className="text-lg font-semibold mb-2">Media Inquiries</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-5">For interviews, quotes, or additional information:</p>
            <p className="font-semibold">{portfolioData.contact.primary.name}</p>
            <p className="text-[var(--text-secondary)] text-sm mb-4">{portfolioData.contact.primary.role}</p>
            <div className="flex justify-center gap-6">
              <a href={`https://x.com/${portfolioData.contact.primary.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:opacity-80 text-sm">
                {portfolioData.contact.primary.twitter} ↗
              </a>
              <a href={portfolioData.contact.primary.linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:opacity-80 text-sm">
                LinkedIn ↗
              </a>
            </div>
          </section>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-12">
          Last updated: {getCurrentDate()} · All mentions verified
        </p>
      </main>
    </div>
  );
}

// ── Helper: Copy block ────────────────────────────────────────────────
function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-muted)] font-medium">{label}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="text-xs text-[var(--accent)] hover:opacity-80 transition-opacity"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{text}</p>
    </div>
  );
}
