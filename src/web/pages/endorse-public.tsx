import { useState } from "react";
import { SEO } from "@/components/seo";

export default function EndorsePublicPage() {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch("/api/endorsements/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim() || null,
          role: role.trim() || null,
          quote: quote.trim(),
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO title="Thank You | Lakshveer Rao" />
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-4">Thank You, {name.split(' ')[0]}!</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Your endorsement has been submitted for review. Once approved, it will appear on Laksh's website.
          </p>
          <a href="/" className="inline-block text-[var(--accent)]">
            Back to homepage →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <SEO title="Endorse Lakshveer | Lakshveer Rao" />
      <div className="w-full max-w-lg px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold mb-2">Endorse Lakshveer</h1>
          <p className="text-[var(--text-secondary)]">
            Share a few words about Laksh's work or journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                X/Twitter Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@handle"
                className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Founder, Engineer..."
                className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              Your Endorsement * (280 chars max)
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              maxLength={280}
              rows={4}
              placeholder="e.g., Laksh's curiosity and execution are rare at any age. Excited to see what he builds next."
              className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
              required
            />
            <div className="text-right text-xs text-[var(--text-muted)] mt-1">
              {quote.length}/280
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="text-sm text-[var(--text-muted)]">
            Your endorsement will be reviewed before appearing on{" "}
            <a href="/" className="text-[var(--accent)]">lakshveer.com</a>.
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !quote.trim()}
            className="w-full py-3 bg-[var(--accent)] text-[var(--bg-primary)] font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? "Submitting..." : "Submit Endorsement"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Questions? Reach out to{" "}
            <a href="https://x.com/CaptVenk" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">
              @CaptVenk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
