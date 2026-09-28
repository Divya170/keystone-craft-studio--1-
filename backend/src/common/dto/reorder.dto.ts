import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

/** Body for the admin "move up / move down" reorder endpoints: the full id
 * list in its new order. */
export class ReorderDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
