import siteConfig from "../../../website.config.json";

export function Metadata() {
	return (
		<>
			{/* Primary Meta Tags */}
			<title>{siteConfig.name}</title>
			<meta name="title" content={siteConfig.name} />
			<meta name="description" content={siteConfig.description} />

			{/* Open Graph / Facebook */}
			<meta property="og:type" content="website" />
			<meta property="og:site_name" content={siteConfig.siteName} />
			<meta property="og:locale" content={siteConfig.locale} />
			<meta property="og:title" content={siteConfig.name} />
			<meta property="og:description" content={siteConfig.description} />
			<meta property="og:image" content={siteConfig.ogImage} />
			<meta property="og:url" content={siteConfig.url} />

			{/* Twitter */}
			<meta name="twitter:card" content={siteConfig.twitter.card} />
			<meta name="twitter:site" content={siteConfig.twitter.site} />
			<meta name="twitter:title" content={siteConfig.name} />
			<meta name="twitter:description" content={siteConfig.description} />
			<meta name="twitter:image" content={siteConfig.ogImage} />

			{/* Theme */}
			<meta name="theme-color" content={siteConfig.themeColor} />
		</>
	);
}
