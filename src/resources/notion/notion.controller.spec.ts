import { Test, TestingModule } from '@nestjs/testing';
import { NotionController } from './notion.controller';
import { NotionService } from './notion.service';

describe('NotionController', () => {
  let controller: NotionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotionController],
      providers: [NotionService],
    }).compile();

    controller = module.get<NotionController>(NotionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
