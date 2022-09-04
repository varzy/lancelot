import { Body, Controller, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { PublishPageDto } from './dto/publish-page.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Channel')
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('publish')
  publish(@Body() publishPageDto: PublishPageDto) {
    if (publishPageDto.id) {
      return this.channelService.publishById(publishPageDto.id);
    }

    return this.channelService.publishByDay(publishPageDto.day);
  }
}
