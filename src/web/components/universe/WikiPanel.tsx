// ============================================
// WIKI PANEL — Universe v8
// ============================================
// Renders the LLM-compiled personal knowledge wiki.
// public/wiki/ — markdown articles compiled from signals.
//
// Pattern: Karpathy (raw/ → wiki/) + Farza (built for agents)
// Human adds to raw/. LLM owns wiki/. Agents navigate via index.md.
// ============================================

import { useState, useEffect } from 'react';

// ---- Markdown renderer (no dep) ----
function md(text: string): string {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="wh1">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="wh2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em class="wem">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="wcod">$1</code>')
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="wlnk">[[<a>$1</a>]]</span>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[^<]*<\/li>\n?)+/g, m => `<ul class="wul">${m}</ul>`)
    .replace(/^---$/gm, '<hr class="whr"/>')
    .replace(/\n{2,}/g, '</p><p class="wp">')
    .replace(/^(?!<[hpul]|<hr|<li)(.+)/gm, '<p class="wp">$1</p>');
}

const CSS = `
.wh1{font-size:1.4rem;font-weight:700;color:#fff;margin-bottom:.5rem;line-height:1.3}
.wh2{font-size:.95rem;font-weight:600;color:#64748b;margin-top:1.5rem;margin-bottom:.4rem;border-bottom:1px solid #1e293b;padding-bottom:.2rem;text-transform:uppercase;letter-spacing:.05em}
.wem{color:#94a3b8}
.wcod{background:#1e293b;color:#7dd3fc;padding:.1rem .3rem;border-radius:.2rem;font-size:.78rem;font-family:monospace}
.wlnk{color:#6366f1;font-size:.78rem}
.wlnk a{color:inherit;text-decoration:none}
.wlnk a:hover{text-decoration:underline}
.wul{color:#cbd5e1;font-size:.85rem;line-height:1.8;margin:.4rem 0 .8rem 1.2rem;list-style:disc}
.wul li{margin-bottom:.15rem}
.whr{border:none;border-top:1px solid #1e293b;margin:1.2rem 0}
.wp{color:#cbd5e1;font-size:.85rem;line-height:1.75;margin-bottom:.6rem}
`;

// ---- Types ----
interface WikiMeta { totalSignals: number; compiledAt: string; totalArticles: number }

interface Article {
  path: string;
  title: string;
  category: 'people' | 'projects' | 'orgs' | 'domains' | 'concepts' | 'meta' | 'queries';
}

const CAT_COLOR: Record<string, string> = {
  people:   'bg-blue-500/15 text-blue-300 border-blue-500/25',
  projects: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  orgs:     'bg-purple-500/15 text-purple-300 border-purple-500/25',
  domains:  'bg-amber-500/15 text-amber-300 border-amber-500/25',
  concepts: 'bg-pink-500/15 text-pink-300 border-pink-500/25',
  meta:     'bg-slate-500/15 text-slate-300 border-slate-500/25',
};

function parseIndexArticles(indexMd: string): Article[] {
  const articles: Article[] = [];
  const cats: Array<Article['category']> = ['people', 'projects', 'orgs', 'domains', 'concepts', 'meta'];
  for (const cat of cats) {
    const re = new RegExp(`## (?:${cat}|organizations|concepts \\(emergent[^)]*\\)|meta)[^\n]*\n((?:- \\[\\[[^\\n]+\n?)+)`, 'i');
    const sec = indexMd.match(re);
    if (!sec) continue;
    for (const line of sec[1].split('\n')) {
      const m = line.match(/\[\[([^\]]+)\]\]/);
      if (!m) continue;
      const p = m[1].endsWith('.md') ? m[1] : `${m[1]}.md`;
      const name = m[1].split('/').pop()!.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      articles.push({ path: p, title: name, category: cat });
    }
  }
  return articles;
}

function parseWikiMeta(indexMd: string): WikiMeta {
  const sigs = indexMd.match(/Signals:\s*(\d+)/)?.[1];
  const arts = indexMd.match(/Articles:\s*(\d+)/)?.[1];
  const comp = indexMd.match(/Compiled:\s*([^\n]+)/)?.[1];
  return {
    totalSignals: sigs ? parseInt(sigs) : 0,
    totalArticles: arts ? parseInt(arts) : 0,
    compiledAt: comp?.trim() ?? '',
  };
}

