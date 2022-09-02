import { Injectable } from '@nestjs/common';
import { CreatePosterDto } from './dto/create-poster.dto';
import { UpdatePosterDto } from './dto/update-poster.dto';

@Injectable()
export class PosterService {
  create(createPosterDto: CreatePosterDto) {
    return 'This action adds a new poster';
  }

  findAll() {
    return `This action returns all poster`;
  }

  findOne(id: number) {
    return `This action returns a #${id} poster`;
  }

  update(id: number, updatePosterDto: UpdatePosterDto) {
    return `This action updates a #${id} poster`;
  }

  remove(id: number) {
    return `This action removes a #${id} poster`;
  }
}
