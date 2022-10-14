import { Test, TestingModule } from '@nestjs/testing';
import { ImageHostingService } from './image-hosting.service';

describe('ImageHostingService', () => {
  let service: ImageHostingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageHostingService],
    }).compile();

    service = module.get<ImageHostingService>(ImageHostingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
