import { Controller } from '@nestjs/common';
import { DoubanService } from './douban.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Douban')
@Controller('douban')
export class DoubanController {
  constructor(private readonly doubanService: DoubanService) {}
}
