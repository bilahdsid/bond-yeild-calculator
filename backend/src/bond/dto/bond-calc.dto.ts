import {
  IsNumber,
  IsPositive,
  Min,
  IsIn,
} from 'class-validator';

export class BondCalcDto {
  @IsNumber()
  @IsPositive()
  faceValue: number;

  @IsNumber()
  @Min(0)
  annualCouponRatePct: number;

  @IsNumber()
  @IsPositive()
  marketPrice: number;

  @IsNumber()
  @IsPositive()
  yearsToMaturity: number;

  @IsIn(['annual', 'semi-annual'])
  couponFrequency: 'annual' | 'semi-annual';
}
