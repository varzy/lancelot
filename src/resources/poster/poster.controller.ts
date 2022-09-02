import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PosterService } from './poster.service';
import { CreatePosterDto } from './dto/create-poster.dto';
import { UpdatePosterDto } from './dto/update-poster.dto';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @Post()
  create(@Body() createPosterDto: CreatePosterDto) {
    return this.posterService.create(createPosterDto);
  }

  @Get()
  findAll() {
    return this.posterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.posterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePosterDto: UpdatePosterDto) {
    return this.posterService.update(+id, updatePosterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posterService.remove(+id);
  }
}
