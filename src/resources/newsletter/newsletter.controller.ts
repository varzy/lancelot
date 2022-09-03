import { Controller } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}
}
