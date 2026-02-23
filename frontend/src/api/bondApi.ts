import axios from 'axios';
import { BondCalculateRequest, BondCalculateResponse } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export async function calculateBond(
  request: BondCalculateRequest,
): Promise<BondCalculateResponse> {
  const { data } = await axios.post<BondCalculateResponse>(
    `${API_BASE}/api/bond/calculate`,
    request,
  );
  return data;
}
