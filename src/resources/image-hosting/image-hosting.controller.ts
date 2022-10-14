import { Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImageHostingService } from './image-hosting.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ImageHosting')
@Controller('image-hosting')
export class ImageHostingController {
  constructor(private readonly imageHostingService: ImageHostingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  upload(@UploadedFile() image: Express.Multer.File) {
    return this.imageHostingService.upload(Readable.from(image.buffer), image.originalname);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile() {
    return this.imageHostingService.getProfile();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(@Query('page') page = 1) {
    return this.imageHostingService.history(page);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':hash')
  delete(@Param('hash') hash: string) {
    return this.imageHostingService.deleteImage(hash);
  }
}
