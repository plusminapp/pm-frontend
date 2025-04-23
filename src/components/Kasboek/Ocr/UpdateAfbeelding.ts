export const updateAfbeelding = (file: File, bankNaam: string | undefined): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (event) => {
            img.src = event.target?.result as string;
        };

        reader.onerror = (error) => {
            reject(error);
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const backgroundPixel = Math.round((4.5 * canvas.width) / 4) * 4;

            // Determine background color (top-left pixel)
            const backgroundColor = {
                r: data[backgroundPixel],
                g: data[backgroundPixel + 1],
                b: data[backgroundPixel + 2]
            };

            // Process image data
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Increase contrast
                const contrastLevel = 127; // 0-255
                const contrastFactor = (259 * (contrastLevel + 255)) / (255 * (259 - contrastLevel));
                data[i] = contrastFactor * (r - 128) + 128;
                data[i + 1] = contrastFactor * (g - 128) + 128;
                data[i + 2] = contrastFactor * (b - 128) + 128;

                // Remove green lines
                if (bankNaam === 'ASN' || bankNaam === 'Rabo') {
                    const greenFactor = 1.25; // 0-2
                    if (g > greenFactor * r && g > greenFactor * b) {
                        data[i] = backgroundColor.r; // Set to background color
                        data[i + 1] = backgroundColor.g;
                        data[i + 2] = backgroundColor.b;
                    }
                }
            }
            // Put image data back to canvas
            ctx.putImageData(imageData, 0, 0);
            // Convert canvas to Blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const updatedFile = new File([blob], file.name, { type: file.type });
                    resolve(updatedFile);
                } else {
                    reject(new Error('Canvas to Blob conversion failed'));
                }
            }, file.type);
        };

        img.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
};