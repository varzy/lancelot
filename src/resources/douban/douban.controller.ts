import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DoubanService } from './douban.service';
import { CreateDoubanDto } from './dto/create-douban.dto';
import { UpdateDoubanDto } from './dto/update-douban.dto';

@Controller('douban')
export class DoubanController {
  constructor(private readonly doubanService: DoubanService) {}

  @Post()
  create(@Body() createDoubanDto: CreateDoubanDto) {
    return this.doubanService.create(createDoubanDto);
  }

  @Get()
  findAll() {
    return this.doubanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doubanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoubanDto: UpdateDoubanDto) {
    return this.doubanService.update(+id, updateDoubanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doubanService.remove(+id);
  }
}
