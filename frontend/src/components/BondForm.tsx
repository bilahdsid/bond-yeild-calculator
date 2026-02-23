import React, { useState } from 'react';
import { BondCalculateRequest, CouponFrequency } from '../types';

interface Props {
  onSubmit: (request: BondCalculateRequest) => void;
  loading: boolean;
}

const initialState: BondCalculateRequest = {
  faceValue: 1000,
  annualCouponRatePct: 5,
  marketPrice: 950,
  yearsToMaturity: 5,
  couponFrequency: 'semi-annual',
};

export const BondForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [form, setForm] = useState<BondCalculateRequest>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.faceValue <= 0) e.faceValue = 'Must be greater than 0';
    if (form.annualCouponRatePct < 0) e.annualCouponRatePct = 'Cannot be negative';
    if (form.marketPrice <= 0) e.marketPrice = 'Must be greater than 0';
    if (form.yearsToMaturity <= 0) e.yearsToMaturity = 'Must be greater than 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const handleChange = (field: keyof BondCalculateRequest, value: string) => {
    if (field === 'couponFrequency') {
      setForm((prev) => ({ ...prev, couponFrequency: value as CouponFrequency }));
    } else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setForm((prev) => ({ ...prev, [field]: num }));
      } else if (value === '' || value === '-') {
        setForm((prev) => ({ ...prev, [field]: 0 }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bond-form">
      <h2>Bond Parameters</h2>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="faceValue">Face Value ($)</label>
          <input
            id="faceValue"
            type="number"
            step="any"
            value={form.faceValue || ''}
            onChange={(e) => handleChange('faceValue', e.target.value)}
          />
          {errors.faceValue && <span className="error">{errors.faceValue}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="annualCouponRatePct">Annual Coupon Rate (%)</label>
          <input
            id="annualCouponRatePct"
            type="number"
            step="any"
            min="0"
            value={form.annualCouponRatePct}
            onChange={(e) => handleChange('annualCouponRatePct', e.target.value)}
          />
          {errors.annualCouponRatePct && (
            <span className="error">{errors.annualCouponRatePct}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="marketPrice">Market Price ($)</label>
          <input
            id="marketPrice"
            type="number"
            step="any"
            value={form.marketPrice || ''}
            onChange={(e) => handleChange('marketPrice', e.target.value)}
          />
          {errors.marketPrice && <span className="error">{errors.marketPrice}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="yearsToMaturity">Years to Maturity</label>
          <input
            id="yearsToMaturity"
            type="number"
            step="any"
            value={form.yearsToMaturity || ''}
            onChange={(e) => handleChange('yearsToMaturity', e.target.value)}
          />
          {errors.yearsToMaturity && <span className="error">{errors.yearsToMaturity}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="couponFrequency">Coupon Frequency</label>
          <select
            id="couponFrequency"
            value={form.couponFrequency}
            onChange={(e) => handleChange('couponFrequency', e.target.value)}
          >
            <option value="annual">Annual</option>
            <option value="semi-annual">Semi-Annual</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn-calculate" disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
    </form>
  );
};
