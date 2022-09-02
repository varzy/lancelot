import { IsOptional, IsString } from 'class-validator';

export class SendPostDto {
  @IsOptional()
  @IsString()
  pageId?: string;

  @IsOptional()
  @IsString()
  day?: string;
}
