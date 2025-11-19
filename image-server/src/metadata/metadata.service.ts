import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ImageMetadata, ImageMetadataDocument } from './schemas/image-metadata.schema';
import { Model } from 'mongoose';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(
    @InjectModel(ImageMetadata.name)
    private ImageMetadataModel: Model<ImageMetadataDocument>
  ) { }

  /**
  * @param {string} hash  생성을 위한 해시
  * @returns {Promise<ImageMetadataDocument | null}
  */
  async findByHash(hash: string): Promise<ImageMetadataDocument | null> {
    return this.ImageMetadataModel.findOne({ hash_sha256: hash }).exec();
  }


  /** 
   * 새로운 메타데이터 생성 
   * @returns {Promise<ImageMetadataDocument>}
  */
  async create(metadata: Partial<ImageMetadata>): Promise<ImageMetadataDocument> {
    const createdMetadata = new this.ImageMetadataModel(metadata);
    return createdMetadata.save();
  }

  /**
   * 
   * @param {string} hash RefCount 증가를 위한 이미지의 hash
   */
  async incrementReferenceCount(hash: string): Promise<void> {
    await this.ImageMetadataModel.updateOne(
      { hash_sha256: hash },
      { $inc: { reference_count: 1 } }
    ).exec();
  }

}
