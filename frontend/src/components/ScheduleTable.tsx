import React from 'react';
import { CashFlowRow } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  schedule: CashFlowRow[];
}

export const ScheduleTable: React.FC<Props> = ({ schedule }) => {
  return (
    <div className="schedule-section">
      <h2>Cash Flow Schedule</h2>
      <div className="table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Payment Date</th>
              <th>Coupon Payment</th>
              <th>Cumulative Interest</th>
              <th>Remaining Principal</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row) => (
              <tr key={row.period}>
                <td>{row.period}</td>
                <td>{row.paymentDateISO}</td>
                <td>{formatCurrency(row.couponPayment)}</td>
                <td>{formatCurrency(row.cumulativeInterest)}</td>
                <td>{formatCurrency(row.remainingPrincipal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
