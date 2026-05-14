/**
 * SummaryCards Component
 * 
 * Displays financial summary in a grid of visually distinct cards.
 * Each card shows a key metric with an icon and formatted value.
 */

import { formatCurrency } from '../utils/emiCalculator';
import './SummaryCards.css';

const SummaryCards = ({ summary, principal }) => {
  const cards = [
    {
      id: 'principal',
      title: summary.isNoCostEmi ? 'Product Price' : 'Principal Amount',
      value: formatCurrency(principal),
      icon: '🏦',
      gradient: 'card-blue',
    },
    {
      id: 'emi',
      title: 'Monthly EMI',
      value: formatCurrency(summary.emi),
      icon: '📅',
      gradient: 'card-indigo',
    },
    {
      id: 'interest',
      title: summary.isNoCostEmi ? 'Merchant Discount' : 'Total Interest',
      value: summary.isNoCostEmi ? formatCurrency(summary.merchantDiscount) : formatCurrency(summary.totalInterest),
      icon: summary.isNoCostEmi ? '🎁' : '📈',
      gradient: summary.isNoCostEmi ? 'card-emerald' : 'card-purple',
      subtitle: summary.isNoCostEmi ? '(No Cost EMI Saving)' : null
    },
    {
      id: 'processing',
      title: 'Processing Fee',
      value: formatCurrency(summary.processingFee),
      icon: '🧾',
      gradient: 'card-amber',
    },
    {
      id: 'gst',
      title: 'GST Amount',
      value: formatCurrency(summary.totalGst),
      icon: '🏷️',
      gradient: 'card-rose',
    },
    {
      id: 'total',
      title: 'Total Payable',
      value: formatCurrency(summary.totalPayable),
      icon: '💰',
      gradient: 'card-emerald',
    },
  ];

  return (
    <div className="summary-section">
      <h2 className="section-title">
        <span className="section-icon">📊</span>
        Financial Summary
      </h2>
      <div className="summary-grid">
        {cards.map((card) => (
          <div key={card.id} className={`summary-card ${card.gradient}`}>
            <div className="card-header">
              <span className="card-icon">{card.icon}</span>
              <span className="card-title">{card.title}</span>
            </div>
            <div className="card-value">{card.value}</div>
            {card.subtitle && <div className="card-subtitle">{card.subtitle}</div>}
            {card.id === 'gst' && (
              <div className="card-breakdown">
                <span>On Processing: {formatCurrency(summary.gstOnProcessingFee)}</span>
                <span>On Interest: {formatCurrency(summary.gstOnInterest)}</span>
              </div>
            )}
            {card.id === 'principal' && summary.discountedPrincipal !== principal && (
              <div className="card-breakdown">
                <span>Original: {formatCurrency(principal)}</span>
                <span>After Discount: {formatCurrency(summary.discountedPrincipal)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;
