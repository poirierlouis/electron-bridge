/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 */
import './index.css';

console.log('👋 Testing compatibility of `electron-bridge` with `electron-forge`.');

// View
const $label: HTMLParagraphElement = document.querySelector(".format");
const $input: HTMLInputElement = document.querySelector("input");
const $btnPaste: HTMLButtonElement = document.querySelector("button#paste");
const $btnCopy: HTMLButtonElement = document.querySelector("button#copy");
const $btnClear: HTMLButtonElement = document.querySelector("button#clear");

const $seed: HTMLInputElement = document.querySelector("input#seed");
const $btnGenerate: HTMLUListElement = document.querySelector("button#generate");
const $canvas: HTMLCanvasElement = document.querySelector("canvas");

// Canvas and height-map size
let engine: CanvasRenderingContext2D;
let seed: number = 1337;
let width: number = 512;
let height: number = 256;

window.onload = async () => {
    $btnPaste.addEventListener("click", pasteFromClipboard);
    $btnCopy.addEventListener("click", copyIntoClipboard);
    $btnClear.addEventListener("click", clearClipboard);

    $btnGenerate.addEventListener("click", generateHeightMap);

    engine = $canvas.getContext("2d");

    // Paste content from current clipboard.
    await pasteFromClipboard();
}

async function copyIntoClipboard() {
    const value: string = $input.value;

    await window.clipboard.write(value);
    console.log(`[clipboard] write: ${value}`);
}

async function pasteFromClipboard() {
    const value: string = await window.clipboard.read();

    $label.innerText = value;
    console.log(`[clipboard] read: ${value}`);
}

async function clearClipboard() {
    await window.clipboard.clear();
    $label.innerText = "";
    console.log(`[clipboard] clear`);
}

async function generateHeightMap() {
    seed = Number($seed.value);

    console.log(`[fastnoisejs] generate(width: ${width}, height: ${height}, seed: ${seed})`);
    const terrain: any = await window.fastNoise.generateHeightMap(width, height, seed, true);
    const image: ImageData = engine.createImageData(width, height);

    for (let i = 0, x = 0, y = 0; i < image.data.length; i += 4) {
        const height: number = terrain[y][x];

        image.data[i + 0] = Math.round(0xFF * height); // red
        image.data[i + 1] = Math.round(0xFF * height); // green
        image.data[i + 2] = Math.round(0xFF * height); // blue
        image.data[i + 3] = 0xFF; // alpha
        x++;
        if (x == width) {
            x = 0;
            y++;
        }
    }
    engine.putImageData(image, 0, 0);
}
