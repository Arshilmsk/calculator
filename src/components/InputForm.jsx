/**
 * InputForm Component
 * 
 * Renders all input fields with sliders and manual input controls.
 * Handles validation, toggles, and real-time updates.
 */

import { useState } from 'react';
import './InputForm.css';

const InputForm = ({ inputs, setInputs, errors, setErrors }) => {
  const [tenureType, setTenureType] = useState('months'); // 'months' or 'years'

  /**
   * Validate a single field and return error message or empty string
   */
  const validateField = (name, value) => {
    if (name === 'startDate') return '';

    if (value === '' || value === undefined || value === null) {
      return 'This field is required';
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Please enter a valid number';
    if (numValue < 0) return 'Value cannot be negative';

    switch (name) {
      case 'principal':
        if (numValue < 0) return 'Principal cannot be negative';
        if (numValue > 100000000) return 'Principal cannot exceed ₹10 Crore';
        break;
      case 'discount':
        if (numValue < 0) return 'Discount cannot be negative';
        if (numValue >= inputs.principal) return 'Discount cannot exceed principal';
        break;
      case 'annualRate':
        if (numValue === 0) return 'Interest rate must be greater than 0';
        if (numValue > 50) return 'Interest rate cannot exceed 50%';
        break;
      case 'tenure':
        if (numValue === 0) return 'Tenure must be greater than 0';
        if (tenureType === 'years' && numValue > 30) return 'Tenure cannot exceed 30 years';
        if (tenureType === 'months' && numValue > 360) return 'Tenure cannot exceed 360 months';
        break;
      case 'gstRate':
        if (numValue > 100) return 'GST rate cannot exceed 100%';
        break;
      default:
        break;
    }
    return '';
  };

  /**
   * Handle input change with validation
   */
  const handleChange = (name, value) => {
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    const numValue = parseFloat(value);

    if (name === 'tenure') {
      const months = tenureType === 'years' ? numValue * 12 : numValue;
      setInputs((prev) => ({
        ...prev,
        tenure: isNaN(numValue) ? '' : value,
        tenureMonths: isNaN(months) ? 0 : months,
      }));
    } else if (name === 'startDate') {
      setInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? '' : numValue,
      }));
    }
  };

  /**
   * Handle tenure type toggle (months ↔ years)
   */
  const handleTenureTypeChange = (type) => {
    setTenureType(type);
    const currentValue = parseFloat(inputs.tenure);
    if (!isNaN(currentValue) && currentValue > 0) {
      if (type === 'years') {
        const years = Math.round(currentValue / 12 * 10) / 10;
        setInputs((prev) => ({
          ...prev,
          tenure: years,
          tenureMonths: years * 12,
        }));
      } else {
        const months = Math.round(currentValue * 12);
        setInputs((prev) => ({
          ...prev,
          tenure: months,
          tenureMonths: months,
        }));
      }
    }
  };

  /**
   * Reset all inputs to default values
   */
  const handleReset = () => {
    setTenureType('months');
    setInputs({
      principal: 0,
      discount: 0,
      annualRate: 10,
      tenure: 12,
      tenureMonths: 12,
      processingFeeValue: 2,
      processingFeeType: 'percentage',
      gstRate: 18,
      applyGstOnProcessingFee: true,
      applyGstOnInterest: true,
      isNoCostEmi: false,
      startDate: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
      })(),
    });
    setErrors({});
    localStorage.removeItem('emiCalcInputs');
  };

  return (
    <div className="input-form">
      <div className="form-header">
        <h2>
          <span className="header-icon">⚙️</span>
          Loan Parameters
        </h2>
        <button className="reset-btn" onClick={handleReset} title="Reset all fields">
          <span>↻</span> Reset
        </button>
      </div>

      {/* Principal Amount */}
      <div className="input-group">
        <label htmlFor="principal">
          Principal Amount (₹)
          <span className="label-hint">Loan amount you wish to borrow</span>
        </label>
        <div className="input-with-slider">
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              id="principal"
              type="number"
              value={inputs.principal}
              onChange={(e) => handleChange('principal', e.target.value)}
              min="0"
              max="100000000"
              placeholder="Enter principal amount"
            />
          </div>
          <input
            type="range"
            min="0"
            max="10000000"
            step="50000"
            value={inputs.principal || 0}
            onChange={(e) => handleChange('principal', e.target.value)}
            className="slider"
          />
          <div className="slider-labels">
            <span>₹0</span>
            <span>₹1Cr</span>
          </div>
        </div>
        {errors.principal && <span className="error-msg">{errors.principal}</span>}
      </div>

      {/* Discount Amount */}
      <div className="input-group">
        <label htmlFor="discount">
          Discount Amount (₹)
          <span className="label-hint">Upfront discount on the product</span>
        </label>
        <div className="input-with-slider">
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              id="discount"
              type="number"
              value={inputs.discount}
              onChange={(e) => handleChange('discount', e.target.value)}
              min="0"
              max={inputs.principal || 100000}
              placeholder="Enter discount amount"
            />
          </div>
        </div>
        {errors.discount && <span className="error-msg">{errors.discount}</span>}
      </div>

      {/* Interest Rate */}
      <div className="input-group">
        <label htmlFor="annualRate">
          Interest Rate (% per annum)
          <span className="label-hint">Annual rate of interest</span>
        </label>
        <div className="input-with-slider">
          <div className="input-wrapper">
            <input
              id="annualRate"
              type="number"
              value={inputs.annualRate}
              onChange={(e) => handleChange('annualRate', e.target.value)}
              min="0"
              max="50"
              step="0.1"
              placeholder="Enter interest rate"
            />
            <span className="input-suffix">%</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.25"
            value={inputs.annualRate || 0}
            onChange={(e) => handleChange('annualRate', e.target.value)}
            className="slider"
          />
          <div className="slider-labels">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>
        {errors.annualRate && <span className="error-msg">{errors.annualRate}</span>}
      </div>

      {/* Tenure */}
      <div className="input-group">
        <label htmlFor="tenure">
          Loan Tenure
          <span className="label-hint">Duration of the loan</span>
        </label>
        <div className="toggle-group tenure-toggle">
          <button
            className={`toggle-btn ${tenureType === 'months' ? 'active' : ''}`}
            onClick={() => handleTenureTypeChange('months')}
          >
            Months
          </button>
          <button
            className={`toggle-btn ${tenureType === 'years' ? 'active' : ''}`}
            onClick={() => handleTenureTypeChange('years')}
          >
            Years
          </button>
        </div>
        <div className="input-with-slider">
          <div className="input-wrapper">
            <input
              id="tenure"
              type="number"
              value={inputs.tenure}
              onChange={(e) => handleChange('tenure', e.target.value)}
              min="1"
              max={tenureType === 'years' ? 30 : 360}
              step={tenureType === 'years' ? 0.5 : 1}
              placeholder={`Enter tenure in ${tenureType}`}
            />
            <span className="input-suffix">{tenureType === 'years' ? 'Yr' : 'Mo'}</span>
          </div>
          <input
            type="range"
            min="1"
            max={tenureType === 'years' ? 30 : 360}
            step={tenureType === 'years' ? 0.5 : 1}
            value={inputs.tenure || 1}
            onChange={(e) => handleChange('tenure', e.target.value)}
            className="slider"
          />
          <div className="slider-labels">
            <span>1 {tenureType === 'years' ? 'Yr' : 'Mo'}</span>
            <span>{tenureType === 'years' ? '30 Yr' : '360 Mo'}</span>
          </div>
        </div>
        {errors.tenure && <span className="error-msg">{errors.tenure}</span>}
      </div>

      {/* Start Date */}
      <div className="input-group">
        <label htmlFor="startDate">
          Loan Start Date
          <span className="label-hint">First installment month</span>
        </label>
        <div className="input-wrapper">
          <input
            id="startDate"
            type="date"
            value={inputs.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {/* Processing Fee */}
      <div className="input-group">
        <label htmlFor="processingFeeValue">
          Processing Fee
          <span className="label-hint">One-time fee charged by the lender</span>
        </label>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${inputs.processingFeeType === 'percentage' ? 'active' : ''}`}
            onClick={() => setInputs((prev) => ({ ...prev, processingFeeType: 'percentage' }))}
          >
            Percentage (%)
          </button>
          <button
            className={`toggle-btn ${inputs.processingFeeType === 'flat' ? 'active' : ''}`}
            onClick={() => setInputs((prev) => ({ ...prev, processingFeeType: 'flat' }))}
          >
            Flat Amount (₹)
          </button>
        </div>
        <div className="input-with-slider">
          <div className="input-wrapper">
            {inputs.processingFeeType === 'flat' && <span className="input-prefix">₹</span>}
            <input
              id="processingFeeValue"
              type="number"
              value={inputs.processingFeeValue}
              onChange={(e) => handleChange('processingFeeValue', e.target.value)}
              min="0"
              step={inputs.processingFeeType === 'percentage' ? '0.1' : '500'}
              placeholder={`Enter processing fee`}
            />
            {inputs.processingFeeType === 'percentage' && <span className="input-suffix">%</span>}
          </div>
        </div>
        {errors.processingFeeValue && <span className="error-msg">{errors.processingFeeValue}</span>}
      </div>

      {/* GST Rate */}
      <div className="input-group">
        <label htmlFor="gstRate">
          GST Rate (%)
          <span className="label-hint">Goods & Services Tax rate</span>
        </label>
        <div className="input-with-slider">
          <div className="input-wrapper">
            <input
              id="gstRate"
              type="number"
              value={inputs.gstRate}
              onChange={(e) => handleChange('gstRate', e.target.value)}
              min="0"
              max="100"
              step="0.5"
              placeholder="Enter GST rate"
            />
            <span className="input-suffix">%</span>
          </div>
        </div>
        {errors.gstRate && <span className="error-msg">{errors.gstRate}</span>}
      </div>

      {/* Advanced Features Toggle */}
      <div className="gst-toggles advance-features">
        <h3>Offer Features</h3>
        <div className="switch-group">
          <label className="switch-label" htmlFor="noCostEmi">
            <span className="switch-text">
              <span className="switch-title">No Cost EMI</span>
              <span className="switch-desc">Interest is waived via merchant discount</span>
            </span>
            <div className="switch-container">
              <input
                id="noCostEmi"
                type="checkbox"
                checked={inputs.isNoCostEmi}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, isNoCostEmi: e.target.checked }))
                }
              />
              <span className="switch-slider"></span>
            </div>
          </label>
        </div>
      </div>

      {/* GST Toggles */}
      <div className="gst-toggles">
        <h3>GST Application</h3>
        <div className="switch-group">
          <label className="switch-label" htmlFor="gstOnProcessing">
            <span className="switch-text">
              <span className="switch-title">Apply GST on Processing Fee</span>
              <span className="switch-desc">Include GST on the processing fee amount</span>
            </span>
            <div className="switch-container">
              <input
                id="gstOnProcessing"
                type="checkbox"
                checked={inputs.applyGstOnProcessingFee}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, applyGstOnProcessingFee: e.target.checked }))
                }
              />
              <span className="switch-slider"></span>
            </div>
          </label>
        </div>
        <div className="switch-group">
          <label className="switch-label" htmlFor="gstOnInterest">
            <span className="switch-text">
              <span className="switch-title">Apply GST on Interest Component</span>
              <span className="switch-desc">Include GST on the total interest payable</span>
            </span>
            <div className="switch-container">
              <input
                id="gstOnInterest"
                type="checkbox"
                checked={inputs.applyGstOnInterest}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, applyGstOnInterest: e.target.checked }))
                }
              />
              <span className="switch-slider"></span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
