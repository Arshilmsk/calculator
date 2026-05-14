/**
 * EmiTable Component
 * 
 * Displays the complete amortization schedule in a responsive table format.
 * Shows monthly breakdown of EMI, principal, interest, GST, and remaining balance.
 */

import { formatCurrency } from '../utils/emiCalculator';
import './EmiTable.css';

const EmiTable = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="table-container">
      <div className="table-header-section">
        <h2 className="section-title">
          <span className="section-icon">📋</span>
          Amortization Schedule
        </h2>
      </div>

      <div className="table-wrapper">
        <table className="emi-table">
          <thead>
            <tr>
              <th>EMI No.</th>
              <th>Date</th>
              <th>EMI Amount</th>
              <th>Principal Paid</th>
              <th>Interest Paid</th>
              <th>GST on Interest</th>
              <th>Remaining Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row) => (
              <tr key={row.month}>
                <td className="sno-col">{row.month}</td>
                <td className="month-col">
                  <div className="date-val">{row.date}</div>
                </td>
                <td className="highlight-col">{formatCurrency(row.emi)}</td>
                <td>{formatCurrency(row.principalPaid)}</td>
                <td>{formatCurrency(row.interestPaid)}</td>
                <td>{formatCurrency(row.gstOnInterest)}</td>
                <td className="balance-col">{formatCurrency(row.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmiTable;
