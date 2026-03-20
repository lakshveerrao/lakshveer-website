import { useState, useMemo } from "react";
import { SEO } from "@/components/seo";
import { Header } from "@/components/header";
import { ShareEndorsementModal, EndorsementShareButton } from "@/components/share-endorsement-modal";

interface Mention {
  author: string;
  authorName: string;
  authorType: "company" | "founder" | "media" | "educator" | "builder";
  quote: string;
  url: string;
  context: string;
}

// Real social mentions - all verifiable on X, LinkedIn, Medium, and other platforms
const mentions: Mention[] = [
  // Companies
  {
    author: "@LionCircuits",
    authorName: "Lion Circuits",
    authorType: "company",
    quote: "An 8-year-old just schooled us all at Hardware Hackathon 1.0. Lakshveer Rao built a hydration assistant using a Glyph board + sensor.",
    url: "https://x.com/LionCircuits/status/1950132910667026934",
    context: "Hardware Hackathon 1.0"
  },
  {
    author: "@lioncircuits",
    authorName: "Lion Circuits",
    authorType: "company",
    quote: "Say hello to Lakshveer Rao, the 8-year-old genius who turned heads at our Hardware Hackathon 1.0!",
    url: "https://www.instagram.com/reel/DMr-2tdss7-/",
    context: "Instagram Feature"
  },
  {
    author: "@theresidency",
    authorName: "The Residency",
    authorType: "company",
    quote: "Meet the youngest founder ever currently in our Delta Chapter II cohort: Lakshveer Rao.",
    url: "https://www.linkedin.com/posts/live-the-residency_meet-the-youngest-founder-ever-currently-activity-7386778374008057857-S8Wm",
    context: "Delta Chapter II"
  },
  {
    author: "@theaugustfest",
    authorName: "The August Fest",
    authorType: "company",
    quote: "Lakshveer is the co-founder of Projects by Laksh, Circuit Heroes, and Chhota Creator. He is a 7-year-old builder who has...",
    url: "https://theaugustfest.com/speaker/r-lakshveer-rao/",
    context: "Featured Speaker"
  },
  {
    author: "@runable_hq",
    authorName: "Runable",
    authorType: "company",
    quote: "An 8-year-old showed up and built. That alone changed what we thought was possible.",
    url: "https://x.com/runable_hq/status/2018337544975646832",
    context: "RunTogether Hackathon"
  },
  {
    author: "@scaletogether",
    authorName: "Together",
    authorType: "company",
    quote: "Full body Motion Gaming built by Laksh (our youngest builder, all of 8yrs old) at #RunTogether Hackathon.",
    url: "https://x.com/scaletogether/status/2018556342282453396",
    context: "RunTogether Hackathon"
  },
  
  // Founders & Builders
  {
    author: "@itsumeshk",
    authorName: "Umesh Kumar",
    authorType: "founder",
    quote: "An 8 year old, Laksh, built a motion controlled game in just a few hours at a Runable hackathon.",
    url: "https://x.com/itsumeshk/status/2018548263423815924",
    context: "RunTogether Hackathon"
  },
  {
    author: "@AadityaYuvraj",
    authorName: "Yuvraj Aaditya",
    authorType: "founder",
    quote: "Met Laksh today, an 8 yr old builder and the youngest in @theresidency delta cohort. He's already built projects across hardware, software, games...",
    url: "https://x.com/AadityaYuvraj/status/1987573704013058361",
    context: "The Residency Delta-2"
  },
  {
    author: "@heyaCPK",
    authorName: "CPK",
    authorType: "founder",
    quote: "Met young Laksh today. In the 2-3 hours I spent with him, I saw him give demos of his app to hundreds of visitors and promptly...",
    url: "https://x.com/heyaCPK/status/2017974440412459105",
    context: "Science Expo"
  },
  {
    author: "@ShubhamKukretii",
    authorName: "Shubham Kukreti",
    authorType: "builder",
    quote: "We had special guests @CaptVenk and Laksh today. Laksh knows more about hardware than I did during my entire engineering.",
    url: "https://x.com/ShubhamKukretii/status/1932415998965239900",
    context: "Localhost Meetup"
  },
  {
    author: "@shantanugoel",
    authorName: "Shantanu Goel",
    authorType: "founder",
    quote: "Just bought @CaptVenk and Laksh's Circuit Heroes card game on Amazon. This should be great for introducing kids to components!",
    url: "https://x.com/shantanugoel/status/1982027217690579157",
    context: "Circuit Heroes"
  },
  {
    author: "@ramsri_goutham",
    authorName: "Ramsri Goutham",
    authorType: "founder",
    quote: "Lakshveer - He is a 7 yr old builder working on hands-on tech and robotics projects along with his dad.",
    url: "https://x.com/ramsri_goutham/status/1929432690954215762",
    context: "Micro Scholarship"
  },
  {
    author: "@eshaanpawan",
    authorName: "Eshaan Pawan",
    authorType: "founder",
    quote: "An 8-year-old showed up and built. That alone changed what we thought 'builder' meant.",
    url: "https://x.com/eshaanpawan",
    context: "RunTogether Hackathon"
  },
  {
    author: "@karthikRanga92",
    authorName: "Karthik Rangarajan",
    authorType: "builder",
    quote: "Mentors alone are not going to work out. Mentee has to show that interest too which Laksh does. That's the key.",
    url: "https://x.com/karthikRanga92",
    context: "Mentorship"
  },
  {
    author: "@roohi_kr",
    authorName: "Roohi Kirit",
    authorType: "founder",
    quote: "4 folks/founders I am really bullish on... Laksh of Circuit Heroes. Each of these people has been building in public and documenting their journey.",
    url: "https://x.com/roohi_kr/status/1907424206075330926",
    context: "Builder Spotlight"
  },
  {
    author: "@MuraliSrinivasa",
    authorName: "Murali Srinivasa",
    authorType: "founder",
    quote: "Future of Hardware is bright! We need more people like @CaptVenk...",
    url: "https://x.com/MuraliSrinivasa/status/1950159570778706133",
    context: "Hardware Hackathon"
  },
  {
    author: "@dileep_gupta",
    authorName: "Dileep Gupta",
    authorType: "founder",
    quote: "8-year-old Lakshveer Rao is India's youngest hardware startup founder. He is the co-founder of Projects by Laksh and the creator of Circuit Heroes.",
    url: "https://www.linkedin.com/posts/dileep-gupta-aa19a133_india-hardware-activity-7416424030334791681-TXVf",
    context: "LinkedIn Feature"
  },
  
  // Media
  {
    author: "@beatsinbrief",
    authorName: "Beats in Brief",
    authorType: "media",
    quote: "Young Generation of India is growing up as builders. Meet Lakshveer Rao: India's youngest hardware startup founder.",
    url: "https://x.com/beatsinbrief/status/2010345060362301515",
    context: "Feature Story"
  },
  {
    author: "@beatsinbrief",
    authorName: "Beats in Brief",
    authorType: "media",
    quote: "Eight-year-old Lakshveer Rao is India's youngest hardware startup founder, building and shipping real products through Projects by Laksh.",
    url: "https://beatsinbrief.com/2026/01/11/lakshveer-rao-8-year-old-hardware-startup-founder-india/",
    context: "Feature Article"
  },
  {
    author: "@sharavarora80",
    authorName: "Sharav Arora",
    authorType: "media",
    quote: "Lakshveer's story is more than just a tale of technical genius. It is a testament to the power of curiosity, hands-on experience, and supportive mentorship.",
    url: "https://medium.com/@sharavarora80/meet-indias-8-year-old-tech-wunderkind-how-lakshveer-rao-is-redefining-childhood-innovation-9b76c12da34e",
    context: "Medium Feature"
  },
  {
    author: "@startupnewsfyi",
    authorName: "StartupNews.fyi",
    authorType: "media",
    quote: "India's Youngest Hardware Founder Is Only 8 Years Old. Lakshveer Rao built Marcy, a wrist companion for astronauts.",
    url: "https://www.instagram.com/reel/DTPcKnvEany/",
    context: "Instagram Feature"
  },
  {
    author: "@think_tac",
    authorName: "ThinkTac",
    authorType: "media",
    quote: "Meet Lakshveer Rao at ThinkTac! A bright and curious Grade 2 student who loves exploring how things work!",
    url: "https://x.com/think_tac/status/1933343571039400104",
    context: "Feature"
  },
  {
    author: "@codidactic",
    authorName: "Codidactic",
    authorType: "media",
    quote: "This week we're featuring the father-son duo Laksh and Capt. Venkat from Circuit Heroes. Together, they're turning real-world electronics into playable learning.",
    url: "https://x.com/codidactic",
    context: "Weekly Feature"
  },
  {
    author: "@startuppedia",
    authorName: "StartupPedia",
    authorType: "media",
    quote: "Meet 8-year-old Lakshveer who created an AI agent to control devices via Telegram messaging.",
    url: "https://startuppedia.in/trending/meet-8-year-old-lakshveer-who-created-an-ai-agent-to-control-devices-via-telegram-messaging-11212926",
    context: "Feature Article"
  },
  {
    author: "@startuppedia",
    authorName: "StartupPedia",
    authorType: "media",
    quote: "Lakshveer's AI agent that controls devices via Telegram is making waves in India's startup ecosystem.",
    url: "https://www.instagram.com/startup.pedia/reel/DV8FhcWCUgf/",
    context: "Instagram Reel"
  },
  {
    author: "@startuppedia",
    authorName: "StartupPedia",
    authorType: "media",
    quote: "8-year-old Lakshveer Rao building AI agents — featured on StartupPedia Instagram.",
    url: "https://www.instagram.com/p/DVYJ8mYCFpv/",
    context: "Instagram Feature"
  },
  {
    author: "@startuppedia",
    authorName: "StartupPedia",
    authorType: "media",
    quote: "Lakshveer's story featured on StartupPedia — India's youngest AI agent builder.",
    url: "https://www.linkedin.com/posts/startup-pedia_startuppedia-startupjourney-startupbusiness-activity-7439228289589809153-0HOY/",
    context: "LinkedIn Feature"
  },
  {
    author: "@rediminds",
    authorName: "RediMinds",
    authorType: "media",
    quote: "8-year-old built an ESP32 agent that codes — featured by RediMinds on LinkedIn.",
    url: "https://www.linkedin.com/posts/rediminds_8-year-old-built-an-esp32-agent-that-codes-activity-7434258624761446400-gHOS/",
    context: "LinkedIn Feature"
  },
  {
    author: "@somi_ai",
    authorName: "Somi AI",
    authorType: "media",
    quote: "An 8-year-old just built an AI agent that controls real hardware via Telegram. That's Lakshveer Rao.",
    url: "https://www.linkedin.com/posts/somi-ai_an-8-year-old-just-built-an-ai-agent-that-activity-7434205969292914688-fRzB/",
    context: "LinkedIn Feature"
  },
  {
    author: "@startupg",
    authorName: "StartupG",
    authorType: "media",
    quote: "Lakshveer Rao — featured in StartupG's AI builder roundup.",
    url: "https://www.linkedin.com/posts/startup-g_startupg-ai-activity-7439599135026130944-_H9l/",
    context: "LinkedIn Feature"
  },
  {
    author: "@r/IndiaTech",
    authorName: "Reddit r/IndiaTech",
    authorType: "media",
    quote: "The rise of AI kids and vibe-coding prodigies in India — Lakshveer featured in community discussion.",
    url: "https://www.reddit.com/r/IndiaTech/comments/1rpvm71/the_rise_of_ai_kids_and_vibecoding_prodigies_in/",
    context: "Reddit Community"
  },
  {
    author: "@r/india",
    authorName: "Reddit r/india",
    authorType: "media",
    quote: "Most Indian builders go through these 3 phases — community discussion featuring Lakshveer.",
    url: "https://www.reddit.com/r/india/comments/1ru8mqz/most_indian_builders_go_through_these_3_ph/",
    context: "Reddit Community"
  },
  {
    author: "@projects_by_laksh",
    authorName: "Projects by Laksh",
    authorType: "media",
    quote: "YouTube Short — Lakshveer's AI Telegram agent build demo.",
    url: "https://m.youtube.com/shorts/tMkS4K1L5I4",
    context: "YouTube Short"
  },
  {
    author: "@projects_by_laksh",
    authorName: "Projects by Laksh",
    authorType: "media",
    quote: "YouTube Short — Latest build demo by Lakshveer Rao.",
    url: "https://www.youtube.com/shorts/CMLBWDSIxlY",
    context: "YouTube Short"
  },
  {
    author: "@projects_by_laksh",
    authorName: "Projects by Laksh",
    authorType: "media",
    quote: "Full YouTube feature — Lakshveer Rao build walkthrough.",
    url: "https://www.youtube.com/watch?v=l6gvC81Ql10",
    context: "YouTube Feature"
  },
  {
    author: "@instagram",
    authorName: "Instagram Feature",
    authorType: "media",
    quote: "Lakshveer Rao featured — AI agent builder at 8 years old.",
    url: "https://www.instagram.com/reel/DWAQpAlARG4/",
    context: "Instagram Reel"
  },
  {
    author: "@instagram",
    authorName: "Instagram Feature",
    authorType: "media",
    quote: "Another Instagram feature covering Lakshveer's hardware + AI journey.",
    url: "https://www.instagram.com/p/DWDmWYFEWlP/",
    context: "Instagram Feature"
  },
  {
    author: "@instagram",
    authorName: "Instagram Feature",
    authorType: "media",
    quote: "Instagram coverage of Lakshveer's builder journey.",
    url: "https://www.instagram.com/reel/DV-dalvE5xw/",
    context: "Instagram Reel"
  },
  {
    author: "@instagram",
    authorName: "Instagram Feature",
    authorType: "media",
    quote: "Instagram reel featuring Lakshveer's AI + hardware projects.",
    url: "https://www.instagram.com/reel/DV-t-LUgVLj/",
    context: "Instagram Reel"
  },
  {
    author: "@scaler_innovation",
    authorName: "Scaler Innovation Lab",
    authorType: "company",
    quote: "200 teams signed up. Only 8 made it to the finals — Lakshveer among them.",
    url: "https://www.linkedin.com/posts/scaler-innovation-lab_200-teams-signed-up-only-8-made-it-to-the-activity-7409521660606722048-wGu0/",
    context: "Hackathon Finalist"
  },
  {
    author: "@polaris_school",
    authorName: "Polaris School of Technology",
    authorType: "company",
    quote: "7-year-old hacker at VibeHack — Lakshveer at Polaris School of Technology hackathon.",
    url: "https://www.linkedin.com/posts/polaris-school-of-technology_hackathon-7yearsoldhacker-vibehack-activity-7406303087159726080-ial5/",
    context: "VibeHack"
  },
  {
    author: "@instagram_feature",
    authorName: "Instagram Feature",
    authorType: "media",
    quote: "Lakshveer Rao builder feature on Instagram.",
    url: "https://www.instagram.com/p/DTbGXAzkyWf/",
    context: "Instagram Feature"
  },

  // Educators
  {
    author: "@NandiniChilkam",
    authorName: "Nandini",
    authorType: "educator",
    quote: "And in every phase, he learned how to keep running, using tiny ideas to create products. That's wonderful.",
    url: "https://x.com/NandiniChilkam/with_replies",
    context: "Journey Reflection"
  },
  {
    author: "@premmirth",
    authorName: "Prem Prasad",
    authorType: "educator",
    quote: "A LOOOOONG beautiful review of 'The Book of Creative Ideas'. Prem and Laksh have guru and shishya relationship.",
    url: "https://x.com/CaptVenk/status/1978452162456797244",
    context: "Ebook Review"
  },
  {
    author: "Zach Story",
    authorName: "Zach Story",
    authorType: "educator",
    quote: "This book is a true gem, full of creative and fun projects for kids. In today's day and age of kids being glued to screens this is exactly what the world needs. A true testament to the power of young minds!",
    url: "https://www.chhotacreator.com/courses/Ebook---The-Kids-book-of-creative-ideas-66bf706bd39d9b0482179b1b",
    context: "Ebook Review"
  },
  {
    author: "Andrés (age 4)",
    authorName: "Andrés",
    authorType: "educator",
    quote: "Hello Laksh. My name is Andrés. I am 4 years old. I liked your book very much. I especially loved the rock-climbing car. Thank you.",
    url: "https://www.chhotacreator.com/courses/Ebook---The-Kids-book-of-creative-ideas-66bf706bd39d9b0482179b1b",
    context: "Ebook Review"
  },
  
  // Individual praise
  {
    author: "@MuadDibYasser",
    authorName: "Yasser",
    authorType: "builder",
    quote: "Incredible, Lakshveer! An 8-year-old creating a hydration assistant shows the amazing potential of youth in tech.",
    url: "https://x.com/MuadDibYasser/status/1950136557278499104",
    context: "Hardware Hackathon"
  },
];

