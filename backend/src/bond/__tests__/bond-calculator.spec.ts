import { calculateBondMetrics } from '../domain/bond-calculator';
import { solveYtm } from '../domain/ytm-solver';
import { generateSchedule } from '../domain/schedule';

describe('Bond Calculator', () => {
  describe('calculateBondMetrics', () => {
    const baseRequest = {
      faceValue: 1000,
      annualCouponRatePct: 5,
      marketPrice: 1000,
      yearsToMaturity: 5,
      couponFrequency: 'annual' as const,
    };

    it('should compute current yield correctly', () => {
      const result = calculateBondMetrics(baseRequest);
      expect(result.outputs.currentYield).toBeCloseTo(0.05, 4);
    });

    it('should compute total interest', () => {
      const result = calculateBondMetrics(baseRequest);
      expect(result.outputs.totalInterest).toBe(250);
    });

    it('should classify par bond', () => {
      const result = calculateBondMetrics(baseRequest);
      expect(result.outputs.priceStatus).toBe('par');
    });

    it('should classify premium bond', () => {
      const result = calculateBondMetrics({
        ...baseRequest,
        marketPrice: 1050,
      });
      expect(result.outputs.priceStatus).toBe('premium');
    });

    it('should classify discount bond', () => {
      const result = calculateBondMetrics({
        ...baseRequest,
        marketPrice: 950,
      });
      expect(result.outputs.priceStatus).toBe('discount');
    });

    it('should return correct number of periods for annual', () => {
      const result = calculateBondMetrics(baseRequest);
      expect(result.inputs.periods).toBe(5);
      expect(result.inputs.couponFrequencyPerYear).toBe(1);
    });

    it('should return correct number of periods for semi-annual', () => {
      const result = calculateBondMetrics({
        ...baseRequest,
        couponFrequency: 'semi-annual',
      });
      expect(result.inputs.periods).toBe(10);
      expect(result.inputs.couponFrequencyPerYear).toBe(2);
    });

    it('should handle fractional years with ceil', () => {
      const result = calculateBondMetrics({
        ...baseRequest,
        yearsToMaturity: 2.5,
        couponFrequency: 'annual',
      });
      expect(result.inputs.periods).toBe(3);
    });

    it('should classify par with relative epsilon for large face value', () => {
      const result = calculateBondMetrics({
        ...baseRequest,
        faceValue: 100000,
        marketPrice: 100005,
        annualCouponRatePct: 5,
      });
      expect(result.outputs.priceStatus).toBe('par');
    });

    it('should detect premium even for tiny difference on small face value', () => {
      const result = calculateBondMetrics({
        ...baseRequest,
        faceValue: 1,
        marketPrice: 1.05,
        annualCouponRatePct: 5,
      });
      expect(result.outputs.priceStatus).toBe('premium');
    });
  });

  describe('YTM Solver', () => {
    it('par bond: YTM ≈ coupon rate', () => {
      const ytm = solveYtm({
        faceValue: 1000,
        couponPerPeriod: 50,
        marketPrice: 1000,
        periods: 5,
        frequencyPerYear: 1,
      });
      expect(ytm).toBeCloseTo(0.05, 3);
    });

    it('zero-coupon bond: closed-form check', () => {
      const F = 1000;
      const n = 10;
      const r = 0.06;
      const P = F / Math.pow(1 + r, n);

      const ytm = solveYtm({
        faceValue: F,
        couponPerPeriod: 0,
        marketPrice: P,
        periods: n,
        frequencyPerYear: 1,
      });
      expect(ytm).toBeCloseTo(r, 4);
    });

    it('premium bond: YTM < coupon rate', () => {
      const ytm = solveYtm({
        faceValue: 1000,
        couponPerPeriod: 50,
        marketPrice: 1100,
        periods: 10,
        frequencyPerYear: 1,
      });
      expect(ytm).toBeLessThan(0.05);
      expect(ytm).toBeGreaterThan(0);
    });

    it('discount bond: YTM > coupon rate', () => {
      const ytm = solveYtm({
        faceValue: 1000,
        couponPerPeriod: 50,
        marketPrice: 900,
        periods: 10,
        frequencyPerYear: 1,
      });
      expect(ytm).toBeGreaterThan(0.05);
    });

    it('semi-annual frequency returns nominal annual rate', () => {
      const ytm = solveYtm({
        faceValue: 1000,
        couponPerPeriod: 25,
        marketPrice: 1000,
        periods: 10,
        frequencyPerYear: 2,
      });
      expect(ytm).toBeCloseTo(0.05, 3);
    });

    it('known discount bond YTM matches to high precision', () => {
      // 8% coupon, $900 price, 10-year annual → YTM ≈ 9.6035%
      const ytm = solveYtm({
        faceValue: 1000,
        couponPerPeriod: 80,
        marketPrice: 900,
        periods: 10,
        frequencyPerYear: 1,
      });
      expect(ytm).toBeCloseTo(0.096035, 4);
    });

    it('known premium bond YTM matches to high precision', () => {
      // 8% coupon, $1100 price, 10-year annual → YTM ≈ 6.6022%
      const ytm = solveYtm({
        faceValue: 1000,
        couponPerPeriod: 80,
        marketPrice: 1100,
        periods: 10,
        frequencyPerYear: 1,
      });
      expect(ytm).toBeCloseTo(0.066022, 4);
    });

    it('derivative correctness: PV at solved YTM equals market price', () => {
      const F = 1000;
      const C = 40;
      const P = 950;
      const n = 20;
      const m = 2;

      const ytm = solveYtm({
        faceValue: F,
        couponPerPeriod: C,
        marketPrice: P,
        periods: n,
        frequencyPerYear: m,
      });

      const r = ytm / m;
      const factor = Math.pow(1 + r, -n);
      const pv = C * (1 - factor) / r + F * factor;
      expect(pv).toBeCloseTo(P, 6);
    });

    it('high-yield discount bond converges', () => {
      const ytm = solveYtm({
        faceValue: 1000,
        couponPerPeriod: 10,
        marketPrice: 500,
        periods: 5,
        frequencyPerYear: 1,
      });
      expect(ytm).toBeGreaterThan(0.15);
      expect(ytm).toBeLessThan(1.0);
    });
  });

  describe('Schedule Generation', () => {
    const startDate = new Date(2026, 0, 1); // Jan 1 2026

    it('should generate correct number of rows', () => {
      const rows = generateSchedule({
        faceValue: 1000,
        couponPerPeriod: 50,
        periods: 5,
        frequencyPerYear: 1,
        startDate,
      });
      expect(rows).toHaveLength(5);
    });

    it('cumulative interest increments correctly', () => {
      const rows = generateSchedule({
        faceValue: 1000,
        couponPerPeriod: 50,
        periods: 5,
        frequencyPerYear: 1,
        startDate,
      });
      rows.forEach((row, i) => {
        expect(row.cumulativeInterest).toBeCloseTo(50 * (i + 1), 2);
      });
    });

    it('remaining principal is 0 at maturity', () => {
      const rows = generateSchedule({
        faceValue: 1000,
        couponPerPeriod: 50,
        periods: 5,
        frequencyPerYear: 1,
        startDate,
      });
      expect(rows[rows.length - 1].remainingPrincipal).toBe(0);
    });

    it('remaining principal is face value before maturity', () => {
      const rows = generateSchedule({
        faceValue: 1000,
        couponPerPeriod: 50,
        periods: 5,
        frequencyPerYear: 1,
        startDate,
      });
      for (let i = 0; i < rows.length - 1; i++) {
        expect(rows[i].remainingPrincipal).toBe(1000);
      }
    });

    it('semi-annual periods have 6-month spacing', () => {
      const rows = generateSchedule({
        faceValue: 1000,
        couponPerPeriod: 25,
        periods: 4,
        frequencyPerYear: 2,
        startDate,
      });
      expect(rows[0].paymentDateISO).toBe('2026-07-01');
      expect(rows[1].paymentDateISO).toBe('2027-01-01');
      expect(rows[2].paymentDateISO).toBe('2027-07-01');
      expect(rows[3].paymentDateISO).toBe('2028-01-01');
    });
  });
});
