/**
 * Props contract between the server (Astro loaders/views) and the
 * AlbumCarousel React island. Only plain, serialisable data crosses here:
 * image URLs are resolved on the server.
 */
export interface CarouselImage {
	src: string;
	alt: string;
}

export interface CarouselAlbum {
	/** Locale-aware URL of the album page, e.g. "/en/gallery/teotihuacan". */
	href: string;
	/** Album name: the only text shown on the card. */
	title: string;
	cover: CarouselImage;
	/** Up to three photos the card cross-fades through on hover. */
	previews: CarouselImage[];
}

export interface CarouselLabels {
	/** Accessible name of the carousel region, e.g. "Alben". */
	region: string;
	prev: string;
	next: string;
}

export interface AlbumCarouselProps {
	albums: CarouselAlbum[];
	labels: CarouselLabels;
}
