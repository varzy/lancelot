import { IsDateString, IsOptional } from 'class-validator';

export class GenerateNewsletterDto {
  @IsOptional()
  @IsDateString()
  start_day?: string;

  @IsOptional()
  @IsDateString()
  end_day?: string;
}
