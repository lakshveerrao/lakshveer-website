import { SEO } from "@/components/seo";
import { useState } from "react";

// Portfolio data - single source of truth
export const portfolioData = {
  name: "R Lakshveer Rao",
  age: 8,
  tagline: "Builds to Learn",
  title: "Hardware + AI Systems Builder",
  role: "Co-Founder — Projects by Laksh",
  location: "Hyderabad, India",
  website: "https://lakshveer.com",
  
  stats: [
    { label: "Ebook Sales", value: "100+" },
    { label: "Projects Documented", value: "170+" },
    { label: "Products Shipped", value: "3" },
    { label: "Workshops Conducted", value: "5+" },
    { label: "Grants & Scholarships", value: "₹1.4L+" },
    { label: "Trademark Owned", value: "1" },
  ],
  
  achievements: [
    "Youngest Innovator & Special Mention — Param × Vedanta Makeathon 2026",
    "₹1,00,000 Grant — Malpani Ventures 2026",
    "Gemini 3 Hackathon — Cerebral Valley × Google DeepMind 2026",
    "Top-5 Finalist (Youngest) — Hardware Hackathon 2.0",
    "Youngest Founder — Delta-2 Cohort, The Residency",
  ],
  
  products: [
    { name: "CircuitHeroes.com", desc: "Circuit-building trading card game. 300+ decks sold. Trademark registered." },
    { name: "ChhotaCreator.com", desc: "Peer-learning platform for hands-on learning." },
    { name: "Hardvare", desc: "Hardware execution platform enforcing safe electrical and logical states." },
    { name: "MotionX", desc: "Full-body motion-control gaming system." },
  ],
  
  backers: ["Malpani Ventures", "Lion Circuits", "Param Foundation", "AI Grants India"],
  
  media: ["Beats in Brief", "Runtime", "Lion Circuits", "ThinkTac", "Maverick News"],
  
  contact: {
    primary: "Capt. Venkat (Father & Co-Founder)",
    email: "Contact via lakshveer.com/collaborate",
    twitter: "@LakshveerRao",
    linkedin: "linkedin.com/in/lakshveerrao",
  },
};

