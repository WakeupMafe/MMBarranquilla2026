export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size < 10 && unitIndex > 0 ? 2 : 1)} ${units[unitIndex]}`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen."));
    img.src = src;
  });
}

function canvasToBlob(canvas, type = "image/jpeg", quality = 0.82) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo generar la imagen comprimida."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputType = "image/jpeg",
  } = options;

  if (!(file instanceof File)) {
    throw new Error("El archivo seleccionado no es válido.");
  }

  const dataUrl = await readFileAsDataURL(file);
  const image = await loadImage(dataUrl);

  let { width, height } = image;

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  const targetWidth = Math.round(width * ratio);
  const targetHeight = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const blob = await canvasToBlob(canvas, outputType, quality);

  const extension = outputType === "image/png" ? "png" : "jpg";
  const safeName = file.name.replace(/\.[^/.]+$/, "");
  const compressedFileName = `${safeName}-comprimida.${extension}`;

  const compressedFile = new File([blob], compressedFileName, {
    type: outputType,
    lastModified: Date.now(),
  });

  const previewUrl = URL.createObjectURL(compressedFile);

  return {
    file: compressedFile,
    previewUrl,
    original: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
    compressed: {
      name: compressedFile.name,
      size: compressedFile.size,
      type: compressedFile.type,
      width: targetWidth,
      height: targetHeight,
    },
  };
}
