import { Body, Controller, Post } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { ApiTags } from '@nestjs/swagger';
import { GenerateNewsletterDto } from './dto/generate-newsletter.dto';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('generate')
  generate(@Body() generateNewsletterDto: GenerateNewsletterDto) {
    return this.newsletterService.generate(generateNewsletterDto);
  }

  @Post('publish')
  publish() {
    return this.newsletterService.publish();
  }
}
