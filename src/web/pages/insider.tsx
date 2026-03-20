import { useState, useEffect } from "react";
import { SEO, PAGE_TITLES } from "@/components/seo";

interface Submission {
  id: number;
  name: string;
  email: string;
  organisation: string | null;
  category: string;
  message: string;
  created_at: string;
  read: number;
}

interface Supporter {
  handle: string;
  name: string;
  token: string;
  quote: string | null;
  submitted_at: string | null;
  sent_at: string | null;
}

interface PublicEndorsement {
  id: number;
  name: string;
  handle: string | null;
  role: string | null;
  quote: string;
  approved: number;
  created_at: string;
}

interface Stats {
  total: number;
  unread: number;
  thisWeek: number;
  thisMonth: number;
  byCategory: { category: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

const categoryLabels: Record<string, string> = {
  hardware: "Hardware",
  sponsorship: "Sponsorship",
  mentorship: "Mentorship",
  media: "Media",
  collaboration: "Collaboration",
  other: "Other",
};

type Tab = "overview" | "messages" | "endorsements" | "public";

const PASSWORD = "insidenagole";

function Insider() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [publicEndorsements, setPublicEndorsements] = useState<PublicEndorsement[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem("insider_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([fetchStats(), fetchSubmissions(), fetchSupporters(), fetchPublicEndorsements()]).then(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem("insider_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("insider_auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/contact/submissions");
      const data = await res.json();
      if (data.success) setSubmissions(data.submissions);
    } catch (e) {
      console.error("Failed to fetch submissions:", e);
    }
  };

  const fetchSupporters = async () => {
    try {
      const res = await fetch("/api/supporters/admin");
      const data = await res.json();
      if (data.success) setSupporters(data.supporters);
    } catch (e) {
      console.error("Failed to fetch supporters:", e);
    }
  };

  const fetchPublicEndorsements = async () => {
    try {
      const res = await fetch("/api/endorsements/admin");
      const data = await res.json();
      if (data.success) setPublicEndorsements(data.endorsements);
    } catch (e) {
      console.error("Failed to fetch public endorsements:", e);
    }
  };

  const markAsRead = async (id: number) => {
    await fetch(`/api/contact/submissions/${id}/read`, { method: "POST" });
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, read: 1 } : s)));
    if (stats) setStats({ ...stats, unread: Math.max(0, stats.unread - 1) });
  };

  const deleteSubmission = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/contact/submissions/${id}`, { method: "DELETE" });
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setSelected(null);
    fetchStats();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "Z");
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <SEO title="Login | Insider" />
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Insider</h1>
            <p className="text-sm text-[var(--text-secondary)]">Enter password to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-[var(--text-primary)] text-[var(--bg)] font-medium hover:opacity-90 transition-opacity"
            >
              Enter
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <a href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              ← Back to site
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SEO title={PAGE_TITLES.insider} />

      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg)] z-20">
        <div className="px-4 py-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">Insider</h1>
              <p className="text-sm text-[var(--text-secondary)]">Your dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Site
              </a>
              <button
                onClick={handleLogout}
                className="text-sm text-[var(--text-secondary)] hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {(["overview", "messages", "endorsements", "public"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setSelected(null);
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t
                    ? "text-[var(--text-primary)] border-b-2 border-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t === "overview" ? "Overview" : t === "messages" ? "Messages" : t === "endorsements" ? "Supporters" : "Public"}
                {t === "messages" && stats && stats.unread > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-[var(--accent)] text-[var(--bg)] rounded-full">
                    {stats.unread}
                  </span>
                )}
                {t === "endorsements" && supporters.filter(s => s.quote).length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-emerald-500 text-[var(--bg)] rounded-full">
                    {supporters.filter(s => s.quote).length}
                  </span>
                )}
                {t === "public" && publicEndorsements.filter(e => !e.approved).length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-500 text-[var(--bg)] rounded-full">
                    {publicEndorsements.filter(e => !e.approved).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {tab === "overview" && stats && <Overview stats={stats} supporters={supporters} publicEndorsements={publicEndorsements} onViewMessages={() => setTab("messages")} onViewEndorsements={() => setTab("endorsements")} />}
        {tab === "messages" && (
          <Messages
            submissions={submissions}
            selected={selected}
            onSelect={(s) => {
              setSelected(s);
              if (s && !s.read) markAsRead(s.id);
            }}
            onDelete={deleteSubmission}
            formatDate={formatDate}
          />
        )}
        {tab === "endorsements" && <Endorsements supporters={supporters} />}
        {tab === "public" && <PublicEndorsementsTab endorsements={publicEndorsements} setEndorsements={setPublicEndorsements} />}
      </main>
    </div>
  );
}

// Overview Tab
function Overview({ stats, supporters, publicEndorsements, onViewMessages, onViewEndorsements }: { stats: Stats; supporters: Supporter[]; publicEndorsements: PublicEndorsement[]; onViewMessages: () => void; onViewEndorsements: () => void }) {
  const endorsedCount = supporters.filter(s => s.quote).length;
  const pendingPublic = publicEndorsements.filter(e => !e.approved).length;
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-16">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Messages" value={stats.total} />
        <StatCard label="Unread" value={stats.unread} highlight={stats.unread > 0} />
        <StatCard label="Supporter Quotes" value={endorsedCount} highlight={endorsedCount > 0} />
        <StatCard label="Pending Review" value={pendingPublic} highlight={pendingPublic > 0} />
      </div>

      {/* Category Breakdown */}
      {stats.byCategory.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
            By Category
          </h2>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
            {stats.byCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between px-4 py-3">
                <span className="text-[var(--text-primary)]">
                  {categoryLabels[item.category] || item.category}
                </span>
                <span className="text-[var(--text-secondary)]">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
            Last 7 Days
          </h2>
          <div className="flex items-end gap-2 h-24">
            {stats.recentActivity.map((day) => {
              const maxCount = Math.max(...stats.recentActivity.map((d) => d.count));
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[var(--accent)] rounded-t"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={onViewMessages}
            className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-left hover:border-[var(--accent)] transition-colors"
          >
            <p className="text-[var(--text-primary)] font-medium">View Messages</p>
            <p className="text-sm text-[var(--text-secondary)]">Read and respond to inquiries</p>
          </button>
          <button
            onClick={onViewEndorsements}
            className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-left hover:border-[var(--accent)] transition-colors"
          >
            <p className="text-[var(--text-primary)] font-medium">View Endorsements</p>
            <p className="text-sm text-[var(--text-secondary)]">Manage supporter quotes</p>
          </button>
          <a
            href="/"
            target="_blank"
            className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-left hover:border-[var(--accent)] transition-colors"
          >
            <p className="text-[var(--text-primary)] font-medium">View Site</p>
            <p className="text-sm text-[var(--text-secondary)]">See your live website</p>
          </a>
        </div>
      </section>

      {/* Share & Get Endorsements */}
      <ShareEndorsements />
    </div>
  );
}

// Share Endorsements Component
function ShareEndorsements() {
  const [copied, setCopied] = useState(false);
  const endorseUrl = "https://lakshveer.com/endorse";
  
  const shareMessage = `Meet Lakshveer, an 8-year-old hardware + AI builder from Hyderabad, India who's building real projects — from games to learn electronics to builds that solve everyday problems. He's been on this building journey since he was 4, backed by his father Capt. Venkat.