// Extract themes from quotes
const extractThemes = (mentions: Mention[]) => {
  const themes: Record<string, { count: number; mentions: Mention[] }> = {};
  
  const themeKeywords: Record<string, string[]> = {
    "youngest": ["youngest", "8-year-old", "8 year old", "8 yr old", "young"],
    "builder": ["builder", "built", "builds", "building", "ship"],
    "hardware": ["hardware", "circuit", "electronics", "robot"],
    "potential": ["potential", "incredible", "amazing", "impressive", "wonderful"],
    "learning": ["learning", "curious", "exploring", "ideas"],
  };
  
  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    themes[theme] = { count: 0, mentions: [] };
    mentions.forEach(mention => {
      const quoteLower = mention.quote.toLowerCase();
      if (keywords.some(kw => quoteLower.includes(kw))) {
        themes[theme].count++;
        themes[theme].mentions.push(mention);
      }
    });
  });
  
  return Object.entries(themes)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([theme, data]) => ({ theme, ...data }));
};

const authorTypeColors: Record<string, string> = {
  company: "text-cyan-400",
  founder: "text-emerald-400",
  media: "text-amber-400",
  educator: "text-violet-400",
  builder: "text-rose-400",
};

const authorTypeLabels: Record<string, string> = {
  company: "Company",
  founder: "Founder",
  media: "Media",
  educator: "Educator",
  builder: "Builder",
};

