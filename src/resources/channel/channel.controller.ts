import { Body, Controller, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { SendPostDto } from './dto/send-post.dto';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('publish')
  publish(@Body() sendPost: SendPostDto) {
    if (sendPost.pageId) {
      return this.channelService.publishById(sendPost.pageId);
    }

    return this.channelService.publishByDay(sendPost.day);
  }
}
