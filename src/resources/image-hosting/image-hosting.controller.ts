import { Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImageHostingService } from './image-hosting.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('ImageHosting')
@Controller('image-hosting')
export class ImageHostingController {
  constructor(private readonly imageHostingService: ImageHostingService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  upload(@UploadedFile() image: Express.Multer.File) {
    image.fieldname = +new Date() + '';
    console.log(image);
    return this.imageHostingService.upload(image);
  }

  @Get('profile')
  profile() {
    return this.imageHostingService.getProfile();
  }

  @Get('history')
  history(@Query('page') page = 1) {
    return this.imageHostingService.history(page);
  }

  @Delete(':hash')
  delete(@Param('hash') hash: string) {
    return this.imageHostingService.deleteImage(hash);
  }
}
