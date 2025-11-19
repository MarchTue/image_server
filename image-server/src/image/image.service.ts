import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { ImageMetadata } from 'src/metadata/schemas/image-metadata.schema';
import { MinioService } from 'src/minio/minio.service';
import { ProcessedImageResult, ProcessorService } from 'src/processor/processor.service';
import { Readable } from 'stream';

@Injectable()
export class ImageService {

  private readonly logger = new Logger(ImageService.name);

  constructor(
    private readonly metadataService: MetadataService,
    private readonly minioService: MinioService,
    private readonly processorService: ProcessorService
  ) { }

  async uploadImage(file: Express.Multer.File): Promise<{ hash: string, isDuplicate: boolean, objectKey: string; }> {
    const originalName = file.originalname;

    // 워커 스레드 호출, 이미지 처리
    const { buffer, hash, mimeType, width, height }: ProcessedImageResult =
      await this.processorService.processFile(file.buffer);

    // Metadata 확인 -> 중복 체크
    const existingMeta = await this.metadataService.findByHash(hash);
    const isDuplicate = !!existingMeta; // boolean 형변환 null, undefined 처리용

    // 중복 케이스
    if (isDuplicate) {
      await this.metadataService.incrementReferenceCount(hash);
      this.logger.log(`Duplicate hash found : ${hash}. Ref count incremented`);
      return {
        hash,
        isDuplicate: true,
        objectKey: existingMeta.object_key
      };
    }

    // 신규 파일 확인
    const ext = mimeType.split('/')[1];
    const objectKey = `${hash}.${ext}`;
    await this.minioService.uploadFile(objectKey, buffer, mimeType);
    this.logger.log(`New File uploaded object_key : ${objectKey}`);

    // 신규 파일 저장
    const newMetadata: Partial<ImageMetadata> = await this.metadataService.create({
      hash_sha256: hash,
      is_public: true,
      reference_count: 1,
      object_key: objectKey,
      width, height, mime_type: mimeType,
    });

    return { hash, isDuplicate: false, objectKey: newMetadata.object_key! };
  }


  /**
   * ## 정적 호스팅을 통한 이미지 조회
   * @param {string} hash string : 조회할 이미지의 해시
   * @returns 
   */
  async streamImage(hash: string): Promise<{ stream: Readable, mimeType: string; }> {
    const meta = await this.metadataService.findByHash(hash);

    if (!meta) {
      throw new ConflictException(`Image ${hash} not found`);
    }
    const stream = await this.minioService.getFileStream(meta.object_key);

    return { stream, mimeType: meta.mime_type };
  }

  // todo: delete/decrementReferenceCount
} // ImageService Class ends 
