import { SEO, PAGE_TITLES } from "@/components/seo";
import { Header } from "@/components/header";

interface TeamMemberProps {
  name: string;
  role: string;
  description?: string;
}

const TeamMember = ({ name, role, description }: TeamMemberProps) => (
  <div className="py-6 border-b border-[var(--border-subtle)] last:border-0">
    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
      {name}
    </h3>
    <p className="text-[var(--text-secondary)]">
      {role}
    </p>
    {description && (
      <p className="text-[var(--text-secondary)] mt-3 leading-relaxed">
        {description}
      </p>
    )}
  </div>
);

function Venture() {
  return (
    <div className="min-h-screen">
      <SEO title={PAGE_TITLES.venture} />
      <Header />
      <main className="container-main py-8 md:py-16">
        {/* Page Title */}
        <div className="mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Projects by Laksh
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            A legally registered partnership based in Hyderabad, India.
          </p>
          <div className="mt-6 font-mono text-sm text-[var(--text-muted)]">
            <p>GSTIN: 36ABHFP2956L1ZP</p>
          </div>
        </div>

        {/* Products */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">
            Products
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Circuit Heroes</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
                Hardware card games, workshops, and ebooks that make electronics fun and accessible.
              </p>
              <ul className="text-[var(--text-secondary)] leading-relaxed space-y-1 text-sm">
                <li>• India's youngest card game designer — showcased at TTOX Dec 2024</li>
                <li>• Youngest IP holder for the Circuit Heroes card game</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">In Development</h3>
              <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2">
                <li>Computer-vision based learning games</li>
                <li>Autonomous skill bots</li>
                <li>Hardware building partner bot</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Workshops */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">
            Workshops Conducted
          </h2>
          <div className="space-y-3">
            <a 
              href="https://konfhub.com/krw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              Offline Robotics Workshop ↗
            </a>
            <a 
              href="https://konfhub.com/robo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              Online Robotics Workshop ↗
            </a>
          </div>
        </section>

        {/* Operating Model */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">
            Operating Model
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 font-mono text-lg md:text-xl text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)]">Build</span>
            <span className="text-[var(--text-secondary)]">→</span>
            <span className="text-[var(--text-primary)]">Test</span>
            <span className="text-[var(--text-secondary)]">→</span>
            <span className="text-[var(--text-primary)]">Deploy</span>
            <span className="text-[var(--text-secondary)]">→</span>
            <span className="text-[var(--text-primary)]">Iterate</span>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">
            Team
          </h2>
          <div className="max-w-xl">
            <TeamMember 
              name="R Lakshveer Rao"
              role="Co-Founder & Lead Builder"
            />
            <TeamMember 
              name="Capt. Venkat"
              role="Full-time Investor, Co-Founder, Co-Worker, Dad"
              description="Handles operations, logistics, vendor coordination, travel, documentation, compliance, partnerships, and execution support."
            />
            <div className="py-6 border-b border-[var(--border-subtle)]">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                AI Teammates
              </h3>
              <p className="text-[var(--text-secondary)]">
                Beyond the two human members, we work with AI teammates for development, research, and content.
              </p>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Location
          </h2>
          <p className="text-[var(--text-secondary)]">
            Hyderabad, India
          </p>
        </section>
      </main>
    </div>
  );
}

export default Venture;
