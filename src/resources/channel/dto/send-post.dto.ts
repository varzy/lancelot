import { IsOptional, IsString } from 'class-validator';

export class SendPostDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  day?: string;
}
