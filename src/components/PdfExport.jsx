/**
 * PdfExport Component
 * 
 * Handles generating and downloading a PDF report of the calculator
 * including the inputs, summary, and the full amortization schedule.
 * Uses jsPDF and html2canvas.
 */

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PdfExport.css';

const PdfExport = ({ targetRef, fileName = 'EMI_GST_Report.pdf' }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!targetRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Select the element to capture
      const element = targetRef.current;
      
      // Create canvas from element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', // Professional white background for statement
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate 2% margin (approx 6mm for A4)
      const marginY = pdfHeight * 0.02; 
      const contentHeight = pdfHeight - (2 * marginY);
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      while (heightLeft > 0) {
        // Draw the image slice
        // The image is drawn starting at 'marginY' to leave the top gap
        pdf.addImage(imgData, 'PNG', 0, position + marginY, imgWidth, imgHeight);
        
        // MASKING: Add white bars at top and bottom to create clean margins
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, marginY, 'F'); // Top Margin Mask
        pdf.rect(0, pdfHeight - marginY, pdfWidth, marginY, 'F'); // Bottom Margin Mask
        
        heightLeft -= contentHeight;
        position -= contentHeight;
        
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
      
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pdf-export-container">
      <button 
        className={`export-btn ${isExporting ? 'exporting' : ''}`}
        onClick={handleExport}
        disabled={isExporting}
      >
        <span className="export-icon">{isExporting ? '⏳' : '📄'}</span>
        {isExporting ? 'Generating PDF...' : 'Download PDF Report'}
      </button>
    </div>
  );
};

export default PdfExport;
