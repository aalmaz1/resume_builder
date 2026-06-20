/**
 * Production Print Optimizer
 */
export function printResume(): void {
  const resumeContainer = document.getElementById('resume-container');
  
  // Sanity Check
  if (!resumeContainer) {
    alert('Resume container not found in the DOM. Cannot print.');
    return;
  }

  // Inject Print Styles - matching index.html exactly
  const styleId = 'print-overrides';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    @media print {
      /* Interface Purging */
      .controls-bar, .theme-switcher-bar, button, nav, .debug-info, #loading-overlay, .no-print {
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
        -webkit-margin-before: 0 !important;
        -webkit-margin-after: 0 !important;
      }

      /* Sizing Mechanics (A4) - NO margins to prevent browser headers/footers */
      @page {
        size: A4;
        margin: 0 !important;
      }
      
      @page:first {
        margin: 0 !important;
      }
      
      @page:left {
        margin: 0 !important;
      }
      
      @page:right {
        margin: 0 !important;
      }

      #resume-container {
        width: 100% !important;
        max-width: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 15mm !important;
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
      .entity-item, .section-block, .positioned-block, .resume-section, .resume-header {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      h1, h2, h3 {
        page-break-after: avoid;
        margin-top: 0 !important;
      }
      
      /* Ensure first page is not blank and no extra spacing */
      body::before, html::before {
        content: none !important;
      }
      
      /* Text wrapping for long names/URLs */
      h1, h2, .contact-line {
        overflow-wrap: break-word;
        word-wrap: break-word;
        hyphens: auto;
      }
      
      /* Minimal gap after header */
      .resume-header {
        margin-top: 0 !important;
        padding-top: 0 !important;
        margin-bottom: 10px !important;
      }
    }
  `;

  // Execute Print
  window.print();
}
