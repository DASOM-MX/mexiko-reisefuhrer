/**
 * Content loaders shared by the per-locale routes (/, /en, /es …).
 *
 * Routes call these and handle a `null` result with Astro.rewrite("/404"),
 * since a rewrite can only be issued from a page, not from a component.
 */
import type { AstroGlobal } from "astro";
import { decodeSlug, getEmDashCollection, getEmDashEntry, getSeoMeta, getSiteSettings } from "emdash";
import { resolveBlogSiteIdentity } from "../utils/site-identity";
import { translationAlternates } from "../utils/alternates";
import { getImage } from "astro:assets";
import { galleryPath, GALLERY_BASE, type Locale } from "../i18n/ui";
import type { CarouselAlbum, CarouselImage } from "../components/gallery/types";

type Cacheable = { cacheHint?: unknown };

function registerCache(Astro: AstroGlobal, ...results: Cacheable[]) {
	if (!Astro.cache?.enabled) return;
	for (const r of results) if (r.cacheHint) Astro.cache.set(r.cacheHint as never);
}

async function seoFor(Astro: AstroGlobal, entry: Parameters<typeof getSeoMeta>[0], defaultOgImage?: string) {
	const { siteTitle } = resolveBlogSiteIdentity(await getSiteSettings());
	return getSeoMeta(entry, {
		siteTitle,
		siteUrl: Astro.url.origin,
		path: Astro.url.pathname.replace(/\/$/, ""),
		defaultOgImage,
	});
}

export async function loadHome(Astro: AstroGlobal, locale: Locale) {
	const [homeResult, destResult] = await Promise.all([
		getEmDashEntry("home", "startseite", { locale }),
		// `where` only takes string values, so the boolean "featured" flag is
		// filtered here. The collection is small (a handful of regions).
		getEmDashCollection("destinations", {
			locale,
			orderBy: { sort_order: "asc" },
			limit: 50,
		}),
	]);
	registerCache(Astro, homeResult, destResult);
	if (!homeResult.entry) return null;
	const destinations = destResult.entries.filter((e) => e.data.featured).slice(0, 2);
	return { home: homeResult.entry, destinations };
}

export async function loadPage(Astro: AstroGlobal, locale: Locale) {
	const slug = decodeSlug(Astro.params.slug);
	if (!slug) return null;
	const result = await getEmDashEntry("pages", slug, { locale });
	registerCache(Astro, result);
	const page = result.entry;
	if (!page) return null;
	const [seo, alternates] = await Promise.all([
		seoFor(Astro, page),
		translationAlternates("pages", page.data.id, (s) => `/pages/${s}`),
	]);
	return { page, slug, seo, alternates, isFallback: !!result.fallbackLocale };
}

export async function loadDestination(Astro: AstroGlobal, locale: Locale) {
	const slug = decodeSlug(Astro.params.slug);
	if (!slug) return null;
	const result = await getEmDashEntry("destinations", slug, { locale });
	registerCache(Astro, result);
	const entry = result.entry;
	if (!entry) return null;
	const [seo, alternates] = await Promise.all([
		seoFor(Astro, entry, entry.data.featured_image?.src),
		translationAlternates("destinations", entry.data.id, (s) => `/sehenswuerdigkeiten/${s}`),
	]);
	return { entry, slug, seo, alternates, isFallback: !!result.fallbackLocale };
}

/**
 * Turns an EmDash image field value into a plain, resizable URL string for
 * the React carousel (which cannot use the <Image> Astro component). Mirrors
 * what `emdash/ui`'s <Image> does: `src` if present, otherwise the media
 * route for the storage key / id, then Astro's image service for a resized
 * webp when the intrinsic size is known.
 */
export async function islandImage(
	Astro: AstroGlobal,
	img: { src?: string; id?: string; alt?: string; width?: number; height?: number; meta?: Record<string, unknown> } | null | undefined,
	fallbackAlt: string,
	maxWidth = 960,
): Promise<CarouselImage | null> {
	if (!img) return null;
	const storageKey = img.meta?.storageKey as string | undefined;
	const resolve = (Astro.locals as { emdash?: { getPublicMediaUrl?: (k: string) => string } }).emdash?.getPublicMediaUrl;
	let src = img.src || "";
	if (!src && storageKey) src = resolve ? resolve(storageKey) : `/_emdash/api/media/file/${storageKey}`;
	if (!src && img.id) src = `/_emdash/api/media/file/${img.id}`;
	if (!src) return null;
	if (img.width && img.height) {
		try {
			const abs = new URL(src, Astro.url.origin).href;
			const w = Math.min(maxWidth, img.width);
			const out = await getImage({ src: abs, width: w, height: Math.round((w * img.height) / img.width), format: "webp" });
			src = out.src;
		} catch {
			/* keep the original URL */
		}
	}
	return { src, alt: img.alt || fallbackAlt };
}

type PhotoRow = { image?: Parameters<typeof islandImage>[1]; caption?: string };
export type GalleryFields = {
	id: string;
	title: string;
	description?: string;
	cover?: Parameters<typeof islandImage>[1] & { src?: string };
	photos?: PhotoRow[];
};

export async function loadGalleryIndex(Astro: AstroGlobal, locale: Locale) {
	const [homeResult, albumResult] = await Promise.all([
		getEmDashEntry("home", "startseite", { locale }),
		getEmDashCollection("galleries", { locale, orderBy: { sort_order: "asc" }, limit: 100 }),
	]);
	registerCache(Astro, homeResult, albumResult);
	const home = homeResult.entry;
	if (!home) return null;
	const albums: CarouselAlbum[] = [];
	for (const entry of albumResult.entries) {
		// Loosely typed until `emdash types` has seen the "galleries" collection.
		const data = entry.data as GalleryFields;
		const photos = (data.photos ?? []).filter((p) => p.image);
		const cover = await islandImage(Astro, data.cover ?? photos[0]?.image, data.title);
		if (!cover) continue;
		const previews = (await Promise.all(photos.slice(0, 3).map((p) => islandImage(Astro, p.image, data.title)))).filter(
			(x): x is CarouselImage => !!x,
		);
		albums.push({ href: galleryPath(locale, entry.id), title: data.title, cover, previews });
	}
	const seo = await seoFor(Astro, home);
	const alternates = Object.fromEntries(
		(Object.keys(GALLERY_BASE) as Locale[]).map((l) => [l, galleryPath(l)]),
	) as Record<Locale, string>;
	return { home, albums, seo, alternates };
}

export async function loadGallery(Astro: AstroGlobal, locale: Locale) {
	const slug = decodeSlug(Astro.params.slug);
	if (!slug) return null;
	const result = await getEmDashEntry("galleries", slug, { locale });
	registerCache(Astro, result);
	const entry = result.entry;
	if (!entry) return null;
	const data = entry.data as GalleryFields;
	const [seo, alternates] = await Promise.all([
		seoFor(Astro, entry, data.cover?.src),
		translationAlternates("galleries", data.id, (s, l) => `${GALLERY_BASE[l]}/${s}`),
	]);
	return { entry, slug, seo, alternates, isFallback: !!result.fallbackLocale };
}

export type GalleryIndexData = NonNullable<Awaited<ReturnType<typeof loadGalleryIndex>>>;
export type GalleryData = NonNullable<Awaited<ReturnType<typeof loadGallery>>>;
export type HomeData = NonNullable<Awaited<ReturnType<typeof loadHome>>>;
export type PageData = NonNullable<Awaited<ReturnType<typeof loadPage>>>;
export type DestinationData = NonNullable<Awaited<ReturnType<typeof loadDestination>>>;
