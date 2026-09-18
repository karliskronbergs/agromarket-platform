import imageCompression from "browser-image-compression";

const OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  try {
    return await imageCompression(file, OPTIONS);
  } catch {
    return file;
  }
}
