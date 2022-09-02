import { Injectable } from '@nestjs/common';
import { CreateDoubanDto } from './dto/create-douban.dto';
import { UpdateDoubanDto } from './dto/update-douban.dto';

@Injectable()
export class DoubanService {
  create(createDoubanDto: CreateDoubanDto) {
    return 'This action adds a new douban';
  }

  findAll() {
    return `This action returns all douban`;
  }

  findOne(id: number) {
    return `This action returns a #${id} douban`;
  }

  update(id: number, updateDoubanDto: UpdateDoubanDto) {
    return `This action updates a #${id} douban`;
  }

  remove(id: number) {
    return `This action removes a #${id} douban`;
  }
}
