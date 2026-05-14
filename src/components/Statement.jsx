import React from 'react';
import { formatCurrency } from '../utils/emiCalculator';
import './Statement.css';

const Statement = ({ inputs, summary }) => {
  if (!summary) return null;

  return (
    <div className="statement-report">
      <header className="statement-header">
        <div className="statement-logo">
          <span className="logo-icon">🏦</span>
          <h1>EMI & GST Calculator</h1>
        </div>
        <p className="statement-subtitle">Full Financial Analysis Statement</p>
      </header>

      <section className="statement-section">
        <h3 className="section-title">Loan Parameters</h3>
        <div className="params-grid">
          <div className="param-item">
            <span className="param-label">Original Principal</span>
            <span className="param-value">{formatCurrency(inputs.principal)}</span>
          </div>
          {inputs.discount > 0 && (
            <div className="param-item">
              <span className="param-label">Upfront Discount</span>
              <span className="param-value">-{formatCurrency(inputs.discount)}</span>
            </div>
          )}
          <div className="param-item">
            <span className="param-label">Annual Interest Rate</span>
            <span className="param-value">{inputs.annualRate}%</span>
          </div>
          <div className="param-item">
            <span className="param-label">Tenure</span>
            <span className="param-value">{inputs.tenureMonths} Months</span>
          </div>
          <div className="param-item">
            <span className="param-label">No Cost EMI</span>
            <span className="param-value">{inputs.isNoCostEmi ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </section>

      <section className="statement-section">
        <h3 className="section-title">Financial Summary</h3>
        <div className="summary-grid-report">
          <div className="summary-item main">
            <span className="summary-label">Monthly EMI</span>
            <span className="summary-value">{formatCurrency(summary.emi)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">
              {summary.isNoCostEmi ? 'Merchant Discount' : 'Total Interest'}
            </span>
            <span className="summary-value">{formatCurrency(summary.isNoCostEmi ? summary.merchantDiscount : summary.totalInterest)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Processing Fee</span>
            <span className="summary-value">{formatCurrency(summary.processingFee)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total GST</span>
            <span className="summary-value">{formatCurrency(summary.totalGst)}</span>
          </div>
          <div className="summary-item total">
            <span className="summary-label">Total Payable</span>
            <span className="summary-value">{formatCurrency(summary.totalPayable)}</span>
          </div>
        </div>
      </section>

      <section className="statement-section">
        <h3 className="section-title">Amortization Schedule</h3>
        <table className="statement-table">
          <thead>
            <tr>
              <th>EMI No.</th>
              <th>Date</th>
              <th>EMI</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>GST</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {summary.schedule.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td style={{ fontWeight: '600' }}>{row.date}</td>
                <td>{formatCurrency(row.emi)}</td>
                <td>{formatCurrency(row.principalPaid)}</td>
                <td>{formatCurrency(row.interestPaid)}</td>
                <td>{formatCurrency(row.gstOnInterest)}</td>
                <td>{formatCurrency(row.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="statement-footer">
        <p>This is a computer-generated statement for estimation purposes only.</p>
        <p>Generated on: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default Statement;
