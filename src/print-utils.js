"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printResume = printResume;
/**
 * Production Print Optimizer
 */
function printResume() {
    const resumeContainer = document.getElementById('resume-container');
    // Sanity Check
    if (!resumeContainer) {
        alert('Resume container not found in the DOM. Cannot print.');
        return;
    }
    // Inject Print Styles
    const styleId = 'print-overrides';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
    @media print {
      /* Interface Purging */
      .controls-bar, .theme-switcher-bar, button, nav, .debug-info, #loading-overlay {
        display: none !important;
      }

      body, html {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        color: black !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        height: auto !important;
        overflow: visible !important;
      }

      /* Sizing Mechanics (A4) */
      @page {
        size: A4;
        margin: 10mm;
      }

      #resume-container {
        width: 100% !important;
        max-width: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        color: black !important;
        position: static !important;
        float: none !important;
        clear: both !important;
        overflow: visible !important;
        height: auto !important;
        border: none !important;
      }

      /* Force all text to be black */
      #resume-container *, #resume-container h1, #resume-container h2, #resume-container h3, 
      #resume-container p, #resume-container span, #resume-container li, #resume-container a {
        color: black !important;
        background: transparent !important;
      }
      
      #resume-container a {
        text-decoration: underline;
      }

      /* Pagination Break Protections */
      .entity-item, .section-block, .positioned-block, .resume-section {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      /* Ensure first page is not blank */
      body::before, html::before {
        content: none !important;
      }
    }
  `;
    // Execute Print
    window.print();
}
