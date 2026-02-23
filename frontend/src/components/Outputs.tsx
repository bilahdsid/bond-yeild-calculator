import React from 'react';
import { BondCalculateResponse } from '../types';
import { formatCurrency, formatPercent } from '../utils/format';

interface Props {
  result: BondCalculateResponse;
}

const statusColors: Record<string, string> = {
  premium: '#e74c3c',
  discount: '#27ae60',
  par: '#3498db',
};

export const Outputs: React.FC<Props> = ({ result }) => {
  const { outputs } = result;

  return (
    <div className="outputs-section">
      <h2>Results</h2>

      <div className="outputs-grid">
        <div className="output-card">
          <span className="output-label">Current Yield</span>
          <span className="output-value">{formatPercent(outputs.currentYield)}</span>
        </div>

        <div className="output-card">
          <span className="output-label">Yield to Maturity (YTM)</span>
          <span className="output-value">{formatPercent(outputs.ytm)}</span>
        </div>

        <div className="output-card">
          <span className="output-label">Total Interest Earned</span>
          <span className="output-value">{formatCurrency(outputs.totalInterest)}</span>
        </div>

        <div className="output-card">
          <span className="output-label">Price Status</span>
          <span
            className="output-badge"
            style={{ backgroundColor: statusColors[outputs.priceStatus] }}
          >
            {outputs.priceStatus.charAt(0).toUpperCase() + outputs.priceStatus.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};
