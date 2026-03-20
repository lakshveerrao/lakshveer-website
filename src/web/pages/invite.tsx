import { SEO } from "@/components/seo";
import { Header } from "@/components/header";
import { portfolioData, getCurrentDate } from "@/data/portfolio";

export default function Invite() {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Invite Laksh | Guest Talks, Hackathons & Events" 
        description="Invite Lakshveer Rao for guest talks, hackathons, workshops, and events. 8-year-old hardware and AI builder from India."
      />
      <Header />
      
      <main className="container-main py-8 md:py-16">
        {/* Hero */}
        <div className="mb-16">
          <div className="inline-block px-3 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full text-[var(--accent)] text-sm mb-6">
            Open to Invitations
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Invite Laksh to Your Event
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {portfolioData.shortName} shares his journey of building hardware and AI projects at age {portfolioData.age}. 
            Available for hackathons, guest talks, workshops, podcasts, and panel discussions.
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-[var(--accent)]">{portfolioData.age}</p>
            <p className="text-sm text-[var(--text-secondary)]">Years Old</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold">{portfolioData.stats.productsShipped}</p>
            <p className="text-sm text-[var(--text-secondary)]">Products Shipped</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold">{portfolioData.stats.grantsReceived}</p>
            <p className="text-sm text-[var(--text-secondary)]">In Grants</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold">{portfolioData.stats.projectsDocumented}</p>
            <p className="text-sm text-[var(--text-secondary)]">Projects</p>
          </div>
        </div>

        {/* What Laksh Offers */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">Event Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Guest Talk / Lecture",
                desc: "Inspiring talk for students, makers, or tech audiences about building at a young age",
                duration: "20-45 min",
                format: "In-person or Virtual",
              },
              {
                title: "Hackathon Participation",
                desc: "Active participant building real projects. Has competed in Hardware Hackathon 2.0, Gemini 3 Hackathon",
                duration: "24-48 hours",
                format: "In-person preferred",
              },
              {
                title: "Workshop / Demo",
                desc: "Hands-on session showing how to build with ESP32, Arduino, or AI tools",
                duration: "1-2 hours",
                format: "In-person or Virtual",
              },
              {
                title: "Podcast / Interview",
                desc: "Conversation about the maker journey, education, young entrepreneurship",
                duration: "30-60 min",
                format: "Virtual",
              },
              {
                title: "Panel Discussion",
                desc: "Perspective on STEM education, young builders, hardware vs software",
                duration: "30-60 min",
                format: "In-person or Virtual",
              },
              {
                title: "School Visit",
                desc: "Interactive session inspiring students to build and experiment",
                duration: "1-2 hours",
                format: "In-person",
              },
            ].map((item) => (
              <div key={item.title} className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-colors">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">{item.desc}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-zinc-800 rounded">{item.duration}</span>
                  <span className="px-2 py-1 bg-zinc-800 rounded">{item.format}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Talk Topics */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">Talk Topics</h2>
          <div className="space-y-4">
            {portfolioData.talkTopics.map((topic) => (
              <div key={topic.title} className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{topic.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">{topic.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs flex-shrink-0">
                    <span className="px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded">{topic.duration}</span>
                    {topic.audience.map((a) => (
                      <span key={a} className="px-2 py-1 bg-zinc-800 rounded">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past Events / Credibility */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">Track Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <h3 className="font-semibold mb-4">Hackathons & Competitions</h3>
              <ul className="space-y-3 text-sm">
                {portfolioData.achievements.slice(0, 4).map((a) => (
                  <li key={a.title} className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <span><strong>{a.title}</strong> — {a.event} ({a.year})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <h3 className="font-semibold mb-4">Featured In</h3>
              <ul className="space-y-3 text-sm">
                {portfolioData.media.map((m) => (
                  <li key={m.name} className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
                      {m.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* What Organizers Get */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Unique Story",
                desc: "An 8-year-old who has shipped real products, won grants, and competes with adults. Memorable and shareable.",
              },
              {
                title: "Technical Depth",
                desc: "Not just inspiring — Laksh can discuss ESP32, Python, TensorFlow, computer vision, and actual code.",
              },
              {
                title: "Demo-Ready",
                desc: "Can bring and demonstrate real hardware projects. Interactive, engaging for any audience.",
              },
            ].map((item) => (
              <div key={item.title} className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Logistics */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">Logistics</h2>
          <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li>• Parent (Capt. Venkat) accompanies for all events</li>
                  <li>• School-appropriate timing preferred (weekends, holidays)</li>
                  <li>• Basic AV setup for presentations</li>
                  <li>• Power outlets if demo includes hardware</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Location</h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li>• Based in Hyderabad, India</li>
                  <li>• Virtual events: Any timezone (with notice)</li>
                  <li>• In-person: India preferred, international possible</li>
                  <li>• Travel: Organizer covers travel + stay</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to Invite Laksh?</h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
            Fill out the form and we'll get back to you within 48 hours.
          </p>
          <a 
            href="/collaborate" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent)] text-zinc-950 font-semibold hover:opacity-90 transition-opacity"
          >
            Send Invitation →
          </a>
        </section>

        {/* Footer note */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-12">
          Last updated: {getCurrentDate()} • All information auto-synced from portfolio
        </p>
      </main>
    </div>
  );
}
