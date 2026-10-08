import { IsNotEmpty, IsNumber } from 'class-validator';

export class PostPayrollJournalDto {
  @IsNumber() @IsNotEmpty() month: number;
  @IsNumber() @IsNotEmpty() year: number;
}
