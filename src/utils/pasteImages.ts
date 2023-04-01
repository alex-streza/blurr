import { PastedImage } from "./../types";
export const pasteImages = ({ images }: { images: PastedImage[] }) => {
	const nodes: SceneNode[] = [];

	const GAP = 100;
	let x = figma.viewport.center.x;
	const y = figma.viewport.center.y;

	images.forEach((img) => {
		const node = figma.createRectangle();
		const image = figma.createImage(img.data);

		node.resize(img.width, img.height);
		node.fills = [
			{
				imageHash: image.hash,
				scaleMode: "FILL",
				scalingFactor: 0.5,
				type: "IMAGE",
			},
		];
		node.x = x;
		node.y = y;

		nodes.push(node);

		figma.currentPage.appendChild(node);

		x += img.width + GAP;
	});

	figma.currentPage.selection = nodes;
	figma.viewport.scrollAndZoomIntoView(nodes);
};
