import { EventHandler } from "@create-figma-plugin/utilities";

export interface ResizeWindowHandler extends EventHandler {
	name: "RESIZE_WINDOW";
	handler: (windowSize: { width: number; height: number }) => void;
}

export interface SelectImagesHandler extends EventHandler {
	name: "SELECT_IMAGES";
	handler: (images: string[]) => void;
}

export interface PastedImage {
	data: Uint8Array;
	width: number;
	height: number;
}

export interface PasteHandler extends EventHandler {
	name: "PASTE";
	handler: (images: PastedImage[]) => void;
}
