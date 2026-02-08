
import * as THREE from 'three';
import { convertHeightCanvasToNormalCanvas } from './heightToNormal';

export type CoinStyle = 'egyptian' | 'silver';

export interface CoinFaceTextures {
    map: THREE.CanvasTexture;
    normalMap: THREE.CanvasTexture;
}

export interface CoinTextures {
    front: CoinFaceTextures;
    back: CoinFaceTextures;
    bodyColor: string;
    roughness: number;
    metalness: number;
}

const CANVAS_SIZE = 1024;

// Helper to create a canvas
const createCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    return canvas;
};

// Helper: Add noise to canvas
const addNoise = (ctx: CanvasRenderingContext2D, amount: number) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const iData = ctx.getImageData(0, 0, w, h);
    const data = iData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * amount;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(iData, 0, 0);
};

// --- EGYPTIAN STYLE ---

const drawEgyptianFrontHeight = (ctx: CanvasRenderingContext2D) => {
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    // Background (Base level)
    ctx.fillStyle = '#606060';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Rim
    ctx.beginPath();
    ctx.arc(cx, cy, 480, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 40;
    ctx.stroke();

    // Inner Recess
    ctx.beginPath();
    ctx.arc(cx, cy, 460, 0, Math.PI * 2);
    ctx.fillStyle = '#404040'; // Recessed
    ctx.fill();

    // Pharaoh Profile (Abstract)
    ctx.fillStyle = '#E0E0E0'; // High relief
    ctx.beginPath();
    // Head shape
    ctx.moveTo(cx - 50, cy - 150);
    ctx.lineTo(cx + 50, cy - 150); // Top of hat
    ctx.lineTo(cx + 60, cy - 100);
    // Face
    ctx.lineTo(cx + 60, cy + 50);
    ctx.lineTo(cx + 40, cy + 80); // Chin
    ctx.lineTo(cx - 40, cy + 80);
    // Neck/Hat back
    ctx.lineTo(cx - 80, cy + 150); // Nemes tail
    ctx.lineTo(cx - 60, cy - 100);
    ctx.closePath();
    ctx.fill();

    // Eye symbol
    ctx.strokeStyle = '#202020'; // Engraved into relief
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 30);
    ctx.quadraticCurveTo(cx + 20, cy - 40, cx + 40, cy - 30);
    ctx.quadraticCurveTo(cx + 20, cy - 20, cx, cy - 30);
    ctx.stroke();

    // Hieroglyphs (Faux)
    ctx.fillStyle = '#A0A0A0';
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r = 380;
        ctx.save();
        ctx.translate(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillRect(-15, -20, 30, 40); // Simple block glyphs
        ctx.restore();
    }
};

const drawEgyptianBackHeight = (ctx: CanvasRenderingContext2D) => {
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    ctx.fillStyle = '#606060'; // smooth base
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Sun Rays
    ctx.strokeStyle = '#909090'; // Slight relief
    ctx.lineWidth = 8;
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 450, cy + Math.sin(angle) * 450);
        ctx.stroke();
    }

    // Scarab (Abstract Oval + Wings)
    ctx.fillStyle = '#D0D0D0'; // High relief

    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy, 60, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy - 20);
    ctx.lineTo(cx - 250, cy - 80); // Wing tip
    ctx.lineTo(cx - 220, cy + 40);
    ctx.lineTo(cx - 60, cy + 40);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 60, cy - 20);
    ctx.lineTo(cx + 250, cy - 80); // Wing tip
    ctx.lineTo(cx + 220, cy + 40);
    ctx.lineTo(cx + 60, cy + 40);
    ctx.fill();

    // Wear and tear
    addNoise(ctx, 30);
};

const drawEgyptianAlbedo = (ctx: CanvasRenderingContext2D) => {
    // Bronze color base
    ctx.fillStyle = '#cd7f32';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Patina (greenish spots)
    ctx.fillStyle = 'rgba(100, 150, 120, 0.4)';
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * CANVAS_SIZE;
        const y = Math.random() * CANVAS_SIZE;
        const r = Math.random() * 5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Darker recesses (fake AO mostly handled by lighting, but helps)
    addNoise(ctx, 40); // Grainy surface
};


// --- SILVER DOLLAR STYLE ---

