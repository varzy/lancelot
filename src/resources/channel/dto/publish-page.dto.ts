import { IsDateString } from 'class-validator';

export class PublishPageDto {
  id?: string;

  @IsDateString()
  day?: string;
}
