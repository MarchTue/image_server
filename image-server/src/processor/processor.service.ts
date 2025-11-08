import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import { Worker } from 'worker_threads';

export interface ProcessedImageResult {
  buffer: Buffer; // 이미지 바이너리
  hash: string;   // 해시 처리 후 값
  width: number;
  height: number;
  mimeType: string;
}

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  /**
   * ## 파일 버퍼를 받아 이미지를 워커에 전송, 반환함
   * @param fileBuffer 파일 버퍼
   * @returns ProcessedImageResult `{buffer, hash, width, height, mimeType}`
   */
  async processFile(fileBuffer: Buffer): Promise<ProcessedImageResult> {
    return new Promise((resolve, reject) => {
      this.logger.log("Delegating image processing to Worker Thread . . . ");

      const workerPath = path.join(__dirname, 'worker.processor.js');

      const worker = new Worker(workerPath, {
        workerData: {
          buffer: fileBuffer,
        },
        transferList: [fileBuffer.buffer as ArrayBuffer],
      });

      // 결과 반환 시
      worker.on("message", (result) => {
        worker.terminate();
        if (result.success) {
          resolve(result as ProcessedImageResult);
        } else {
          this.logger.error(`Worker Image Processing failed: ${result.error}`);
        }
      });

      // 에러 상황 시
      worker.on('error', (error) => {
        worker.terminate();
        this.logger.error(`Worker Error: ${error}`);
        reject(error);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          this.logger.warn(`Worker stopped. Exit code : ${code}`);
        }
      });
    });
  }
}
