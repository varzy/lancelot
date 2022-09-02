import { PartialType } from '@nestjs/swagger';
import { CreatePosterDto } from './create-poster.dto';

export class UpdatePosterDto extends PartialType(CreatePosterDto) {}
