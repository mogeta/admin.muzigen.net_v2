export interface GalleryImage { src: string; thumbnail: string; alt: string; }
export function parseGallery(value: string): { version: 1; images: GalleryImage[] } | null;
export function rehypeGallery(): (tree: import('hast').Root) => void;
export function mountGalleries(root: HTMLElement): () => void;
