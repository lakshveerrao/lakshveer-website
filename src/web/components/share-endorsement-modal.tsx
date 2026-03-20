import { useState, useEffect, useRef, useCallback } from "react";

interface ShareEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  name: string;
  handle?: string | null;
  role?: string | null;
  organisation?: string | null;
}

export function ShareEndorsementModal({
  isOpen,
  onClose,
  quote,
  name,
  handle,
  role,
  organisation,
}: ShareEndorsementModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"square" | "landscape">("square");

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions based on aspect ratio
    const width = aspectRatio === "square" ? 1080 : 1200;
    const height = aspectRatio === "square" ? 1080 : 630;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, width, height);

    // Subtle gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(34, 211, 238, 0.03)");
    gradient.addColorStop(1, "rgba(34, 211, 238, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = "rgba(244, 244, 245, 0.12)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Quote mark decoration (using Unicode for curly quote)
    ctx.fillStyle = "rgba(34, 211, 238, 0.15)";
    ctx.font = `bold ${aspectRatio === "square" ? "200px" : "140px"} Georgia, serif`;
    ctx.fillText("\u201C", aspectRatio === "square" ? 60 : 50, aspectRatio === "square" ? 200 : 160);

    // Calculate text area
    const padding = aspectRatio === "square" ? 100 : 80;
    const maxWidth = width - padding * 2;
    const quoteStartY = aspectRatio === "square" ? 280 : 180;

    // Quote text - wrap lines
    ctx.fillStyle = "#f4f4f5";
    const fontSize = aspectRatio === "square" ? 42 : 32;
    ctx.font = `400 ${fontSize}px system-ui, -apple-system, sans-serif`;

    const words = quote.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Limit lines to prevent overflow
    const maxLines = aspectRatio === "square" ? 12 : 6;
    const displayLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      displayLines[maxLines - 1] = displayLines[maxLines - 1].slice(0, -3) + "...";
    }

    // Draw quote with proper curly quotes
    const lineHeight = fontSize * 1.5;
    const openQuote = "\u201C"; // "
    const closeQuote = "\u201D"; // "
    
    displayLines.forEach((line, i) => {
      let text = line;
      if (i === 0) text = openQuote + text;
      if (i === displayLines.length - 1) text = text + closeQuote;
      ctx.fillText(text, padding, quoteStartY + i * lineHeight);
    });

    // Attribution area
    const attributionY = aspectRatio === "square" ? height - 200 : height - 140;

    // Divider line
    ctx.strokeStyle = "rgba(244, 244, 245, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, attributionY);
    ctx.lineTo(width - padding, attributionY);
    ctx.stroke();

    // Name
    ctx.fillStyle = "#f4f4f5";
    ctx.font = `600 ${aspectRatio === "square" ? "32px" : "24px"} system-ui, -apple-system, sans-serif`;
    ctx.fillText(`\u2014 ${name}`, padding, attributionY + (aspectRatio === "square" ? 50 : 40));

    // Role/Org or Handle
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `400 ${aspectRatio === "square" ? "24px" : "18px"} system-ui, -apple-system, sans-serif`;
    const subtitle = role && organisation 
      ? `${role}, ${organisation}`
      : handle 
        ? handle 
        : "";
    if (subtitle) {
      ctx.fillText(subtitle, padding, attributionY + (aspectRatio === "square" ? 90 : 70));
    }

    // Branding
    ctx.fillStyle = "#22d3ee";
    ctx.font = `500 ${aspectRatio === "square" ? "20px" : "16px"} system-ui, -apple-system, sans-serif`;
    const brandText = "lakshveer.com";
    const brandMetrics = ctx.measureText(brandText);
    ctx.fillText(brandText, width - padding - brandMetrics.width, attributionY + (aspectRatio === "square" ? 50 : 40));

    // Tagline
    ctx.fillStyle = "#71717a";
    ctx.font = `400 ${aspectRatio === "square" ? "16px" : "14px"} system-ui, -apple-system, sans-serif`;
    const tagline = "Hardware + AI Builder, Age 8";
    const tagMetrics = ctx.measureText(tagline);
    ctx.fillText(tagline, width - padding - tagMetrics.width, attributionY + (aspectRatio === "square" ? 80 : 65));

    setImageDataUrl(canvas.toDataURL("image/png"));
  }, [quote, name, handle, role, organisation, aspectRatio]);

  useEffect(() => {
    if (isOpen) {
      generateImage();
    }
  }, [isOpen, generateImage]);

  const handleDownload = () => {
    if (!imageDataUrl) return;
    const link = document.createElement("a");
    link.download = `endorsement-${name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  const handleCopyText = async () => {
    const text = `"${quote}"\n\n\u2014 ${name}${role && organisation ? `, ${role} at ${organisation}` : handle ? ` (${handle})` : ""}\n\nlakshveer.com`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `"${quote.slice(0, 200)}${quote.length > 200 ? "..." : ""}"\n\n\u2014 ${name}`;
    const url = "https://lakshveer.com";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const handleShareLinkedIn = () => {
    const url = "https://lakshveer.com";
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#09090b] border border-[var(--border-subtle)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Share Endorsement</h3>
          <button 
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Aspect ratio toggle */}
        <div className="flex gap-2 px-6 pt-4">
          <button
            onClick={() => setAspectRatio("square")}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              aspectRatio === "square" 
                ? "border-[var(--accent)] text-[var(--accent)]" 
                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            1:1 Square
          </button>
          <button
            onClick={() => setAspectRatio("landscape")}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              aspectRatio === "landscape" 
                ? "border-[var(--accent)] text-[var(--accent)]" 
                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            1200x630 OG
          </button>
        </div>

        {/* Canvas (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview */}
        <div className="p-6">
          {imageDataUrl && (
            <img 
              src={imageDataUrl} 
              alt="Endorsement card preview"
              className="w-full border border-[var(--border-subtle)]"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 px-6 pb-6">
          <button
            onClick={handleShareTwitter}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Twitter
          </button>
          <button
            onClick={handleShareLinkedIn}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Small share button component for endorsement cards
interface ShareButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export function EndorsementShareButton({ onClick, className = "" }: ShareButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200 ${className}`}
      title="Share endorsement"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share
    </button>
  );
}
