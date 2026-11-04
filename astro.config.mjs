import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	// German is the default locale and stays unprefixed (/). English and
	// Spanish live under /en and /es. Do NOT enable prefixDefaultLocale:
	// it breaks the EmDash admin at /_emdash/admin.
	i18n: {
		defaultLocale: "de",
		locales: ["de", "en", "es"],
		fallback: { en: "de", es: "de" },
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [formsPlugin({ defaultSpamProtection: "honeypot" })],
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Google Sans Flex",
			cssVariable: "--font-body",
			weights: [400, 500, 600],
			fallbacks: ["system-ui", "sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500],
			fallbacks: ["monospace"],
		},
	],
	devToolbar: { enabled: false },
});
