import { Test, TestingModule } from '@nestjs/testing';
import { PosterController } from './poster.controller';
import { PosterService } from './poster.service';

describe('PosterController', () => {
  let controller: PosterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosterController],
      providers: [PosterService],
    }).compile();

    controller = module.get<PosterController>(PosterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
