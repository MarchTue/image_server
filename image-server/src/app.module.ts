import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageModule } from './image/image.module';
import { MinioModule } from './minio/minio.module';
import { MetadataModule } from './metadata/metadata.module';
import { ProcessorModule } from './processor/processor.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: process.env.NODE_ENV === "development" ? ".env" : ".env.production",
      envFilePath: ".env",
      load: [databaseConfig]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
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
