import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { PublishPageDto } from './dto/publish-page.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Channel')
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('publish')
  publish(@Body() publishPageDto: PublishPageDto) {
    if (publishPageDto.id) {
      return this.channelService.publishById(publishPageDto.id);
    }

    return this.channelService.publishByDay(publishPageDto.day || new Date());
  }
}
