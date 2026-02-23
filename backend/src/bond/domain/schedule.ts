export interface CashFlowRow {
  period: number;
  paymentDateISO: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

interface ScheduleParams {
  faceValue: number;
  couponPerPeriod: number;
  periods: number;
  frequencyPerYear: number;
  startDate: Date;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function generateSchedule(params: ScheduleParams): CashFlowRow[] {
  const { faceValue, couponPerPeriod, periods, frequencyPerYear, startDate } = params;
  const monthsPerPeriod = frequencyPerYear === 2 ? 6 : 12;
  const rows: CashFlowRow[] = [];

  for (let t = 1; t <= periods; t++) {
    const paymentDate = addMonths(startDate, t * monthsPerPeriod);
    const isLast = t === periods;

    rows.push({
      period: t,
      paymentDateISO: formatDate(paymentDate),
      couponPayment: round2(couponPerPeriod),
      cumulativeInterest: round2(couponPerPeriod * t),
      remainingPrincipal: isLast ? 0 : round2(faceValue),
    });
  }

  return rows;
}
