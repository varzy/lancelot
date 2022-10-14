import { PartialType } from '@nestjs/swagger';
import { CreateImageHostingDto } from './create-image-hosting.dto';

export class UpdateImageHostingDto extends PartialType(CreateImageHostingDto) {}
