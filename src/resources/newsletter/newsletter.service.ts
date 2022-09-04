import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotionService } from '../notion/notion.service';
import { GenerateNewsletterDto } from './dto/generate-newsletter.dto';

@Injectable()
export class NewsletterService extends NotionService {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

  generate(generateNewsletterDto: GenerateNewsletterDto) {
    return generateNewsletterDto;
  }

  publish() {
    //
  }
}
