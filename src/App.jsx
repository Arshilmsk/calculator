/**
 * Main Application Component
 * 
 * Orchestrates the EMI GST Calculator, manages state,
 * and handles the real-time calculations using useMemo.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import InputForm from './components/InputForm';
import SummaryCards from './components/SummaryCards';
import EmiTable from './components/EmiTable';
import PdfExport from './components/PdfExport';
import Statement from './components/Statement';
import { useTheme } from './hooks/useTheme';
import ThemeToggle from './components/ThemeToggle';
import { calculateFullSummary } from './utils/emiCalculator';
import './App.css';

function App() {
  const { theme, setTheme } = useTheme();
  // Reference for PDF export
  const reportRef = useRef(null);
  const statementRef = useRef(null);

  // Initialize state from localStorage or defaults
  const [inputs, setInputs] = useState(() => {
    const defaults = {
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
    };

    const saved = localStorage.getItem('emiCalcInputs');
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved inputs', e);
      }
    }
    return defaults;
  });

  const [errors, setErrors] = useState({});

  // Save to localStorage whenever inputs change
  useEffect(() => {
    localStorage.setItem('emiCalcInputs', JSON.stringify(inputs));
  }, [inputs]);

  // Calculate summary and schedule reactively using useMemo
  const financialData = useMemo(() => {
    // Check if there are any errors or missing required inputs
    const hasErrors = Object.values(errors).some((err) => err !== '');
    const hasEmptyInputs = 
      inputs.principal === '' || 
      inputs.annualRate === '' || 
      inputs.tenure === '' ||
      inputs.processingFeeValue === '' ||
      inputs.gstRate === '';

    if (hasErrors || hasEmptyInputs) {
      return null;
    }

    return calculateFullSummary(inputs);
  }, [inputs, errors]);

  return (
    <div className="app-container">
      {/* Hidden Statement for PDF Export - captures full schedule and all data */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
        <div ref={statementRef}>
          <Statement inputs={inputs} summary={financialData} />
        </div>
      </div>
      <header className="app-header">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <div className="logo">
          <span className="logo-icon">🏦</span>
          <h1>EMI & GST Calculator</h1>
        </div>
        <p className="subtitle">Professional Financial Analysis Tool</p>
      </header>

      <main className="main-content">
        <div className="calculator-layout" ref={reportRef}>
          
          {/* Left Column: Input Form */}
          <div className="input-section">
            <InputForm 
              inputs={inputs} 
              setInputs={setInputs} 
              errors={errors} 
              setErrors={setErrors} 
            />
          </div>

          {/* Right Column: Results & Analysis */}
          <div className="results-section">
            {financialData ? (
              <>
                <SummaryCards 
                  summary={financialData} 
                  principal={inputs.principal} 
                />
                <EmiTable 
                  schedule={financialData.schedule} 
                />
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Awaiting Input</h3>
                <p>Please enter valid loan parameters to view the financial analysis and amortization schedule.</p>
              </div>
            )}
          </div>
        </div>

        {/* PDF Export Section - Moved inside layout */}
        {financialData && (
          <div className="export-section">
            <PdfExport targetRef={statementRef} />
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Built with React.js &bull; For Educational & Estimation Purposes Only</p>
      </footer>
    </div>
  );
}

export default App;
