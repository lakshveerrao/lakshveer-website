import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { SEO } from "@/components/seo";

interface SupporterData {
  handle: string;
  name: string;
  hasQuote: boolean;
  quote: string | null;
}

export default function EndorsePage() {
  const { token } = useParams<{ token: string }>();
  const [supporter, setSupporter] = useState<SupporterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    fetch(`/api/endorse/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSupporter(data.supporter);
          if (data.supporter.quote) {
            setQuote(data.supporter.quote);
          }
        } else {
          setError(data.error || "Invalid link");
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !quote.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/endorse/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: quote.trim() }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO title="Endorse | Lakshveer Rao" />
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  if (error || !supporter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO title="Endorse | Lakshveer Rao" />
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-semibold mb-4">Invalid Link</h1>
          <p className="text-[var(--text-secondary)]">
            This endorsement link is invalid or has expired. Please contact @CaptVenk for a new link.
          </p>
          <a href="/" className="inline-block mt-6 text-[var(--accent)]">
            ← Back to homepage
          </a>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold mb-4">Thank You, {supporter.name.split(' ')[0]}!</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Your endorsement means a lot to Laksh and his journey. It's now visible on his website.
          </p>
          <a href="/" className="inline-block text-[var(--accent)]">
            View on homepage →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <SEO title={`Endorse Lakshveer | ${supporter.name}`} />
      <div className="w-full max-w-lg px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold mb-2">
            {supporter.hasQuote ? "Update Your Endorsement" : "Endorse Lakshveer"}
          </h1>
          <p className="text-[var(--text-secondary)]">
            Hi {supporter.name.split(' ')[0]}, add a line about Laksh's work.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              Your endorsement (200 chars max)
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="e.g., Laksh's curiosity and execution are rare at any age. Excited to see what he builds next."
              className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
              required
            />
            <div className="text-right text-xs text-[var(--text-muted)] mt-1">
              {quote.length}/200
            </div>
          </div>

          <div className="text-sm text-[var(--text-muted)]">
            This will appear on your card at{" "}
            <a href="/" className="text-[var(--accent)]">lakshveer.com</a>{" "}
            alongside your name ({supporter.name}) and handle ({supporter.handle}).
          </div>

          <button
            type="submit"
            disabled={submitting || !quote.trim()}
            className="w-full py-3 bg-[var(--accent)] text-[var(--bg-primary)] font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? "Saving..." : supporter.hasQuote ? "Update Endorsement" : "Submit Endorsement"}
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
