import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
}

const DEFAULT_TITLE = "Lakshveer Rao | Hardware + AI Systems Builder";
const DEFAULT_DESCRIPTION = "Builds to learn. Age 8. Hyderabad, India.";
const DEFAULT_OG_IMAGE = "/og-image.png";

/**
 * SEO component for managing page-specific metadata
 * Updates document title and meta tags dynamically
 */
export function SEO({ title, description, ogImage }: SEOProps) {
  const pageTitle = title ? `${title}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageOgImage = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", pageDescription);
    }

    // Update OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", pageTitle);
    }

    // Update OG description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", pageDescription);
    }

    // Update OG image
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute("content", pageOgImage);
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", pageTitle);
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute("content", pageDescription);
    }

    // Update Twitter image
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute("content", pageOgImage);
    }

    // Cleanup: reset to default on unmount
    return () => {
      document.title = DEFAULT_TITLE;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", DEFAULT_DESCRIPTION);
      }
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) {
        ogImg.setAttribute("content", DEFAULT_OG_IMAGE);
      }
      const twitterImg = document.querySelector('meta[name="twitter:image"]');
      if (twitterImg) {
        twitterImg.setAttribute("content", DEFAULT_OG_IMAGE);
      }
    };
  }, [pageTitle, pageDescription, pageOgImage]);

  return null;
}

// Page-specific title configurations
export const PAGE_TITLES = {
  home: "Lakshveer Rao | Hardware + AI Systems Builder",
  systems: "Systems | Lakshveer Rao",
  impact: "Impact | Lakshveer Rao",
  journey: "Journey | Lakshveer Rao",
  venture: "Projects by Laksh | Venture",
  collaborate: "Collaborate | Lakshveer Rao",
  insider: "Insider | Lakshveer Rao",
  recognition: "Voices | Lakshveer Rao",
  share: "Share Portfolio | Lakshveer Rao",
  invite: "Invite Laksh | Guest Talks, Hackathons & Events",
  press: "Press Kit | Lakshveer Rao",
} as const;
