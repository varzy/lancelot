import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import * as FormData from 'form-data';
import { Readable } from 'stream';

@Injectable()
export class ImageHostingService {
  constructor(private readonly httpService: HttpService) {}

  async upload(image: Express.Multer.File, filename?: string) {
    const formData = new FormData();
    formData.append('smfile', Readable.from(image.buffer), { filename: filename || image.originalname });

    const res: any = await lastValueFrom(
      this.httpService
        .post(`/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, ...formData.getHeaders() })
        .pipe(map((res) => res.data)),
    );

    const { success, code, message, RequestId } = res;
    const formattedRes: {
      success: boolean;
      code: string;
      message: string;
      RequestId: string;
      url?: string;
      data?: any;
    } = {
      success,
      code,
      message,
      RequestId,
    };

    if (res.success) {
      Logger.log(`ImageHosting: upload: success: ${res.url}`);
      formattedRes.data = res.data;
      formattedRes.url = res.data.url;
    }

    if (res.code === 'image_repeated') {
      Logger.warn(`ImageHosting: upload: image_repeated: ${res.message}`);
      formattedRes.url = res.images;
    }

    return formattedRes;
  }

  getProfile() {
    return this.httpService.post(`/profile`).pipe(map((res) => res.data));
  }

  history(page) {
    return this.httpService.get(`/upload_history`, { params: { page } }).pipe(map((res) => res.data));
  }

  deleteImage(hash: string) {
    return this.httpService.get(`/delete/${hash}`).pipe(map((res) => res.data));
  }
}