If you've seen his work or believe in what he's doing, drop a quick endorsement here:
${endorseUrl}

Takes 30 seconds. Your words mean a lot.

Explore all his work at lakshveer.com`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = shareMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(endorseUrl)}&text=${encodeURIComponent(shareMessage.replace(endorseUrl, ''))}`, '_blank');
  };

  const shareTwitter = () => {
    const tweetText = `Meet Lakshveer, an 8yo hardware + AI builder from Hyderabad building real projects since age 4. If you've seen his work, drop an endorsement:\n\n${endorseUrl}\n\nExplore his work at lakshveer.com`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(endorseUrl)}`, '_blank');
  };

  const shareEmail = () => {
    const subject = "Support a young builder - Lakshveer";
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  return (
    <section>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
        Share & Get Endorsements
      </h2>
      
      <div className="bg-[var(--bg-elevated)] border-2 border-[var(--accent)]/30 p-4 md:p-6">
        {/* Pre-written message */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Message to share</span>
            <button
              onClick={copyToClipboard}
              className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-4 bg-[var(--bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] whitespace-pre-wrap font-mono">
            {shareMessage}
          </div>
        </div>

        {/* Share buttons */}
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">Or share directly</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={shareWhatsApp}
              className="px-4 py-2 bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button
              onClick={shareTelegram}
              className="px-4 py-2 bg-[#0088cc] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </button>
            <button
              onClick={shareTwitter}
              className="px-4 py-2 bg-[#1DA1F2] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </button>
            <button
              onClick={shareLinkedIn}
              className="px-4 py-2 bg-[#0A66C2] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
            <button
              onClick={shareEmail}
              className="px-4 py-2 bg-[var(--text-secondary)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email
            </button>
          </div>
        </div>

        {/* Direct link */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-secondary)]">Direct link:</span>
            <code className="flex-1 px-3 py-2 bg-[var(--bg)] border border-[var(--border-subtle)] text-sm text-[var(--accent)] truncate">
              {endorseUrl}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(endorseUrl);
              }}
              className="px-3 py-2 border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <p className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)]">
        {highlight && value > 0 ? (
          <span className="text-[var(--accent)]">{value}</span>
        ) : (
          value
        )}
      </p>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

// Messages Tab
function Messages({
  submissions,
  selected,
  onSelect,
  onDelete,
  formatDate,
}: {
  submissions: Submission[];
  selected: Submission | null;
  onSelect: (s: Submission | null) => void;
  onDelete: (id: number) => void;
  formatDate: (d: string) => string;
}) {
  if (submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[var(--text-secondary)]">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="md:flex md:h-[calc(100vh-130px)]">
      {/* List */}
      <div
        className={`md:w-80 lg:w-96 md:border-r border-[var(--border-subtle)] md:overflow-y-auto ${
          selected ? "hidden md:block" : ""
        }`}
      >
        {submissions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`w-full text-left px-4 py-4 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors ${
              selected?.id === s.id ? "bg-[var(--bg-elevated)]" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {!s.read && (
                <span className="w-2 h-2 mt-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
              )}
              <div className={`flex-1 min-w-0 ${s.read ? "ml-5" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm truncate ${
                      s.read ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)] font-medium"
                    }`}
                  >
                    {s.name}
                  </p>
                  <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                    {formatDate(s.created_at).split(",")[0]}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {categoryLabels[s.category] || s.category}
                </p>
                <p className="text-sm text-[var(--text-secondary)] truncate mt-1">{s.message}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div
        className={`flex-1 md:overflow-y-auto ${
          !selected ? "hidden md:flex md:items-center md:justify-center" : ""
        }`}
      >
        {!selected ? (
          <p className="text-[var(--text-secondary)]">Select a message to read</p>
        ) : (
          <div className="h-full flex flex-col">
            {/* Mobile back */}
            <div className="md:hidden px-4 py-3 border-b border-[var(--border-subtle)]">
              <button onClick={() => onSelect(null)} className="text-sm text-[var(--accent)]">
                ← Back
              </button>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{selected.name}</h2>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-[var(--accent)] text-sm hover:underline"
                >
                  {selected.email}
                </a>
                {selected.organisation && (
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{selected.organisation}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {categoryLabels[selected.category] || selected.category}
                </span>
                <span className="text-xs text-[var(--text-muted)] py-1">{formatDate(selected.created_at)}</span>
              </div>

              <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 md:p-6">
                <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href={`mailto:${selected.email}?subject=Re: Your message on lakshveer.com`}
                  className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Reply
                </a>
                <button
                  onClick={() => onDelete(selected.id)}
                  className="px-4 py-2 border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Endorsements Tab
function Endorsements({ supporters: initialSupporters }: { supporters: Supporter[] }) {
  const [supporters, setSupporters] = useState(initialSupporters);
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);
  const [expandedHandle, setExpandedHandle] = useState<string | null>(null);
  const [customMessages, setCustomMessages] = useState<Record<string, string>>({});
  
  // Update supporters when prop changes
  useEffect(() => {
    setSupporters(initialSupporters);
  }, [initialSupporters]);
  
  // Categorize supporters
  const endorsed = supporters.filter(s => s.quote);
  const sent = supporters.filter(s => !s.quote && s.sent_at);
  const notSent = supporters.filter(s => !s.quote && !s.sent_at);
  
  const getFirstName = (name: string) => {
    if (name.startsWith("Dr. ")) {
      const parts = name.split(" ");
      return parts.length > 2 ? `Dr. ${parts[parts.length - 1]}` : name;
    }
    if (name === "M S Mihir") return "Mihir";
    if (name === "Besta Prem Sai") return "Prem";
    return name.split(" ")[0];
  };
  
  const getDefaultMessage = (s: Supporter) => {
    const firstName = getFirstName(s.name);
    return `Hi ${firstName},

You've been part of Laksh's journey - whether through advice, encouragement, or just watching him ship.

I'm adding a space on his website for supporters to leave a line. Totally optional, but if something comes to mind:

https://lakshveer.com/endorse/${s.token}

Takes 30 seconds. Helps him land more building opportunities, hackathons, grants, and talks.

Thanks for supporting a young builder.
- Capt Venkat`;
  };
  
  const getMessage = (s: Supporter) => {
    return customMessages[s.handle] ?? getDefaultMessage(s);
  };
  
  const copyMessage = (s: Supporter) => {
    navigator.clipboard.writeText(getMessage(s));
    setCopiedHandle(s.handle);
    setTimeout(() => setCopiedHandle(null), 2000);
  };
  
  const markAsSent = async (handle: string) => {
    try {
      await fetch(`/api/supporters/${handle}/sent`, { method: 'POST' });
      setSupporters(prev => prev.map(s => 
        s.handle === handle ? { ...s, sent_at: new Date().toISOString() } : s
      ));
    } catch (e) {
      console.error('Failed to mark as sent:', e);
    }
  };
  
  const unmarkAsSent = async (handle: string) => {
    try {
      await fetch(`/api/supporters/${handle}/sent`, { method: 'DELETE' });
      setSupporters(prev => prev.map(s => 
        s.handle === handle ? { ...s, sent_at: null } : s
      ));
    } catch (e) {
      console.error('Failed to unmark as sent:', e);
    }
  };
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "Z");
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const SupporterCard = ({ s, showSentActions = false }: { s: Supporter; showSentActions?: boolean }) => (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      {/* Header row */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--bg)]/50 transition-colors"
        onClick={() => setExpandedHandle(expandedHandle === s.handle ? null : s.handle)}
      >
        <div className="flex items-center gap-3">
          <svg 
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${expandedHandle === s.handle ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[var(--text-primary)]">{s.name}</p>
              {s.sent_at && (
                <span className="text-xs text-emerald-400">Sent {formatDate(s.sent_at)}</span>
              )}
            </div>
            <p className="text-sm text-[var(--text-muted)]">@{s.handle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!s.sent_at && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyMessage(s);
              }}
              className="px-3 py-1 text-sm bg-[var(--accent)]/10 text-[var(--accent)] rounded hover:bg-[var(--accent)]/20 transition-colors"
            >
              {copiedHandle === s.handle ? "Copied!" : "Copy"}
            </button>
          )}
          {!s.sent_at ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsSent(s.handle);
              }}
              className="px-3 py-1 text-sm bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 transition-colors"
            >
              Mark Sent
            </button>
          ) : showSentActions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                unmarkAsSent(s.handle);
              }}
              className="px-3 py-1 text-sm text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              Undo
            </button>
          )}
        </div>
      </div>
      
      {/* Expanded message */}
      {expandedHandle === s.handle && (
        <div className="px-4 pb-4 border-t border-[var(--border-subtle)]">
          <textarea
            value={getMessage(s)}
            onChange={(e) => setCustomMessages(prev => ({ ...prev, [s.handle]: e.target.value }))}
            className="w-full mt-3 p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] font-mono leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)]"
            rows={12}
          />
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setCustomMessages(prev => {
                const newMessages = { ...prev };
                delete newMessages[s.handle];
                return newMessages;
              })}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Reset to default
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => copyMessage(s)}
                className="px-3 py-1.5 text-xs bg-[var(--accent)] text-[var(--bg)] rounded hover:opacity-90 transition-opacity"
              >
                {copiedHandle === s.handle ? "Copied!" : "Copy Message"}
              </button>
              {!s.sent_at && (
                <button
                  onClick={() => markAsSent(s.handle)}
                  className="px-3 py-1.5 text-xs bg-emerald-500 text-[var(--bg)] rounded hover:opacity-90 transition-opacity"
                >
                  Mark as Sent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Summary */}
      <div className="mb-8 flex flex-wrap gap-4 text-sm">
        <span className="text-[var(--text-secondary)]">
          <span className="text-emerald-400 font-medium">{endorsed.length}</span> endorsed
        </span>
        <span className="text-[var(--border-subtle)]">•</span>
        <span className="text-[var(--text-secondary)]">
          <span className="text-[var(--accent)] font-medium">{sent.length}</span> sent, awaiting
        </span>
        <span className="text-[var(--border-subtle)]">•</span>
        <span className="text-[var(--text-secondary)]">
          <span className="text-[var(--text-primary)] font-medium">{notSent.length}</span> not sent
        </span>
      </div>

      {/* Endorsed */}
      {endorsed.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-medium text-emerald-400 mb-4 uppercase tracking-wider">
            Endorsed ({endorsed.length})
          </h2>
          <div className="space-y-3">
            {endorsed.map((s) => (
              <div key={s.handle} className="bg-[var(--bg-elevated)] border border-emerald-500/20 p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">{s.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">@{s.handle}</p>
                  </div>
                  <span className="text-xs text-emerald-400">{formatDate(s.submitted_at)}</span>
                </div>
                <p className="text-[var(--text-secondary)] italic">"{s.quote}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Not Sent Yet */}
      {notSent.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4 uppercase tracking-wider">
            Not Sent Yet ({notSent.length})
          </h2>
          <div className="space-y-3">
            {notSent.map((s) => (
              <SupporterCard key={s.handle} s={s} />
            ))}
          </div>
        </section>
      )}

      {/* Sent, Awaiting Response */}
      {sent.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-[var(--accent)] mb-4 uppercase tracking-wider">
            Sent, Awaiting Response ({sent.length})
          </h2>
          <div className="space-y-3">
            {sent.map((s) => (
              <SupporterCard key={s.handle} s={s} showSentActions />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Public Endorsements Tab (moderation)
function PublicEndorsementsTab({ 
  endorsements, 
  setEndorsements 
}: { 
  endorsements: PublicEndorsement[]; 
  setEndorsements: React.Dispatch<React.SetStateAction<PublicEndorsement[]>>;
}) {
  const pending = endorsements.filter(e => !e.approved);
  const approved = endorsements.filter(e => e.approved);
  
  const approveEndorsement = async (id: number) => {
    try {
      await fetch(`/api/endorsements/${id}/approve`, { method: 'POST' });
      setEndorsements(prev => prev.map(e => 
        e.id === id ? { ...e, approved: 1 } : e
      ));
    } catch (e) {
      console.error('Failed to approve:', e);
    }
  };
  
  const deleteEndorsement = async (id: number) => {
    if (!confirm('Delete this endorsement?')) return;
    try {
      await fetch(`/api/endorsements/${id}`, { method: 'DELETE' });
      setEndorsements(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "Z");
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const EndorsementCard = ({ e, showApprove = false }: { e: PublicEndorsement; showApprove?: boolean }) => (
    <div className={`bg-[var(--bg-elevated)] border ${showApprove ? 'border-amber-500/30' : 'border-emerald-500/20'} p-4`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-[var(--text-primary)] font-medium">{e.name}</p>
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            {e.handle && <span>@{e.handle.replace('@', '')}</span>}
            {e.role && <span>• {e.role}</span>}
          </div>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{formatDate(e.created_at)}</span>
      </div>
      <p className="text-[var(--text-secondary)] italic mb-4">"{e.quote}"</p>
      <div className="flex gap-2">
        {showApprove && (
          <button
            onClick={() => approveEndorsement(e.id)}
            className="px-3 py-1.5 text-xs bg-emerald-500 text-[var(--bg)] rounded hover:opacity-90 transition-opacity"
          >
            Approve
          </button>
        )}
        <button
          onClick={() => deleteEndorsement(e.id)}
          className="px-3 py-1.5 text-xs border border-[var(--border-subtle)] text-[var(--text-muted)] rounded hover:text-red-400 hover:border-red-400 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Share link */}
      <div className="mb-8 p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg">
        <p className="text-sm text-[var(--text-secondary)] mb-2">Public endorsement link:</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-[var(--bg)] text-[var(--accent)] text-sm rounded">
            https://lakshveer.com/endorse
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://lakshveer.com/endorse');
            }}
            className="px-3 py-2 text-sm bg-[var(--accent)]/10 text-[var(--accent)] rounded hover:bg-[var(--accent)]/20 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8 flex flex-wrap gap-4 text-sm">
        <span className="text-[var(--text-secondary)]">
          <span className="text-amber-400 font-medium">{pending.length}</span> pending review
        </span>
        <span className="text-[var(--border-subtle)]">•</span>
        <span className="text-[var(--text-secondary)]">
          <span className="text-emerald-400 font-medium">{approved.length}</span> approved
        </span>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-medium text-amber-400 mb-4 uppercase tracking-wider">
            Pending Review ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((e) => (
              <EndorsementCard key={e.id} e={e} showApprove />
            ))}
          </div>
        </section>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-emerald-400 mb-4 uppercase tracking-wider">
            Approved ({approved.length})
          </h2>
          <div className="space-y-3">
            {approved.map((e) => (
              <EndorsementCard key={e.id} e={e} />
            ))}
          </div>
        </section>
      )}

      {endorsements.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          No public endorsements yet. Share the link above to collect endorsements.
        </div>
      )}
    </div>
  );
}

export default Insider;
