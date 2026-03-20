import { useState, useEffect } from "react";

interface YouTubeData {
  thumbnail: string;
  title: string;
  videoId: string;
  publishedAt: string;
}

interface BuildingStatus {
  text: string;
  date: string;
  tweetUrl: string;
}

export function LatestYouTube() {
  const [data, setData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/youtube/latest")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.video) {
          setData(result.video);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="aspect-video bg-[var(--bg-elevated)] rounded-lg mb-2"></div>
        <div className="h-4 bg-[var(--bg-elevated)] rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail - don't show broken state
  }

  return (
    <a
      href={`https://youtube.com/watch?v=${data.videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg mb-2 bg-[var(--bg-elevated)]">
        <img
          src={data.thumbnail}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 group-hover:text-[var(--text-primary)] transition-colors">
        {data.title}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">Latest on YouTube ↗</p>
    </a>
  );
}

export function CurrentlyBuilding() {
  const [data, setData] = useState<BuildingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/building/status")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.status) {
          setData(result.status);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-[var(--bg-elevated)] rounded w-full mb-2"></div>
        <div className="h-4 bg-[var(--bg-elevated)] rounded w-2/3"></div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail
  }

  return (
    <a
      href={data.tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] transition-colors rounded-lg group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
        </span>
        <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">Currently Building</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
        {data.text}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        via @CaptVenk · {data.date} ↗
      </p>
    </a>
  );
}
