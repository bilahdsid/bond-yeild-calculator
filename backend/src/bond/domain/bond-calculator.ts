import { solveYtm } from './ytm-solver.js';
import { generateSchedule, type CashFlowRow } from './schedule.js';

export type CouponFrequency = 'annual' | 'semi-annual';

export interface BondCalculateRequest {
  faceValue: number;
  annualCouponRatePct: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
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

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function determinePriceStatus(
  marketPrice: number,
  faceValue: number,
): 'premium' | 'discount' | 'par' {
  const epsilon = Math.max(0.001, faceValue * 1e-4);
  if (Math.abs(marketPrice - faceValue) < epsilon) return 'par';
  return marketPrice > faceValue ? 'premium' : 'discount';
}

export function calculateBondMetrics(request: BondCalculateRequest): BondCalculateResponse {
  const { faceValue, annualCouponRatePct, marketPrice, yearsToMaturity, couponFrequency } = request;

  const couponRate = annualCouponRatePct / 100;
  const m: 1 | 2 = couponFrequency === 'semi-annual' ? 2 : 1;
  const n = Math.ceil(yearsToMaturity * m);
  const annualCoupon = faceValue * couponRate;
  const couponPerPeriod = annualCoupon / m;

  const currentYield = marketPrice > 0 ? annualCoupon / marketPrice : 0;

  const ytm = solveYtm({
    faceValue,
    couponPerPeriod,
    marketPrice,
    periods: n,
    frequencyPerYear: m,
  });

  const totalInterest = round2(couponPerPeriod * n);
  const priceStatus = determinePriceStatus(marketPrice, faceValue);

  const schedule = generateSchedule({
    faceValue,
    couponPerPeriod,
    periods: n,
    frequencyPerYear: m,
    startDate: new Date(),
  });

  return {
    inputs: {
      ...request,
      couponFrequencyPerYear: m,
      periods: n,
    },
    outputs: {
      currentYield,
      ytm,
      totalInterest,
      priceStatus,
    },
    schedule,
  };
}
