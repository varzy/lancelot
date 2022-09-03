import { Controller } from '@nestjs/common';
import { PosterService } from './poster.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Poster')
@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}
}
