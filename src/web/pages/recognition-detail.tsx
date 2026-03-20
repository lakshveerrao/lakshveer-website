import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { SEO } from "@/components/seo";
import { ShareMenu } from "@/components/share-menu";
import { Header } from "@/components/header";

interface Endorsement {
  slug: string;
  quote: string;
  name: string;
  role: string;
  organisation: string;
  linkedin_url: string | null;
}

// Same endorsements data - in production this would come from a shared data file or API
const endorsements: Endorsement[] = [
  {
    slug: "lion-circuits-2026",
    quote: "Lakshveer demonstrates exceptional understanding of hardware systems for his age. His work on circuit design shows real engineering thinking.",
    name: "Arun Kumar",
    role: "Technical Director",
    organisation: "Lion Circuits",
    linkedin_url: "https://linkedin.com/in/example1",
  },
  {
    slug: "malpani-ventures-2026",
    quote: "One of the most impressive young builders we have funded. Clear vision, disciplined execution.",
    name: "Priya Malpani",
    role: "Partner",
    organisation: "Malpani Ventures",
    linkedin_url: "https://linkedin.com/in/example2",
  },
  {
    slug: "param-foundation-2026",
    quote: "Lakshveer brings a rare combination of creativity and technical rigor. His makeathon project stood out among participants twice his age.",
    name: "Rajesh Sharma",
    role: "Program Director",
    organisation: "Param Foundation",
    linkedin_url: "https://linkedin.com/in/example3",
  },
  {
    slug: "hardware-hackathon-2026",
    quote: "Consistently ships working prototypes. Does not just ideate - he builds.",
    name: "Vikram Rao",
    role: "Lead Organizer",
    organisation: "Hardware Hackathon 2.0",
    linkedin_url: null,
  },
];

// Helper to generate OG description from endorsement
const generateOGDescription = (endorsement: Endorsement): string => {
  const truncatedQuote = endorsement.quote.length > 150 
    ? endorsement.quote.substring(0, 150) + "..." 
    : endorsement.quote;
  return `${truncatedQuote} — ${endorsement.name}, ${endorsement.organisation}`;
};

// Not found component
const NotFound = () => (
  <div className="min-h-screen">
    <Header />
    <main className="container-main py-8 md:py-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
        Endorsement not found
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        The endorsement you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/recognition"
        className="text-[var(--accent)] hover:opacity-80 transition-opacity duration-150"
      >
        View all voices →
      </Link>
    </main>
  </div>
);

function RecognitionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [endorsement, setEndorsement] = useState<Endorsement | null | undefined>(undefined);

  useEffect(() => {
    // Find the endorsement by slug
    const found = endorsements.find((e) => e.slug === slug);
    setEndorsement(found || null);

    // Update OG meta tags for this specific endorsement
    if (found) {
      const ogDescription = generateOGDescription(found);
      
      // Update OG description
      const ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (ogDescMeta) {
        ogDescMeta.setAttribute("content", ogDescription);
      }
      
      // Update Twitter description
      const twitterDescMeta = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescMeta) {
        twitterDescMeta.setAttribute("content", ogDescription);
      }

      // Update OG URL
      let ogUrlMeta = document.querySelector('meta[property="og:url"]');
      if (!ogUrlMeta) {
        ogUrlMeta = document.createElement("meta");
        ogUrlMeta.setAttribute("property", "og:url");
        document.head.appendChild(ogUrlMeta);
      }
      ogUrlMeta.setAttribute("content", `${window.location.origin}/recognition/${slug}`);
    }
  }, [slug]);

  // Loading state
  if (endorsement === undefined) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container-main py-8 md:py-16">
          <div className="text-[var(--text-muted)]">Loading...</div>
        </main>
      </div>
    );
  }

  // Not found state
  if (endorsement === null) {
    return <NotFound />;
  }

  const ogDescription = generateOGDescription(endorsement);
  const ogImageUrl = `/api/og/recognition/${endorsement.slug}`;

  return (
    <div className="min-h-screen">
      <SEO 
        title="Voices | Lakshveer Rao"
        description={ogDescription}
        ogImage={ogImageUrl}
      />
      <Header />
      
      <main className="container-main py-8 md:py-16">
        {/* Quote - displayed prominently without quotation marks */}
        <blockquote className="mb-12">
          <p className="text-2xl md:text-3xl lg:text-4xl text-[var(--text-primary)] leading-relaxed font-normal tracking-tight">
            {endorsement.quote}
          </p>
        </blockquote>

        {/* Attribution */}
        <div className="space-y-2 mb-8">
          <p className="text-xl text-[var(--text-primary)] font-semibold">
            — {endorsement.name}
          </p>
          <p className="text-[var(--text-secondary)]">
            {endorsement.role}
          </p>
          <p className="text-[var(--text-muted)]">
            {endorsement.organisation}
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 pt-4 border-t border-[var(--border-subtle)]">
          {endorsement.linkedin_url && (
            <a
              href={endorsement.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--accent)] hover:opacity-80 transition-opacity duration-150"
            >
              LinkedIn ↗
            </a>
          )}
          <ShareMenu slug={endorsement.slug} quote={endorsement.quote} />
        </div>
      </main>
    </div>
  );
}

export default RecognitionDetail;
