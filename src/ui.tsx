import {
	Bold,
	Button,
	Container,
	FileUploadDropzone,
	Link,
	Muted,
	render,
	Tabs,
	Text,
	useWindowResize,
	VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { Fragment, h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { PasteHandler, ResizeWindowHandler, SelectImagesHandler } from "./types";
import { fileToBase64, urlToThumbHashDataURL, urlToUint8 } from "./utils/image";

interface ThumbHash {
	placeholderURL: string;
	binaryThumbHash: Uint8Array;
	height: number;
	width: number;
}

interface ConvertTabProps {
	setImages: (image: string[]) => void;
	images: string[];
}

const primary = "#fd663e";
const acceptedFileTypes = ["image/png", "image/jpeg"];

const ConvertTab = ({ images, setImages }: ConvertTabProps) => {
	const handleGenerateThumbhash = useCallback(async () => {
		const thumbhashes = [];

		for (const image of images) {
			const thumbhash = await urlToThumbHashDataURL(image);

			if (thumbhash) {
				thumbhashes.push(thumbhash);
			}
		}
		emit<PasteHandler>(
			"PASTE",
			thumbhashes.map((thumbhash) => ({
				data: urlToUint8(thumbhash.placeholderURL),
				height: thumbhash.height,
				width: thumbhash.width,
			}))
		);
	}, [images]);

	const handleSelectedFiles = useCallback(
		async (files: File[]) => {
			let images = [];

			for (const file of files) {
				const base64 = await fileToBase64(file);
				images.push(base64);
			}

			setImages(images);
		},
		[setImages]
	);

	const hasImages = images.length > 0;

	return (
		<Fragment>
			<VerticalSpace space="medium" />
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr",
					gridGap: "20px",
				}}>
				{hasImages &&
					images.map((image, index) => (
						<div
							style={{
								position: "relative",
								width: "100%",
								height: "100%",
								backgroundColor: "rgba(0, 0, 0, 0.1)",
								borderRadius: "4px",
								padding: "12px",
							}}>
							<img
								key={index}
								src={image}
								width="100%"
								height="100%"
								style={{
									borderRadius: "4px",
									position: "relative",
									objectFit: "contain",
									objectPosition: "center center",
									backgroundRepeat: "no-repeat",
								}}
							/>
						</div>
					))}
			</div>
			{!hasImages && (
				<FileUploadDropzone acceptedFileTypes={acceptedFileTypes} onSelectedFiles={handleSelectedFiles} max={1}>
					<Text align="center">
						<Muted>Select frames, images or drop a file here.</Muted>
					</Text>
				</FileUploadDropzone>
			)}
			{hasImages && (
				<div
					style={{
						position: "absolute",
						bottom: "0",
						right: "0",
						padding: "12px",
						backgroundColor: "rgba(0, 0, 0, 0.1)",
						width: "100%",
					}}>
					<Button
						style={{
							backgroundColor: primary,
						}}
						onClick={handleGenerateThumbhash}>
						Convert
					</Button>
				</div>
			)}
		</Fragment>
	);
};

const AboutTab = () => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				paddingTop: "60px",
			}}>
			<img
				src="https://imagedelivery.net/_X5WqasCPTrKkrSW6EvwJg/a57ccf06-3ab5-4964-e452-a6da0e89f800/public"
				alt="BLURR"
				width="64"
				height="64"
			/>
			<VerticalSpace space="medium" />
			<Text
				align="center"
				style={{
					fontSize: 16,
				}}>
				<Bold>BLURR</Bold> by Alex Streza
			</Text>
			<VerticalSpace space="extraLarge" />
			<Text align="center">
				<Muted>
					<Bold>BLURR</Bold> is a Figma plugin that generates blurry covers from images using the{" "}
					<Link
						href="https://evanw.github.io/thumbhash/"
						target="_blank"
						rel="noopener noreferrer"
						style={{
							color: primary,
						}}>
						Thumbhash
					</Link>{" "}
					algorithm.
				</Muted>
			</Text>
			<VerticalSpace space="large" />
			<Text align="center">
				<Muted>
					It's an alternative to the already awesome{" "}
					<Link
						href="https://www.figma.com/community/plugin/1092388972817102169/Blurhash-by-Wolt"
						target="_blank"
						rel="noopener noreferrer"
						style={{
							color: primary,
						}}>
						Blurhash Plugin by WOLT
					</Link>
					, but with support for transparent images and more accurate colors.
				</Muted>
			</Text>
			<VerticalSpace space="extraLarge" />
			<a href="https://twitter.com/alex_streza" target="_blank" rel="noopener noreferrer">
				<Button
					style={{
						backgroundColor: primary,
					}}>
					Contact me
				</Button>
			</a>
		</div>
	);
};

function Plugin() {
	const [value, setValue] = useState("Convert");

	function onWindowResize(windowSize: { width: number; height: number }) {
		emit<ResizeWindowHandler>("RESIZE_WINDOW", windowSize);
	}
	useWindowResize(onWindowResize, {
		maxHeight: 600,
		maxWidth: 400,
		minHeight: 240,
		minWidth: 200,
		resizeBehaviorOnDoubleClick: "minimize",
	});

	const [images, setImages] = useState<string[]>([]);

	useEffect(() => {
		return on<SelectImagesHandler>("SELECT_IMAGES", async (images) => setImages(images));
	}, []);

	return (
		<Container space="medium">
			<Tabs
				value={value}
				onValueChange={setValue}
				options={[
					{
						value: "Convert",
						children: <ConvertTab images={images} setImages={setImages} />,
					},
					{
						value: "About",
						children: <AboutTab />,
					},
				]}
			/>
		</Container>
	);
}

export default render(Plugin);
