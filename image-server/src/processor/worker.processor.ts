import { createHash } from "crypto";
import sharp from "sharp";
import { parentPort, workerData } from "worker_threads";

interface WorkerData {
  buffer: Buffer;
  targetMimeType: string;
}

async function processImage(data: WorkerData) {
  try {
    const { buffer, targetMimeType } = data;

    const hash = createHash('sha256').update(buffer).digest('hex');

    const metadata = await sharp(buffer).metadata();
    const processedBuffer = await sharp(buffer)
      .resize(800, 600, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();

    parentPort?.postMessage({
      success: true,
      hash,
      buffer: processedBuffer,
      width: metadata.width,
      height: metadata.height,
      mimeType: targetMimeType
    }, [processedBuffer.buffer as ArrayBuffer]);

  } catch (error) {
    parentPort?.postMessage({ success: false, error: error.message });
  }
}

if (parentPort) {
  processImage(workerData as WorkerData);
}