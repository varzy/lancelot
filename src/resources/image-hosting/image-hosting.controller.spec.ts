import { Test, TestingModule } from '@nestjs/testing';
import { ImageHostingController } from './image-hosting.controller';
import { ImageHostingService } from './image-hosting.service';

describe('ImageHostingController', () => {
  let controller: ImageHostingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageHostingController],
      providers: [ImageHostingService],
    }).compile();

    controller = module.get<ImageHostingController>(ImageHostingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
