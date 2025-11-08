import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageModule } from './image/image.module';
import { MinioModule } from './minio/minio.module';
import { MetadataModule } from './metadata/metadata.module';
import { ProcessorModule } from './processor/processor.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "development" ? ".env" : ".env.production",
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
      })
    }),
    ImageModule,
    MinioModule,
    MetadataModule,
    ProcessorModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
