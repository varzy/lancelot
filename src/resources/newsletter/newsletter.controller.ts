import { Body, Controller, Post } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { ApiTags } from '@nestjs/swagger';
import { GenerateNewsletterDto } from './dto/generate-newsletter.dto';
import { PublishNewsletterDto } from './dto/publish-newsletter.dto';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('generate')
  generate(@Body() generateNewsletterDto: GenerateNewsletterDto) {
    return this.newsletterService.generate(generateNewsletterDto);
  }

  @Post('publish')
  publish(@Body() publishNewsletterDto: PublishNewsletterDto) {
    return this.newsletterService.publish(publishNewsletterDto);
  }
}
