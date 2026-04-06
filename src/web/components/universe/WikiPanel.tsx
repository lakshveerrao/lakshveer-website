// ============================================
// WIKI PANEL — Universe v7
// ============================================
// Renders the LLM-compiled personal knowledge wiki.
// The wiki lives in public/wiki/ as markdown files.
// This panel is the "agent's view" made readable.
// ============================================

import { useState, useEffect } from 'react';

interface WikiArticle {
  path: string;
  title: string;
  category: 'people' | 'projects' | 'orgs' | 'domains' | 'concepts' | 'meta' | 'queries';
  summary: string;
}

interface WikiIndex {
  articles: WikiArticle[];
  totalSignals: number;
  compiledAt: string;
}

// Simple markdown → HTML renderer (no dependency)
function renderMarkdown(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="wiki-h1">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="wiki-h2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="wiki-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="wiki-code">$1</code>')
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="wiki-backlink">[[<a href="#">$1</a>]]</span>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="wiki-list">$&</ul>')
    .replace(/^---$/gm, '<hr class="wiki-hr" />')
    .replace(/\n\n/g, '</p><p class="wiki-p">')
    .replace(/^(?!<[hpul]|<hr|<li)(.*)/gm, '<p class="wiki-p">$1</p>');
}

// Parse index.md to extract article list
function parseIndex(indexContent: string): WikiIndex {
  const articles: WikiArticle[] = [];

  const categories: Array<WikiArticle['category']> = ['people', 'projects', 'orgs', 'domains', 'concepts', 'meta'];
  for (const cat of categories) {
    const sectionMatch = indexContent.match(new RegExp(`## (?:${cat.charAt(0).toUpperCase() + cat.slice(1)}[^\n]*)\n((?:- \\[\\[[^\\n]+\\n?)+)`, 'i'));
    if (sectionMatch) {
      const lines = sectionMatch[1].split('\n').filter(l => l.trim().startsWith('- [['));
      for (const line of lines) {
        const match = line.match(/\[\[([^\]]+)\]\]\s*(?:—\s*(.+))?/);
        if (match) {
          const path = match[1].endsWith('.md') ? match[1] : `${match[1]}.md`;
          const namePart = match[1].split('/').pop() ?? match[1];
          const title = namePart.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          articles.push({
            path,
            title,
            category: cat,
            summary: match[2]?.trim() ?? '',
          });
        }
      }
    }
  }

  const signalsMatch = indexContent.match(/Total signals: (\d+)/);
  const compiledMatch = indexContent.match(/Last compiled: (.+)/);

  return {
    articles,
    totalSignals: signalsMatch ? parseInt(signalsMatch[1]) : 0,
    compiledAt: compiledMatch ? compiledMatch[1].trim() : '',
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  people: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  projects: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  orgs: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  domains: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  concepts: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  meta: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  queries: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export function WikiPanel() {
  const [wikiIndex, setWikiIndex] = useState<WikiIndex | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>('index.md');
  const [articleContent, setArticleContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [notCompiled, setNotCompiled] = useState(false);

  // Load index on mount
  useEffect(() => {
    fetch('/wiki/index.md')
      .then(r => {
        if (!r.ok) throw new Error('not compiled');
        return r.text();
      })
      .then(content => {
        setWikiIndex(parseIndex(content));
        setArticleContent(content);
      })
      .catch(() => setNotCompiled(true));
  }, []);

  // Load article when selected
  useEffect(() => {
    if (!selectedPath) return;
    setLoading(true);
    fetch(`/wiki/${selectedPath}`)
      .then(r => r.ok ? r.text() : Promise.reject('not found'))
      .then(content => setArticleContent(content))
      .catch(() => setArticleContent('*Article not found*'))
      .finally(() => setLoading(false));
  }, [selectedPath]);

  if (notCompiled) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">🧠</div>
        <div>
          <h3 className="text-white font-semibold text-lg mb-2">Wiki Not Compiled Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            The personal knowledge wiki hasn't been compiled from signals yet.
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-emerald-400 w-full max-w-md text-left">
          <p className="text-slate-500 mb-1"># compile from signals</p>
          <p>bun scripts/compile-wiki.ts</p>
          <p className="mt-2 text-slate-500"># then query it</p>
          <p>bun scripts/query-wiki.ts "your question"</p>
        </div>
        <p className="text-slate-600 text-xs max-w-sm">
          Inspired by Karpathy's LLM Knowledge Base and Farza's Farzapedia.
          Raw signals → LLM compiles → filesystem wiki → agent navigates.
        </p>
      </div>
    );
  }

  const categories = ['all', 'people', 'projects', 'orgs', 'domains', 'concepts', 'meta'];

  const filteredArticles = wikiIndex?.articles.filter(
    a => activeCategory === 'all' || a.category === activeCategory
  ) ?? [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🧠</span>
            <span className="text-white font-semibold text-sm">Knowledge Wiki</span>
          </div>
          {wikiIndex && (
            <p className="text-slate-500 text-xs">
              {wikiIndex.articles.length} articles · {wikiIndex.totalSignals} signals
            </p>
          )}
          <p className="text-slate-600 text-xs mt-1">LLM-compiled · agent-native</p>
        </div>

        {/* Category filter */}
        <div className="p-3 border-b border-slate-800 flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2 py-1 rounded-md capitalize transition-colors ${
                activeCategory === cat
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Meta articles quick access */}
        <div className="p-3 border-b border-slate-800">
          {[
            { path: 'index.md', label: '📋 Index' },
            { path: 'meta/narrative.md', label: '📖 Narrative' },
            { path: 'meta/gaps.md', label: '⚠️ Gaps' },
            { path: 'meta/connections.md', label: '🔗 Connections' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => setSelectedPath(item.path)}
              className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                selectedPath === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredArticles.map(article => (
            <button
              key={article.path}
              onClick={() => setSelectedPath(article.path)}
              className={`w-full text-left p-2 rounded-lg mb-1 transition-colors group ${
                selectedPath === article.path
                  ? 'bg-white/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-1.5 py-0.5 rounded border capitalize ${CATEGORY_COLORS[article.category]}`}>
                  {article.category}
                </span>
              </div>
              <p className={`text-xs font-medium leading-tight ${
                selectedPath === article.path ? 'text-white' : 'text-slate-300 group-hover:text-white'
              }`}>
                {article.title}
              </p>
              {article.summary && (
                <p className="text-slate-600 text-xs mt-0.5 leading-tight line-clamp-2">{article.summary}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Article viewer */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-500 text-sm">Loading...</div>
          </div>
        ) : (
          <div className="p-6 max-w-3xl">
            <style>{`
              .wiki-h1 { font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.5rem; }
              .wiki-h2 { font-size: 1.1rem; font-weight: 600; color: #94a3b8; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.25rem; }
              .wiki-h3 { font-size: 0.95rem; font-weight: 600; color: #64748b; margin-top: 1rem; }
              .wiki-p { color: #cbd5e1; font-size: 0.875rem; line-height: 1.7; margin-bottom: 0.75rem; }
              .wiki-list { color: #cbd5e1; font-size: 0.875rem; line-height: 1.7; margin: 0.5rem 0 0.75rem 1rem; list-style: disc; }
              .wiki-list li { margin-bottom: 0.25rem; }
              .wiki-code { background: #1e293b; color: #7dd3fc; padding: 0.1rem 0.3rem; border-radius: 0.25rem; font-size: 0.8rem; font-family: monospace; }
              .wiki-backlink { color: #818cf8; font-size: 0.8rem; }
              .wiki-backlink a { color: inherit; text-decoration: none; }
              .wiki-backlink a:hover { text-decoration: underline; }
              .wiki-hr { border: none; border-top: 1px solid #1e293b; margin: 1.5rem 0; }
            `}</style>
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdown(articleContent) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
