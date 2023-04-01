import { thumbHashToDataURL } from "thumbhash";
import { rgbaToThumbHash } from "thumbhash";
import imageCompression from "browser-image-compression";

export const convertDataURIToBinary = (dataURI: string) =>
	Uint8Array.from(window.atob(dataURI.replace(/^data[^,]+,/, "")), (v) => v.charCodeAt(0));

export const urltoFile = (url: string, filename: string, mimeType: string) => {
	return fetch(url)
		.then(function (res) {
			return res.arrayBuffer();
		})
		.then(function (buf) {
			return new File([buf], filename, { type: mimeType });
		});
};

export const urlToBlob = async (url: string) => {
	const data = await fetch(url);
	const blob = await data.blob();

	return blob;
};

export const fileToBase64 = async (file: File) => {
	return new Promise<string>((resolve) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onloadend = () => {
			const base64data = reader.result as string;
			resolve(base64data);
		};
	});
};

export const urlToBase64 = async (url: string) => {
	const data = await fetch(url);
	const blob = await data.blob();

	return new Promise<string>((resolve) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = () => {
			const base64data = reader.result as string;
			resolve(base64data);
		};
	});
};

export const getImagePaint = (node: any, size?: number, ignoreSize?: boolean) => {
	const paint = (node.fills as ImagePaint[])[0];
	if (
		(!size || (size == node.width && size == node.height)) &&
		(node.width === node.height || ignoreSize) &&
		paint.type === "IMAGE" &&
		paint.scaleMode === "FILL" &&
		paint.imageHash
	) {
		return paint;
	}
};

export const urlToUint8 = (url: string) => {
	let binary = atob(url.split(",")[1]),
		array = [];

	for (let i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));

	return new Uint8Array(array);
};

export const convertToBytes = async (node: SceneNode, ignoreSize?: boolean) => {
	// Look for fills on node types that have fills.
	// An alternative would be to do `if ('fills' in node) { ... }
	switch (node.type) {
		case "RECTANGLE":
		case "ELLIPSE":
		case "POLYGON":
		case "STAR":
		case "VECTOR":
		case "TEXT": {
			const paint = getImagePaint(node, undefined, ignoreSize);
			if (paint && paint.imageHash) {
				const image = figma.getImageByHash(paint.imageHash);

				if (image) {
					const bytes = await image.getBytesAsync();

					return bytes;
				}
			}
			break;
		}

		default: {
			// not supported, silently do nothing
		}
	}
};

export const uint8ToFile = (uint8: Uint8Array, filename: string, mimeType: string) => {
	return new File([uint8], filename, { type: mimeType });
};

export const getImageDimensions = (
	file: string
): Promise<{
	width: number;
	height: number;
}> => {
	return new Promise(function (resolved, rejected) {
		var i = new Image();
		i.onload = function () {
			resolved({ width: i.width, height: i.height });
		};
		i.src = file;
	});
};

export const urlToThumbHashDataURL = async (url: string) => {
	const image = new Image();
	image.src = url;

	await new Promise((resolve) => (image.onload = resolve));

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	const scale = 100 / Math.max(image.width, image.height);

	if (!context) return;

	canvas.width = Math.round(image.width * scale);
	canvas.height = Math.round(image.height * scale);
	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
	const binaryThumbHash = rgbaToThumbHash(pixels.width, pixels.height, pixels.data);

	const placeholderURL = thumbHashToDataURL(binaryThumbHash);

	return {
		placeholderURL,
		binaryThumbHash,
		width: image.width,
		height: image.height,
	};
};

export const compressToFitSizes = async (image: Uint8Array, maxWidthOrHeight = 100) => {
	let resizedImage = {
		data: image,
		width: 0,
		height: 0,
	};

	const options = {
		maxWidthOrHeight,
		useWebWorker: true,
	};

	try {
		const compressedFile = await imageCompression(uint8ToFile(image, "image.png", "image/png"), options);
		const base64Compressed = await fileToBase64(compressedFile);
		const dimensions = await getImageDimensions(base64Compressed);

		resizedImage.data = urlToUint8(base64Compressed);
		resizedImage.width = dimensions.width;
		resizedImage.height = dimensions.height;
	} catch (error) {
		console.log("Error:", error);
	}

	return resizedImage;
};
