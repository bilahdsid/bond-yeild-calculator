import { Injectable } from '@nestjs/common';
import {
  calculateBondMetrics,
  type BondCalculateRequest,
  type BondCalculateResponse,
} from './domain/bond-calculator.js';

@Injectable()
export class BondService {
  calculate(request: BondCalculateRequest): BondCalculateResponse {
    return calculateBondMetrics(request);
  }
}
