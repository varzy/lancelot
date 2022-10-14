import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GenerateNewsletterDto } from './dto/generate-newsletter.dto';
import { PublishNewsletterDto } from './dto/publish-newsletter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generate(@Body() generateNewsletterDto: GenerateNewsletterDto) {
    return this.newsletterService.generate(generateNewsletterDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('publish')
  publish(@Body() publishNewsletterDto: PublishNewsletterDto) {
    return this.newsletterService.publish(publishNewsletterDto);
  }
}