function Recognition() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    quote: string;
    name: string;
    handle?: string | null;
  }>({ isOpen: false, quote: "", name: "" });
  
  const themes = useMemo(() => extractThemes(mentions), []);
  
  const filteredMentions = useMemo(() => {
    let result = mentions;
    if (selectedTheme) {
      const themeData = themes.find(t => t.theme === selectedTheme);
      if (themeData) result = themeData.mentions;
    }
    if (selectedType) {
      result = result.filter(m => m.authorType === selectedType);
    }
    return result;
  }, [selectedTheme, selectedType, themes]);

  const authorTypes = [...new Set(mentions.map(m => m.authorType))];

  return (
    <div className="min-h-screen">
      <SEO title="Voices | Lakshveer Rao" />
      <Header />
      
      <main className="container-main py-8 md:py-16">
        {/* Page Title */}
        <div className="mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Voices
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            What the ecosystem says. Every quote links to the original post.
          </p>
        </div>

        {/* Theme Pills */}
        <div className="mb-8 pb-8 border-b border-[var(--border-subtle)]">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedTheme(null)}
              className={`px-4 py-2 text-sm border transition-all duration-150 ${
                selectedTheme === null 
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10" 
                  : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              }`}
            >
              All
            </button>
            {themes.map(({ theme, count }) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
                className={`px-4 py-2 text-sm border transition-all duration-150 ${
                  selectedTheme === theme 
                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10" 
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                {theme} <span className="text-[var(--text-muted)]">({count})</span>
              </button>
            ))}
          </div>
          
          {/* Author Type Filter */}
          <div className="flex flex-wrap gap-2">
            {authorTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`px-3 py-1 text-xs border transition-all duration-150 ${
                  selectedType === type 
                    ? `border-current ${authorTypeColors[type]}` 
                    : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {authorTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="mb-6 text-sm text-[var(--text-muted)]">
          {filteredMentions.length} voice{filteredMentions.length !== 1 ? 's' : ''}
          {(selectedTheme || selectedType) && (
            <button 
              onClick={() => { setSelectedTheme(null); setSelectedType(null); }}
              className="ml-3 text-[var(--accent)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Mentions */}
        <div className="space-y-0">
          {filteredMentions.map((mention, idx) => (
            <div
              key={`${mention.author}-${idx}`}
              className="group py-6 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors duration-150 -mx-4 px-4"
            >
              {/* Quote */}
              <a
                href={mention.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <p className="text-lg md:text-xl leading-relaxed mb-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-150">
                  "{mention.quote}"
                </p>
              </a>
              
              {/* Attribution */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-medium text-[var(--text-primary)]">
                  {mention.authorName}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  {mention.author}
                </span>
                <span className={`text-xs px-2 py-0.5 border border-current/30 ${authorTypeColors[mention.authorType]}`}>
                  {authorTypeLabels[mention.authorType]}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  — {mention.context}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <EndorsementShareButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShareModalData({
                        isOpen: true,
                        quote: mention.quote,
                        name: mention.authorName,
                        handle: mention.author,
                      });
                    }}
                  />
                  <a 
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  >
                    View ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer stats */}
        <div className="mt-16 pt-8 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-mono text-2xl text-[var(--text-primary)] mb-1">{mentions.length}</div>
              <div className="text-sm text-[var(--text-muted)]">Voices</div>
            </div>
            <div>
              <div className="font-mono text-2xl text-cyan-400 mb-1">{mentions.filter(m => m.authorType === 'company').length}</div>
              <div className="text-sm text-[var(--text-muted)]">Companies</div>
            </div>
            <div>
              <div className="font-mono text-2xl text-emerald-400 mb-1">{mentions.filter(m => m.authorType === 'founder').length}</div>
              <div className="text-sm text-[var(--text-muted)]">Founders</div>
            </div>
            <div>
              <div className="font-mono text-2xl text-[var(--text-primary)] mb-1">100%</div>
              <div className="text-sm text-[var(--text-muted)]">Verified</div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Share Endorsement Modal */}
      <ShareEndorsementModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData(prev => ({ ...prev, isOpen: false }))}
        quote={shareModalData.quote}
        name={shareModalData.name}
        handle={shareModalData.handle}
      />
    </div>
  );
}

export default Recognition;
