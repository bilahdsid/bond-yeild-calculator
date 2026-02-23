export type CouponFrequency = 'annual' | 'semi-annual';

export interface BondCalculateRequest {
  faceValue: number;
  annualCouponRatePct: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
}

export interface CashFlowRow {
  period: number;
  paymentDateISO: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export interface BondCalculateResponse {
  inputs: BondCalculateRequest & {
    couponFrequencyPerYear: 1 | 2;
    periods: number;
  };
  outputs: {
    currentYield: number;
    ytm: number;
    totalInterest: number;
    priceStatus: 'premium' | 'discount' | 'par';
  };
  schedule: CashFlowRow[];
}
