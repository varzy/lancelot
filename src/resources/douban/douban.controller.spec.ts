import { Test, TestingModule } from '@nestjs/testing';
import { DoubanController } from './douban.controller';
import { DoubanService } from './douban.service';

describe('DoubanController', () => {
  let controller: DoubanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoubanController],
      providers: [DoubanService],
    }).compile();

    controller = module.get<DoubanController>(DoubanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
