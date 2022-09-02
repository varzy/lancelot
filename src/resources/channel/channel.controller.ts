import { Body, Controller, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { SendPostDto } from './dto/send-post.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Channel')
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('publish')
  publish(@Body() sendPost: SendPostDto) {
    if (sendPost.id) {
      return this.channelService.publishById(sendPost.id);
    }

    return this.channelService.publishByDay(sendPost.day);
  }
}
