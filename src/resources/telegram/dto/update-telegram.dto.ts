import { PartialType } from '@nestjs/mapped-types';
import { CreateTelegramDto } from './create-telegram.dto';

export class UpdateTelegramDto extends PartialType(CreateTelegramDto) {}