// Static QR Code component
function QRCode({ size = 200 }: { size?: number }) {
  return (
    <img 
      src="/qr-code.png" 
      alt="QR Code - lakshveer.com" 
      width={size} 
      height={size}
      className="rounded-lg"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// Copy button with feedback
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors duration-150 text-white font-medium"
    >
      {copied ? (
        <>
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

export default function Share() {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.open("/api/portfolio.pdf", "_blank");
  };

  return (
    <>
      <SEO title="Share | Lakshveer Rao" description="Share Lakshveer Rao's portfolio" />
      
      {/* Screen version */}
      <div className="min-h-screen bg-zinc-950 print:hidden">
        <div className="container-main py-16">
          {/* Header */}
          <div className="mb-12">
            <a href="/" className="text-[var(--accent)] hover:opacity-80 text-sm mb-4 inline-block">
              ← Back to Home
            </a>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Share Portfolio
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Share Lakshveer's portfolio with government departments, institutions, sponsors, or anyone who needs verification of achievements.
            </p>
          </div>

          {/* Share Options Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* QR Code Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-white mb-2">QR Code</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Scan to open the live portfolio. Perfect for business cards, documents, or presentations.
              </p>
              <div className="flex justify-center mb-6">
                <QRCode size={200} />
              </div>
              <p className="text-center text-zinc-500 text-sm">
                lakshveer.com
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-white mb-2">Quick Actions</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Download or share the portfolio in different formats.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--accent)] hover:opacity-90 rounded-lg transition-opacity duration-150 text-zinc-950 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Portfolio
                </button>
                
                <CopyButton text="https://lakshveer.com" label="Copy Website Link" />
                
                <CopyButton 
                  text="8-year-old hardware and AI builder from India. Shipped 3 products. ₹1.4L+ in grants. lakshveer.com" 
                  label="Copy One-Liner Bio" 
                />
                
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors duration-150 text-white font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print This Page
                </button>
              </div>
            </div>
          </div>

          {/* Portfolio Preview */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Portfolio Preview</h2>
            <p className="text-zinc-400 text-sm mb-6">
              This is what the downloadable PDF contains. Always up-to-date.
            </p>
          </div>

          {/* Preview Card - matches PDF content */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 md:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 pb-8 border-b border-zinc-800">
              <div>
                <div className="w-1 h-8 bg-[var(--accent)] mb-4"></div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{portfolioData.name}</h1>
                <p className="text-zinc-500 text-lg">(Age {portfolioData.age})</p>
                <p className="text-xl text-white mt-2">{portfolioData.tagline}</p>
                <p className="text-zinc-400">{portfolioData.title}</p>
                <p className="text-zinc-500 mt-2">{portfolioData.role}</p>
                <p className="text-[var(--accent)]">{portfolioData.location}</p>
              </div>
              <div className="flex-shrink-0">
                <QRCode size={120} />
                <p className="text-center text-zinc-500 text-xs mt-2">lakshveer.com</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Momentum</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolioData.stats.map((stat) => (
                  <div key={stat.label} className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-zinc-400 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Key Achievements</h3>
              <ul className="space-y-2">
                {portfolioData.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Products & Platforms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolioData.products.map((product) => (
                  <div key={product.name} className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-zinc-400 text-sm">{product.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Backers & Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Backed By</h3>
                <div className="flex flex-wrap gap-2">
                  {portfolioData.backers.map((backer) => (
                    <span key={backer} className="px-3 py-1 bg-zinc-800 rounded-full text-zinc-300 text-sm">
                      {backer}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Featured In</h3>
                <div className="flex flex-wrap gap-2">
                  {portfolioData.media.map((media) => (
                    <span key={media} className="px-3 py-1 bg-zinc-800 rounded-full text-zinc-300 text-sm">
                      {media}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-8 border-t border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
              <p className="text-zinc-400">Primary Contact: <span className="text-white">{portfolioData.contact.primary}</span></p>
              <p className="text-zinc-400">Twitter: <span className="text-[var(--accent)]">{portfolioData.contact.twitter}</span></p>
              <p className="text-zinc-400">LinkedIn: <span className="text-[var(--accent)]">{portfolioData.contact.linkedin}</span></p>
              <p className="text-zinc-500 text-sm mt-4">
                Verified portfolio: lakshveer.com • Generated {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print version - clean, professional */}
      <div className="hidden print:block print:bg-white print:text-black p-8">
        <style>{`
          @media print {
            @page { margin: 1cm; size: A4; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
        
        {/* Print Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black">
          <div>
            <div className="w-1 h-6 bg-cyan-500 mb-2"></div>
            <h1 className="text-3xl font-bold">{portfolioData.name}</h1>
            <p className="text-gray-600">(Age {portfolioData.age})</p>
            <p className="text-xl font-medium mt-1">{portfolioData.tagline}</p>
            <p className="text-gray-700">{portfolioData.title}</p>
            <p className="text-gray-600">{portfolioData.role} • {portfolioData.location}</p>
          </div>
          <div className="text-right">
            <img src="/qr-code.png" alt="QR Code" width={80} height={80} />
            <p className="text-sm text-gray-600 mt-1">lakshveer.com</p>
          </div>
        </div>

        {/* Print Stats */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Momentum</h3>
          <div className="grid grid-cols-6 gap-2 text-center">
            {portfolioData.stats.map((stat) => (
              <div key={stat.label} className="border border-gray-300 p-2 rounded">
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Print Achievements */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Key Achievements</h3>
          <ul className="text-sm space-y-1">
            {portfolioData.achievements.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </div>

        {/* Print Products */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Products & Platforms</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {portfolioData.products.map((p) => (
              <div key={p.name} className="border border-gray-300 p-2 rounded">
                <p className="font-semibold">{p.name}</p>
                <p className="text-gray-600 text-xs">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Print Backers & Media */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <h3 className="font-bold mb-1">Backed By</h3>
            <p className="text-gray-700">{portfolioData.backers.join(" • ")}</p>
          </div>
          <div>
            <h3 className="font-bold mb-1">Featured In</h3>
            <p className="text-gray-700">{portfolioData.media.join(" • ")}</p>
          </div>
        </div>

        {/* Print Footer */}
        <div className="pt-4 border-t border-gray-300 text-sm">
          <p><strong>Primary Contact:</strong> {portfolioData.contact.primary}</p>
          <p><strong>Twitter:</strong> {portfolioData.contact.twitter} | <strong>LinkedIn:</strong> {portfolioData.contact.linkedin}</p>
          <p className="text-gray-500 mt-2 text-xs">
            Verified portfolio: lakshveer.com • Generated {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    </>
  );
}
