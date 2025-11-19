import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageMetadata, ImageMetadataSchema } from './schemas/image-metadata.schema';
import { MetadataService } from './metadata.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: ImageMetadata.name, schema: ImageMetadataSchema
    }])
  ],
  providers: [MetadataService],
  exports: [MetadataService]
})
export class MetadataModule { }
