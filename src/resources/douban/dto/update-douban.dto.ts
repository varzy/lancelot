import { PartialType } from '@nestjs/swagger';
import { CreateDoubanDto } from './create-douban.dto';

export class UpdateDoubanDto extends PartialType(CreateDoubanDto) {}
