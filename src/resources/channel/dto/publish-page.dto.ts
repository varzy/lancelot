import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PublishPageDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsDateString()
  day?: string;
}
