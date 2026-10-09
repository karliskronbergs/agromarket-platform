import imageCompression from "browser-image-compression";

const OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  try {
    // browser-image-compression's types claim this always resolves to a
    // File, but at runtime (notably when useWebWorker transfers it across
    // the worker boundary) it can resolve to a plain Blob instead.
    // DataTransferItemList.add() in image-uploader.tsx requires a true
    // File and throws an uncaught TypeError otherwise, which crashes the
    // whole page -- so normalize the result here.
    const result: Blob = await imageCompression(file, OPTIONS);
    if (result instanceof File) return result;
    return new File([result], file.name, { type: result.type || file.type, lastModified: Date.now() });
  } catch {
    return file;
  }
}
