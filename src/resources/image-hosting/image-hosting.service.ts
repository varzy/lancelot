import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import * as FormData from 'form-data';
import { Stream } from 'stream';
import { getRandomStr } from '../../utils/helpers';

@Injectable()
export class ImageHostingService {
  constructor(private readonly httpService: HttpService) {}

  async upload(image: Stream, filename?) {
    const formData = new FormData();
    formData.append('smfile', image, { filename: filename || `${+new Date()}_${getRandomStr()}` });

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
      formattedRes.data = res.data;
      formattedRes.url = res.data.url;
      Logger.log(`ImageHosting: upload: success: ${formattedRes.url}`);
    }

    if (res.code === 'image_repeated') {
      formattedRes.url = res.images;
      Logger.warn(`ImageHosting: upload: image_repeated: ${formattedRes.message}`);
    }

    return formattedRes;
  }

  async uploadExternal(externalUrl: string, filename: string) {
    Logger.log(`ImageHosting: uploadExternal: Ready to Upload: ${externalUrl}`);
    const externalImageRes = await lastValueFrom(
      this.httpService.get(externalUrl, { responseType: 'stream', headers: null }).pipe(map((res) => res.data)),
    );
    return await this.upload(externalImageRes, filename);
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
