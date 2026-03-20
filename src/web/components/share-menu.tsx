import { useState, useRef, useEffect } from "react";

interface ShareMenuProps {
  slug: string;
  quote: string;
}

interface ShareOption {
  name: string;
  getUrl: (shareUrl: string, shareText: string) => string;
  isExternal: boolean;
}

const truncateQuote = (quote: string, maxLength: number = 80): string => {
  if (quote.length <= maxLength) return quote;
  return quote.substring(0, maxLength).trim() + "...";
};

const generateShareText = (quote: string): string => {
  const truncated = truncateQuote(quote);
  return `${truncated} - Endorsement for @LakshveerRao, 8-year-old Hardware + AI Systems Builder`;
};

const shareOptions: ShareOption[] = [
  {
    name: "X",
    getUrl: (shareUrl, shareText) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    isExternal: true,
  },
  {
    name: "LinkedIn",
    getUrl: (shareUrl) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    isExternal: true,
  },
  {
    name: "WhatsApp",
    getUrl: (shareUrl, shareText) => 
      `https://wa.me/?text=${encodeURIComponent(shareText)}%20${encodeURIComponent(shareUrl)}`,
    isExternal: true,
  },
  {
    name: "Email",
    getUrl: (shareUrl, shareText) => 
      `mailto:?subject=${encodeURIComponent("Voice for Lakshveer Rao")}&body=${encodeURIComponent(shareText)}%0A%0A${encodeURIComponent(shareUrl)}`,
    isExternal: false,
  },
];

export const ShareMenu = ({ slug, quote }: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/recognition/${slug}`
    : `/recognition/${slug}`;
  
  const shareText = generateShareText(quote);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-[var(--accent)] hover:opacity-80 transition-opacity duration-150"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Share
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-2 z-50 flex flex-wrap gap-3 p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] min-w-max"
          role="menu"
        >
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.getUrl(shareUrl, shareText)}
              target={option.isExternal ? "_blank" : undefined}
              rel={option.isExternal ? "noopener noreferrer" : undefined}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 whitespace-nowrap"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              {option.name} {option.isExternal ? "↗" : ""}
            </a>
          ))}
          <button
            onClick={handleCopyLink}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 whitespace-nowrap"
            role="menuitem"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
