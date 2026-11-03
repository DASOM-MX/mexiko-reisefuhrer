import { getRelativeLocaleUrl } from "astro:i18n";

/**
 * Interface strings that are part of the theme, not the content. Everything
 * the editor should be able to change lives in the CMS instead.
 */
export const LOCALES = ["de", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export function asLocale(value: string | undefined | null): Locale {
	return (LOCALES as readonly string[]).includes(value ?? "")
		? (value as Locale)
		: DEFAULT_LOCALE;
}

/** Locale-aware path, e.g. ("en", "/pages/impressum") → "/en/pages/impressum". */
export function localePath(locale: Locale, path = "/"): string {
	const [pathname, hash] = path.split("#");
	const url = getRelativeLocaleUrl(locale, pathname.replace(/^\//, ""));
	return hash ? `${url}#${hash}` : url;
}

export const GALLERY_BASE: Record<Locale, string> = {
	de: "/galerie",
	en: "/gallery",
	es: "/galeria",
};

/** Gallery index or album URL, e.g. ("en", "teotihuacan") → "/en/gallery/teotihuacan". */
export function galleryPath(locale: Locale, slug?: string): string {
	return localePath(locale, GALLERY_BASE[locale] + (slug ? `/${slug}` : ""));
}

const strings = {
	de: {
		languageName: "Deutsch",
		skipToContent: "Zum Inhalt springen",
		mainNav: "Hauptnavigation",
		openMenu: "Menü öffnen",
		contact: "Kontakt",
		imprint: "Impressum",
		privacy: "Datenschutz",
		language: "Sprache",
		formMissing:
			"Das Kontaktformular ist noch nicht eingerichtet. Im Admin unter Plugins → Forms ein Formular mit dieser ID anlegen:",
		pageNotFound: "Seite nicht gefunden",
		backHome: "Zur Startseite",
		translationFallback: "Diese Seite ist noch nicht übersetzt.",
		galleryAlbums: "Alben",
		prevAlbum: "Vorheriges Album",
		nextAlbum: "Nächstes Album",
		backToGallery: "Zur Galerie",
		photoCount: (n: number) => (n === 1 ? "1 Foto" : `${n} Fotos`),
		lightboxClose: "Schließen",
		lightboxPrev: "Vorheriges Foto",
		lightboxNext: "Nächstes Foto",
		galleryEmpty: "Noch keine Alben vorhanden.",
	},
	en: {
		languageName: "English",
		skipToContent: "Skip to content",
		mainNav: "Main navigation",
		openMenu: "Open menu",
		contact: "Contact",
		imprint: "Legal notice",
		privacy: "Privacy",
		language: "Language",
		formMissing:
			"The contact form is not set up yet. In the admin, go to Plugins → Forms and create a form with this ID:",
		pageNotFound: "Page not found",
		backHome: "Back to the homepage",
		translationFallback: "This page has not been translated into English yet.",
		galleryAlbums: "Albums",
		prevAlbum: "Previous album",
		nextAlbum: "Next album",
		backToGallery: "Back to the gallery",
		photoCount: (n: number) => (n === 1 ? "1 photo" : `${n} photos`),
		lightboxClose: "Close",
		lightboxPrev: "Previous photo",
		lightboxNext: "Next photo",
		galleryEmpty: "No albums yet.",
	},
	es: {
		languageName: "Español",
		skipToContent: "Ir al contenido",
		mainNav: "Navegación principal",
		openMenu: "Abrir menú",
		contact: "Contacto",
		imprint: "Aviso legal",
		privacy: "Privacidad",
		language: "Idioma",
		formMissing:
			"El formulario de contacto aún no está configurado. En el admin, ve a Plugins → Forms y crea un formulario con este ID:",
		pageNotFound: "Página no encontrada",
		backHome: "Volver al inicio",
		translationFallback: "Esta página aún no está traducida al español.",
		galleryAlbums: "Álbumes",
		prevAlbum: "Álbum anterior",
		nextAlbum: "Álbum siguiente",
		backToGallery: "Volver a la galería",
		photoCount: (n: number) => (n === 1 ? "1 foto" : `${n} fotos`),
		lightboxClose: "Cerrar",
		lightboxPrev: "Foto anterior",
		lightboxNext: "Foto siguiente",
		galleryEmpty: "Aún no hay álbumes.",
	},
} satisfies Record<Locale, Record<string, string | ((n: number) => string)>>;

export type UIStrings = (typeof strings)["de"];

export function t(locale: Locale): UIStrings {
	return strings[locale];
}
