import React, { useState } from 'react';
import { BondForm } from './components/BondForm';
import { Outputs } from './components/Outputs';
import { ScheduleTable } from './components/ScheduleTable';
import { calculateBond } from './api/bondApi';
import { BondCalculateRequest, BondCalculateResponse } from './types';
import './App.css';

function App() {
  const [result, setResult] = useState<BondCalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (request: BondCalculateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await calculateBond(request);
      setResult(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.[0] ||
        err?.response?.data?.message ||
        err?.message ||
        'Calculation failed. Is the backend running?';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bond Yield Calculator</h1>
        <p className="app-subtitle">
          Compute current yield, YTM, total interest, and view the full cash-flow schedule.
        </p>
      </header>

      <main className="app-main">
        <BondForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <>
            <Outputs result={result} />
            <ScheduleTable schedule={result.schedule} />
          </>
        )}

        <section className="assumptions">
          <h3>Assumptions</h3>
          <ul>
            <li>
              Settlement date is today; payment dates are derived by adding period lengths from
              today.
            </li>
            <li>
              Plain vanilla bullet bond: principal remains outstanding at face value until maturity.
            </li>
            <li>Total interest = sum of all coupon payments (no reinvestment).</li>
            <li>YTM is a nominal annual rate compounded at the coupon frequency.</li>
            <li>
              Fractional years use <code>ceil(yearsToMaturity * frequency)</code> for period count.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
