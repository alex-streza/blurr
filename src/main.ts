import { on, showUI } from "@create-figma-plugin/utilities";

import { PasteHandler, ResizeWindowHandler } from "./types";

import { emit } from "@create-figma-plugin/utilities";

import { SelectImagesHandler } from "./types";
import { convertToBytes } from "./utils/image";
import { pasteImages } from "./utils/pasteImages";

export default function () {
	on<ResizeWindowHandler>("RESIZE_WINDOW", function (windowSize: { width: number; height: number }) {
		const { width, height } = windowSize;
		figma.ui.resize(width, height);
	});

	on<PasteHandler>("PASTE", function (images) {
		pasteImages({
			images,
		});

		figma.notify("🎉 Generated " + images.length + " variants! 🎉");
	});

	let selection = figma.currentPage.selection[0];
	let loaded = false;

	setInterval(async () => {
		const currentSelection = figma.currentPage.selection[0];
		if (currentSelection && (currentSelection.id !== selection?.id || !loaded)) {
			selection = currentSelection;
			loaded = true;

			if (selection.type === "FRAME") {
				const images: string[] = [];

				const nodes = selection.findAll();

				for (let i = 0; i < nodes.length; i++) {
					const image = await convertToBytes(nodes[i], true);
					if (image) {
						images.push("data:image/png;base64," + figma.base64Encode(image));
					}
				}

				emit<SelectImagesHandler>("SELECT_IMAGES", images);
			} else
				convertToBytes(selection, true).then(async (image) => {
					if (image) {
						emit<SelectImagesHandler>("SELECT_IMAGES", ["data:image/png;base64," + figma.base64Encode(image)]);
					}
				});
		}
	}, 500);

	showUI({
		height: 440,
		width: 320,
	});
}
