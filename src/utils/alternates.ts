import { getTranslations } from "emdash";
import { asLocale, localePath, type Locale } from "../i18n/ui";

/**
 * URLs of an entry's published translations, keyed by locale, for the
 * language switcher and hreflang links. Locales without a published
 * translation are left out, so the switcher falls back to that locale's
 * homepage.
 *
 * @param route builds the locale-less path for a slug, e.g. (s) => `/pages/${s}`;
 * it also receives the locale for routes whose base differs per language
 */
export async function translationAlternates(
	collection: string,
	entryId: string,
	route: (slug: string, locale: Locale) => string,
): Promise<Partial<Record<Locale, string>>> {
	const { translations } = await getTranslations(collection, entryId);
	const result: Partial<Record<Locale, string>> = {};
	for (const tr of translations) {
		if (tr.status !== "published" || !tr.slug) continue;
		const locale = asLocale(tr.locale);
		if (locale !== tr.locale) continue; // not one of the site's locales
		result[locale] = localePath(locale, route(tr.slug, locale));
	}
	return result;
}
