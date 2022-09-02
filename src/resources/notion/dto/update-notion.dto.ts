import { PartialType } from '@nestjs/swagger';
import { CreateNotionDto } from './create-notion.dto';

export class UpdateNotionDto extends PartialType(CreateNotionDto) {}
