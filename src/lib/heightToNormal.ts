

/**
 * Converts a grayscale height map canvas into a normal map canvas.
 * @param heightCanvas The source canvas containing the height map (grayscale).
 * @param strength The strength of the normal effect (default: 2.0).
 * @returns A new HTMLCanvasElement containing the normal map.
 */
export const convertHeightCanvasToNormalCanvas = (
    heightCanvas: HTMLCanvasElement,
    strength: number = 2.0
): HTMLCanvasElement => {
    const width = heightCanvas.width;
    const height = heightCanvas.height;

    const ctx = heightCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context from height canvas');

    const srcData = ctx.getImageData(0, 0, width, height);
    const srcPixels = srcData.data;

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = width;
    normalCanvas.height = height;
    const normalCtx = normalCanvas.getContext('2d');
    if (!normalCtx) throw new Error('Could not get 2d context for normal canvas');

    const normalData = normalCtx.createImageData(width, height);
    const dstPixels = normalData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Helper to get height value (only red channel needed for grayscale)
            // Clamping coordinates to edges
            const getHeight = (ox: number, oy: number) => {
                const sx = Math.max(0, Math.min(width - 1, x + ox));
                const sy = Math.max(0, Math.min(height - 1, y + oy));
                const idx = (sy * width + sx) * 4;
                return srcPixels[idx] / 255.0;
            };

            // Sobel operator-like sampling
            const topLeft = getHeight(-1, -1);
            const top = getHeight(0, -1);
            const topRight = getHeight(1, -1);
            const left = getHeight(-1, 0);
            const right = getHeight(1, 0);
            const bottomLeft = getHeight(-1, 1);
            const bottom = getHeight(0, 1);
            const bottomRight = getHeight(1, 1);

            // Compute gradients
            const dX = (topRight + 2 * right + bottomRight) - (topLeft + 2 * left + bottomLeft);
            const dY = (bottomLeft + 2 * bottom + bottomRight) - (topLeft + 2 * top + topRight);

            // Construct normal vector (Z is constant based on strength)
            // Standard normal map: Z is usually positive (facing out)
            const nz = 1.0 / strength;
            const nx = -dX;
            const ny = -dY; // Y direction might need flipping depending on convention

            // Normalize
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            const invLen = 1.0 / len;

            // Map -1..1 to 0..255
            const r = ((nx * invLen) * 0.5 + 0.5) * 255;
            const g = ((ny * invLen) * 0.5 + 0.5) * 255;
            const b = ((nz * invLen) * 0.5 + 0.5) * 255;

            const idx = (y * width + x) * 4;
            dstPixels[idx] = r;
            dstPixels[idx + 1] = g;
            dstPixels[idx + 2] = b;
            dstPixels[idx + 3] = 255; // Alpha
        }
    }

    normalCtx.putImageData(normalData, 0, 0);
    return normalCanvas;
};