const drawSilverFrontHeight = (ctx: CanvasRenderingContext2D) => {
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Rim
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 480, 0, Math.PI * 2);
    ctx.stroke();

    // Liberty Profile (Abstract)
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 180); // Neck
    ctx.quadraticCurveTo(cx + 50, cy + 180, cx + 80, cy + 150);
    ctx.lineTo(cx + 90, cy - 50); // Face front
    ctx.lineTo(cx + 60, cy - 100); // Forehead
    ctx.quadraticCurveTo(cx, cy - 150, cx - 80, cy - 100); // Hair top
    ctx.quadraticCurveTo(cx - 120, cy, cx - 100, cy + 100); // Hair back
    ctx.lineTo(cx - 20, cy + 180);
    ctx.fill();

    // Stars
    ctx.fillStyle = '#C0C0C0';
    for (let i = 0; i < 13; i++) {
        // Only bottom half arc
        const angle = Math.PI + (i / 12) * Math.PI; // spread 13 stars
        const r = 350;
        // Draw star logic
        const sx = cx + Math.cos(angle) * r;
        const sy = cy + Math.sin(angle) * r; // Flip Y for visual "bottom" arc? NO, canvas Y is down.

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle - Math.PI / 2);
        ctx.beginPath();
        // Simple star shape
        for (let j = 0; j < 5; j++) {
            ctx.lineTo(Math.cos((18 + j * 72) / 180 * Math.PI) * 20, -Math.sin((18 + j * 72) / 180 * Math.PI) * 20);
            ctx.lineTo(Math.cos((54 + j * 72) / 180 * Math.PI) * 10, -Math.sin((54 + j * 72) / 180 * Math.PI) * 10);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // "LIBERTY" (Abstract rectangles for text)
    ctx.fillStyle = '#D0D0D0';
    const textR = 250;
    for (let i = 0; i < 7; i++) {
        const angle = -Math.PI / 2 + (i - 3) * 0.15;
        ctx.save();
        ctx.translate(cx + Math.cos(angle) * textR, cy + Math.sin(angle) * textR);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillRect(-10, -20, 20, 40);
        ctx.restore();
    }
};

const drawSilverBackHeight = (ctx: CanvasRenderingContext2D) => {
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Rim
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 480, 0, Math.PI * 2);
    ctx.stroke();

    // Eagle (Abstract)
    ctx.fillStyle = '#CCCCCC';

    // Wreath / Laurel
    ctx.strokeStyle = '#A0A0A0';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(cx, cy, 300, 0.2, Math.PI - 0.2); // Bottom arc
    ctx.stroke();

    // Shield
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy - 60);
    ctx.lineTo(cx + 60, cy - 60);
    ctx.lineTo(cx, cy + 80);
    ctx.closePath();
    ctx.fill();

    // Wings spread
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy - 60);
    ctx.quadraticCurveTo(cx - 150, cy - 150, cx - 250, cy - 100);
    ctx.quadraticCurveTo(cx - 150, cy - 30, cx - 60, cy - 40);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 60, cy - 60);
    ctx.quadraticCurveTo(cx + 150, cy - 150, cx + 250, cy - 100);
    ctx.quadraticCurveTo(cx + 150, cy - 30, cx + 60, cy - 40);
    ctx.fill();
};


const drawSilverAlbedo = (ctx: CanvasRenderingContext2D) => {
    // Silver/Steel base
    ctx.fillStyle = '#D0D2D5';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Micro noise for matte finish
    addNoise(ctx, 15);

    // "Brushing" / radial streaks
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#000000';
    for (let i = 0; i < 100; i++) {
        const radius = Math.random() * CANVAS_SIZE;
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
};

// --- MAIN GENERATOR ---

export const generateCoinTextures = (style: CoinStyle): CoinTextures => {
    // Create Canvases
    const frontHeightCanvas = createCanvas();
    const frontAlbedoCanvas = createCanvas();
    const backHeightCanvas = createCanvas();
    const backAlbedoCanvas = createCanvas();

    const fhCtx = frontHeightCanvas.getContext('2d')!;
    const faCtx = frontAlbedoCanvas.getContext('2d')!;
    const bhCtx = backHeightCanvas.getContext('2d')!;
    const baCtx = backAlbedoCanvas.getContext('2d')!;

    let bodyColor = '#ffffff';
    let roughness = 0.5;
    let metalness = 1.0;

    if (style === 'egyptian') {
        drawEgyptianFrontHeight(fhCtx);
        drawEgyptianBackHeight(bhCtx);
        drawEgyptianAlbedo(faCtx);
        drawEgyptianAlbedo(baCtx); // Same material for back
        bodyColor = '#cd7f32';
        roughness = 0.6;
        metalness = 0.8;
    } else {
        drawSilverFrontHeight(fhCtx);
        drawSilverBackHeight(bhCtx);
        drawSilverAlbedo(faCtx);
        drawSilverAlbedo(baCtx);
        bodyColor = '#D0D2D5';
        roughness = 0.7; // Matte
        metalness = 0.9;
    }

    // Convert Height to Normal
    const frontNormalCanvas = convertHeightCanvasToNormalCanvas(frontHeightCanvas, 3.0);
    const backNormalCanvas = convertHeightCanvasToNormalCanvas(backHeightCanvas, 3.0);

    // Create Textures
    const createTx = (canvas: HTMLCanvasElement, isColor: boolean = true) => {
        const tx = new THREE.CanvasTexture(canvas);
        tx.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        tx.minFilter = THREE.LinearMipmapLinearFilter;
        tx.magFilter = THREE.LinearFilter;
        tx.generateMipmaps = true;
        return tx;
    };

    return {
        front: {
            map: createTx(frontAlbedoCanvas, true),
            normalMap: createTx(frontNormalCanvas, false)
        },
        back: {
            map: createTx(backAlbedoCanvas, true),
            normalMap: createTx(backNormalCanvas, false)
        },
        bodyColor,
        roughness,
        metalness
    };
};
