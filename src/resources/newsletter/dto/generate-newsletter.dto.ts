import { IsDateString } from 'class-validator';

export class GenerateNewsletterDto {
  @IsDateString()
  start_day?: string;

  @IsDateString()
  end_day?: string;
}
