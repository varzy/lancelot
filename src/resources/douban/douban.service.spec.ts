import { Test, TestingModule } from '@nestjs/testing';
import { DoubanService } from './douban.service';

describe('DoubanService', () => {
  let service: DoubanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoubanService],
    }).compile();

    service = module.get<DoubanService>(DoubanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
