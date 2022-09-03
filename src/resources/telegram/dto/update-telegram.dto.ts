import { PartialType } from '@nestjs/swagger';
import { CreateTelegramDto } from './create-telegram.dto';

export class UpdateTelegramDto extends PartialType(CreateTelegramDto) {}