// ---- Component ----
export function WikiPanel() {
  const [indexContent, setIndexContent] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<WikiMeta | null>(null);
  const [selected, setSelected] = useState('meta/narrative.md');
  const [articleContent, setArticleContent] = useState('');
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [notCompiled, setNotCompiled] = useState(false);

  // Query state
  const [query, setQuery] = useState('');
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState('');
  const [view, setView] = useState<'wiki' | 'query'>('wiki');

  useEffect(() => {
    fetch('/wiki/index.md')
      .then(r => { if (!r.ok) throw new Error('not compiled'); return r.text(); })
      .then(content => {
        setIndexContent(content);
        setArticles(parseIndexArticles(content));
        setMeta(parseWikiMeta(content));
      })
      .catch(() => setNotCompiled(true));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingArticle(true);
    fetch(`/wiki/${selected}`)
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(c => setArticleContent(c))
      .catch(() => setArticleContent('*Article not found. Run `bun run wiki:compile` to regenerate.*'))
      .finally(() => setLoadingArticle(false));
  }, [selected]);

  async function runQuery() {
    if (!query.trim()) return;
    setQuerying(true);
    setView('query');
    setQueryResult('');
    try {
      const res = await fetch('/api/wiki/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
      const { answer } = await res.json();
      setQueryResult(answer ?? 'No answer returned.');
    } catch {
      setQueryResult('Query failed. Check that the wiki is compiled and the API route is available.');
    } finally {
      setQuerying(false);
    }
  }

  // ---- Not compiled state ----
  if (notCompiled) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
        <div className="text-4xl">🧠</div>
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">Wiki not compiled</h3>
          <p className="text-slate-400 text-sm max-w-xs">No wiki articles found. Compile from signals first.</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-emerald-400 text-left w-full max-w-sm">
          <p className="text-slate-500 mb-1"># compile from signals</p>
          <p>bun run wiki:compile</p>
          <p className="mt-2 text-slate-500"># then query it</p>
          <p>bun run wiki:query "your question"</p>
        </div>
        <p className="text-slate-600 text-xs max-w-xs">
          raw/ → LLM compiler → wiki/ → agent navigates via index.md
        </p>
      </div>
    );
  }

  const filtered = articles.filter(a => catFilter === 'all' || a.category === catFilter);
  const cats = ['all', 'people', 'projects', 'orgs', 'domains', 'concepts', 'meta'];

  return (
    <div className="flex h-full overflow-hidden">
      <style>{CSS}</style>

      {/* ---- Sidebar ---- */}
      <div className="w-56 flex-shrink-0 border-r border-slate-800 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base">🧠</span>
            <span className="text-white font-semibold text-sm">Knowledge Wiki</span>
          </div>
          {meta && (
            <p className="text-slate-600 text-xs">
              {meta.totalArticles} articles · {meta.totalSignals} signals
            </p>
          )}
          <p className="text-slate-700 text-xs">LLM-compiled · agent-native</p>
        </div>

        {/* Query box */}
        <div className="p-2 border-b border-slate-800">
          <div className="flex gap-1">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runQuery()}
              placeholder="Ask the wiki..."
              className="flex-1 bg-slate-900 text-slate-200 text-xs rounded-lg px-2.5 py-2 border border-slate-700 placeholder-slate-600 focus:outline-none focus:border-slate-500 min-w-0"
            />
            <button
              onClick={runQuery}
              disabled={querying || !query.trim()}
              className="px-2 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs transition-colors flex-shrink-0"
            >
              {querying ? '…' : '↵'}
            </button>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex border-b border-slate-800">
          {(['wiki', 'query'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-1.5 text-xs capitalize transition-colors ${
                view === v ? 'text-white bg-white/5' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {v === 'wiki' ? '📖 Wiki' : '💬 Answer'}
            </button>
          ))}
        </div>

        {view === 'wiki' && (
          <>
            {/* Meta quick links */}
            <div className="p-2 border-b border-slate-800 space-y-0.5">
              {[
                { path: 'meta/narrative.md', label: '📖 Narrative' },
                { path: 'meta/connections.md', label: '🔗 Connections' },
                { path: 'meta/gaps.md', label: '⚠️ Gaps' },
                { path: 'index.md', label: '📋 Index' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => { setSelected(item.path); setView('wiki'); }}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                    selected === item.path ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="px-2 py-2 border-b border-slate-800 flex flex-wrap gap-1">
              {cats.map(c => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`text-xs px-1.5 py-0.5 rounded capitalize transition-colors ${
                    catFilter === c ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Article list */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {filtered.map(a => (
                <button
                  key={a.path}
                  onClick={() => { setSelected(a.path); setView('wiki'); }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors group ${
                    selected === a.path ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-xs px-1 py-0 rounded border capitalize leading-4 ${CAT_COLOR[a.category]}`}>
                      {a.category}
                    </span>
                  </div>
                  <p className={`text-xs font-medium leading-tight ${
                    selected === a.path ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {a.title}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ---- Main content ---- */}
      <div className="flex-1 overflow-y-auto">
        {view === 'query' ? (
          <div className="p-6 max-w-3xl">
            {querying ? (
              <div className="flex items-center gap-3 text-slate-400 text-sm mt-8">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Agent reading wiki...
              </div>
            ) : queryResult ? (
              <>
                <div className="mb-4 text-xs text-slate-600">Query: <span className="text-slate-400 italic">{query}</span></div>
                <div dangerouslySetInnerHTML={{ __html: md(queryResult) }} />
              </>
            ) : (
              <div className="text-slate-600 text-sm mt-8">Type a question and press ↵</div>
            )}
          </div>
        ) : (
          <div className="p-6 max-w-3xl">
            {loadingArticle ? (
              <div className="text-slate-500 text-sm mt-8">Loading...</div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: md(articleContent) }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
