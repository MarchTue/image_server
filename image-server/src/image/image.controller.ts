import { Controller, Delete, Get, NotFoundException, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImageService } from './image.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Readable } from 'stream';

@Controller('image')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly metadataService: MetadataService
  ) { }

  /**
   * 
   * @param file 업로드 할 파일
   * @returns hash - 결과 반환 (이미지 해시)
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException("File not provided");
    }
    return this.imageService.uploadImage(file);
  };

  /**
   * ## `/images/:hash` : 이미지 조회 및 서빙 (정적 호스팅)
   * ### GET
   * @param hash 조회할 이미지
   */
  @Get(":hash")
  async getImage(@Param('hash') hash: string, @Res() res: Response) {
    try {
      const { stream, mimeType } = await this.imageService.streamImage(hash);

      res.set({
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000'
        // todo: 추가 캐싱 검증 로직은 추후
      });

      (stream as Readable).pipe(res);

    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Image ${hash} not found`);
      }
      throw error;
    }
  }

  /**
   * ## 이미지 삭제
   * 레퍼런스 카운트를 1 낮춤.
   * 
   * *todo*
   * @todo
   * @param hash string - 삭제할 이미지의 해시 
   */
  @Delete(':hash')
  async deleteImage(@Param('hash') hash: string) {
    // await this.metadataService.decrementReferenceCount(hash)
    // todo
  }

}
