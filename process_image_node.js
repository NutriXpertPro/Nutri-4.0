
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = "C:\\Nutri 4.0\\imagem\\download.jpg";
const TEMP_PNG = "C:\\Nutri 4.0\\imagem\\download_refined_node.png";
const OUTPUT_SVG = "C:\\Nutri 4.0\\imagem\\download.svg";
const OUTPUT_PUBLIC_SVG = "C:\\Nutri 4.0\\frontend\\public\\logo.svg";
const OUTPUT_SRC_SVG = "C:\\Nutri 4.0\\frontend\\src\\assets\\logo.svg";

async function processImage() {
    console.log(`Reading image: ${INPUT_FILE}`);

    try {
        const image = await Jimp.read(INPUT_FILE); // Correct usage for v0.x or check v1? assuming standard jimp

        console.log("Image dimensions:", image.bitmap.width, image.bitmap.height);

        // Scan pixels
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];
            const alpha = this.bitmap.data[idx + 3];

            // Chroma Key Logic
            // 1. Black Detector: Low RGB values
            // 2. Green Detector: Green is dominant and significantly larger than Red/Blue

            const isBlack = (red < 50 && green < 50 && blue < 50);

            // Green Screen Logic
            // Green component > Red + Blue ? or Green > 1.5 * max(Red, Blue)
            // Or Convert to HSV? Jimp doesn't have native HSV pixel access easily without helper.
            // Simple heuristic: Green is high, Red and Blue are lower.
            const isGreen = (green > 80 && green > red * 1.4 && green > blue * 1.4);

            if (isBlack || isGreen) {
                // Set alpha to 0
                this.bitmap.data[idx + 3] = 0;
            }
        });

        console.log(`Writing PNG: ${TEMP_PNG}`);
        await image.writeAsync(TEMP_PNG);

        // Convert to SVG (Embed)
        console.log("Converting to SVG...");
        const pngBuffer = fs.readFileSync(TEMP_PNG);
        const b64 = pngBuffer.toString('base64');
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        const svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <image width="${width}" height="${height}" xlink:href="data:image/png;base64,${b64}"/>
</svg>`;

        fs.writeFileSync(OUTPUT_SVG, svgContent);
        console.log(`Saved SVG: ${OUTPUT_SVG}`);

        // Copy to Frontend
        fs.copyFileSync(OUTPUT_SVG, OUTPUT_PUBLIC_SVG);
        fs.copyFileSync(OUTPUT_SVG, OUTPUT_SRC_SVG);
        console.log("Copied to frontend assets.");

    } catch (err) {
        console.error("Error processing image:", err);
    }
}

processImage();
