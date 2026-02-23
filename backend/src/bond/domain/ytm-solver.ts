/**
 * Numerical YTM solver using Newton-Raphson with bisection fallback.
 *
 * Solves for per-period yield r such that:
 *   P = Σ(t=1..n) C/(1+r)^t  +  F/(1+r)^n
 * Returns nominal annual YTM = r * m
 */

interface YtmSolverParams {
  faceValue: number;
  couponPerPeriod: number;
  marketPrice: number;
  periods: number;
  frequencyPerYear: number;
}

function bondPV(r: number, C: number, F: number, n: number): number {
  if (Math.abs(r) < 1e-12) {
    return C * n + F;
  }
  const factor = Math.pow(1 + r, -n);
  const annuityPV = (C * (1 - factor)) / r;
  const parPV = F * factor;
  return annuityPV + parPV;
}

function bondPVDerivative(r: number, C: number, F: number, n: number): number {
  if (Math.abs(r) < 1e-12) {
    const sum = (-C * n * (n + 1)) / 2 - F * n;
    return sum;
  }
  const factor = Math.pow(1 + r, -n);
  const dAnnuity = C * ((n * Math.pow(1 + r, -n - 1) * r - (1 - factor)) / (r * r));
  const dPar = -n * F * Math.pow(1 + r, -n - 1);
  return dAnnuity + dPar;
}

export function solveYtm(params: YtmSolverParams): number {
  const {
    faceValue: F,
    couponPerPeriod: C,
    marketPrice: P,
    periods: n,
    frequencyPerYear: m,
  } = params;

  if (n <= 0) return 0;

  // For zero-coupon bonds, closed-form solution
  if (C === 0) {
    if (P <= 0) return 0;
    const r = Math.pow(F / P, 1 / n) - 1;
    return r * m;
  }

  const f = (r: number) => bondPV(r, C, F, n) - P;
  const fPrime = (r: number) => bondPVDerivative(r, C, F, n);

  let lower = -0.9999;
  let upper = 1.0;

  // Expand upper bound until PV < P (bracket the root)
  for (let i = 0; i < 50; i++) {
    if (f(upper) < 0) break;
    upper *= 2;
    if (upper > 100) {
      upper = 100;
      break;
    }
  }

  // Newton-Raphson with bisection fallback
  let r = C / P; // initial guess: current yield per period approximation
  if (r <= lower) r = (lower + upper) / 2;
  if (r >= upper) r = (lower + upper) / 2;

  const MAX_ITER = 200;
  const TOL = 1e-10;

  for (let i = 0; i < MAX_ITER; i++) {
    const fVal = f(r);
    if (Math.abs(fVal) < TOL) break;

    const fDeriv = fPrime(r);
    let rNew = r;

    // Attempt Newton step
    if (Math.abs(fDeriv) > 1e-15) {
      rNew = r - fVal / fDeriv;
    }

    // If Newton step goes out of bounds or fails, use bisection
    if (rNew <= lower || rNew >= upper || Math.abs(fDeriv) <= 1e-15) {
      rNew = (lower + upper) / 2;
    }

    // Narrow brackets for bisection
    if (f(lower) * fVal > 0) {
      lower = r;
    } else {
      upper = r;
    }

    r = rNew;
  }

  return r * m;
}
