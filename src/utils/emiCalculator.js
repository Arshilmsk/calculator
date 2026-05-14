/**
 * EMI GST Calculator - Core Calculation Utilities
 * 
 * Contains all financial calculation logic:
 * - EMI computation using standard formula
 * - Processing fee calculation
 * - GST computation on interest & processing fee
 * - Amortization schedule generation
 */

/**
 * Formats a number to Indian currency format (₹)
 * e.g., 1234567.89 → "₹12,34,567.89"
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate EMI using the standard formula:
 * EMI = [P × R × (1+R)^N] / [(1+R)^N – 1]
 * 
 * @param {number} principal - Loan principal amount
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {number} Monthly EMI amount
 */
export const calculateEMI = (principal, annualRate, tenureMonths) => {
  if (!principal || !annualRate || !tenureMonths) return 0;
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100; // R
  const n = tenureMonths; // N

  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, n);
  const denominator = Math.pow(1 + monthlyRate, n) - 1;

  return numerator / denominator;
};

/**
 * Calculate processing fee based on type (percentage or flat)
 * 
 * @param {number} principal - Loan principal amount
 * @param {number} feeValue - Fee value (either % or flat ₹)
 * @param {string} feeType - 'percentage' or 'flat'
 * @returns {number} Processing fee amount
 */
export const calculateProcessingFee = (principal, feeValue, feeType) => {
  if (!feeValue || feeValue <= 0) return 0;
  if (feeType === 'percentage') {
    return (principal * feeValue) / 100;
  }
  return feeValue; // flat amount
};

/**
 * Calculate GST amount on a given value
 * 
 * @param {number} amount - Amount to calculate GST on
 * @param {number} gstRate - GST rate in percentage
 * @param {boolean} applyGst - Whether GST toggle is ON
 * @returns {number} GST amount
 */
export const calculateGST = (amount, gstRate, applyGst) => {
  if (!applyGst || !amount || !gstRate) return 0;
  return (amount * gstRate) / 100;
};

/**
 * Generate full amortization schedule
 * 
 * @param {number} principal - Loan principal
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} tenureMonths - Tenure in months
 * @param {number} emi - Monthly EMI amount
 * @param {number} gstRate - GST rate (%)
 * @param {boolean} applyGstOnInterest - Whether to apply GST on interest
 * @returns {Array} Array of monthly amortization entries
 */
export const generateAmortizationSchedule = (
  principal,
  annualRate,
  tenureMonths,
  emi,
  gstRate,
  applyGstOnInterest,
  startDate = new Date()
) => {
  if (!principal || !annualRate || !tenureMonths || !emi) return [];

  const monthlyRate = annualRate / 12 / 100;
  let remainingBalance = principal;
  const schedule = [];
  
  // Robust date parsing
  let start = new Date(startDate);
  if (isNaN(start.getTime())) {
    start = new Date();
  }

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = remainingBalance * monthlyRate;
    const principalPaid = emi - interestPaid;
    const gstOnInterest = applyGstOnInterest ? (interestPaid * gstRate) / 100 : 0;

    remainingBalance = remainingBalance - principalPaid;

    // Prevent floating point issues for the last month
    if (month === tenureMonths) {
      remainingBalance = 0;
    }

    // Calculate date for this installment
    const installmentDate = new Date(start);
    installmentDate.setMonth(start.getMonth() + month - 1);
    const dateString = installmentDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    schedule.push({
      month,
      date: dateString,
      emi: emi,
      principalPaid: Math.max(principalPaid, 0),
      interestPaid,
      gstOnInterest,
      remainingBalance: Math.max(remainingBalance, 0),
    });
  }

  return schedule;
};

/**
 * Calculate complete financial summary
 * 
 * @param {Object} inputs - All input parameters
 * @returns {Object} Complete financial breakdown
 */
export const calculateFullSummary = (inputs) => {
  const {
    principal,
    discount = 0,
    annualRate,
    tenureMonths,
    processingFeeValue,
    processingFeeType,
    gstRate,
    applyGstOnProcessingFee,
    applyGstOnInterest,
    isNoCostEmi = false,
    startDate,
  } = inputs;

  // 1. Apply Upfront Discount
  const discountedPrincipal = Math.max(principal - discount, 0);

  let emi, totalInterest, merchantDiscount = 0, finalPrincipal = discountedPrincipal;

  if (isNoCostEmi) {
    // 2. No Cost EMI Logic
    // EMI is simply Principal / Tenure
    emi = discountedPrincipal / tenureMonths;
    
    // In No Cost EMI, the bank still charges interest, but the merchant gives a discount upfront
    // To find the merchant discount, we need to find a 'Loan Amount' such that 
    // EMI of 'Loan Amount' at 'annualRate' equals 'emi'
    
    const monthlyRate = annualRate / 12 / 100;
    const n = tenureMonths;
    
    // Reverse EMI formula: P = EMI / [ (R * (1+R)^N) / ((1+R)^N - 1) ]
    const emiFactor = (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    finalPrincipal = emi / emiFactor;
    
    merchantDiscount = discountedPrincipal - finalPrincipal;
    totalInterest = emi * tenureMonths - finalPrincipal;
  } else {
    // 2. Standard EMI Logic
    emi = calculateEMI(discountedPrincipal, annualRate, tenureMonths);
    totalInterest = (emi * tenureMonths) - discountedPrincipal;
  }

  const totalPayment = emi * tenureMonths;
  const processingFee = calculateProcessingFee(discountedPrincipal, processingFeeValue, processingFeeType);
  const gstOnProcessingFee = calculateGST(processingFee, gstRate, applyGstOnProcessingFee);
  
  // For GST on interest, we use the total interest calculated
  const gstOnInterest = calculateGST(totalInterest, gstRate, applyGstOnInterest);
  
  const totalGst = gstOnProcessingFee + gstOnInterest;
  const totalPayable = discountedPrincipal + (isNoCostEmi ? 0 : totalInterest) + processingFee + totalGst;

  const schedule = generateAmortizationSchedule(
    finalPrincipal,
    annualRate,
    tenureMonths,
    emi,
    gstRate,
    applyGstOnInterest,
    startDate
  );

  return {
    emi,
    totalPayment,
    totalInterest,
    processingFee,
    gstOnProcessingFee,
    gstOnInterest,
    totalGst,
    totalPayable,
    merchantDiscount,
    discountedPrincipal,
    schedule,
    isNoCostEmi,
  };
};
