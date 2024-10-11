

// Utility function to create an image
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues
        image.src = url;
    });

// Utility function to convert degrees to radians
function getRadianAngle(degreeValue: number): number {
    return (degreeValue * Math.PI) / 180;
}

// Function to get cropped image
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation: number = 0
): Promise<HTMLCanvasElement> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not get 2d context");

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // Set each dimension to double the largest dimension to allow for a safe area for the
    // image to rotate in without being clipped by the canvas context
    canvas.width = safeArea;
    canvas.height = safeArea;

    // Translate canvas context to a central location on image to allow rotating around the center.
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);

    // Draw rotated image and store data.
    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    // Set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Paste generated rotated image with correct offsets for x, y crop values.
    ctx.putImageData(
        data,
        0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
        0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    // As Base64 string
    // return canvas.toDataURL("image/jpeg");
    return canvas;
}

// Function to generate a download link for the cropped image
export const generateDownload = async (
    imageSrc: string,
    crop: { x: number; y: number; width: number; height: number } | null
): Promise<void> => {
    if (!crop || !imageSrc) {
        return;
    }

    const canvas = await getCroppedImg(imageSrc, crop);

    canvas.toBlob(
        (blob) => {
            if (!blob) return;
            const previewUrl = window.URL.createObjectURL(blob);

            const anchor = document.createElement("a");
            anchor.download = "image.jpg";
            anchor.href = URL.createObjectURL(blob);
            anchor.click();

            window.URL.revokeObjectURL(previewUrl);
        },
        "image/jpg",
        0.66
    );
};


export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const getCroppedImageFile = async (imageSrc:string, crop:PixelCrop) : Promise<File | null>  => {
    if (!crop || !imageSrc) {
        return null;
    }

    const canvas = await getCroppedImg(imageSrc, crop);

    return new Promise<File | null>((resolve) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const file = new File([blob], "NewImage.jpg", {
                        type: "image/jpg",
                        lastModified: Date.now(),
                    });
                    resolve(file);
                } else {
                    resolve(null);
                }
            },
            "image/jpg",
            0.66
        );
    });
};