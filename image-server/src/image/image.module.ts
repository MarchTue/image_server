import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ProcessorModule } from 'src/processor/processor.module';
import { MetadataModule } from 'src/metadata/metadata.module';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [ProcessorModule, MetadataModule, MinioModule],
  providers: [ImageService],
  controllers: [ImageController],
})
export class ImageModule { }
