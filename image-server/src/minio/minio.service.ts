import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from "minio";
import { Readable } from 'stream';


@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient!: Minio.Client;
  private bucketName!: string;
  private readonly logger = new Logger(MinioService.name);

  // .env 파일 및 docker-compose.yml 파일(예시 파일입니다 참조) 
  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = parseInt(this.configService.get<string>('MINIO_PORT') || '0');
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME')!;

    if (!endpoint || !port || isNaN(port)) {
      this.logger.error(`[MINIO ERROR] Invalid endpoint or port`, { endpoint, port });
      throw new Error(`[MINIO ERROR] Invalid endpoint or port`);
    }

    this.minioClient = new Minio.Client({
      endPoint: endpoint,
      port,
      accessKey,
      secretKey,
      useSSL: false,
    });

    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName);
      this.logger.log(`MinIO bucket : "${this.bucketName}" created`);
    }
  }

  /**
   * ## Upload File - MinIO
   * @param objectName MinIO에 저장될 파일의 이름 (hash)
   * @param buffer 파일 버퍼
   * @param mimeType MIME 타입
   * @returns objectName - 저장된 파일의 이름 (hash)
   */
  async uploadFile(objectName: string, buffer: Buffer, mimeType: string): Promise<string> {
    try {
      const metadata = { 'Content-Type': mimeType };

      await this.minioClient.putObject(this.bucketName, objectName, buffer, buffer.length, metadata);
      return objectName;

    } catch (error) {
      this.logger.error(`Error uploading file to MinIO ${error.message}`);
      throw new Error("MinIO upload failed");
    }
  }
  /**
   * ## Get Image file from MinIO
   * @param {string} objectName string : 조회할 파일의 이름
   * @returns 파일 스트림(Readable Stream)
   */
  getFileStream(objectName: string): Promise<Readable> {
    try {
      return this.minioClient.getObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error(`Error get file from MinIo ${error.message}`);
      throw new Error("Getting MinIo file failed");
    }
  }

  // GC는 추후 구현 예정
}
