/**
 * Production Print Optimizer (`print-utils.ts`)
 */
export function printResume(): void {
  const resumeContainer = document.getElementById('resume-container');

  // 1. Sanity Check
  if (!resumeContainer || resumeContainer.innerHTML.trim() === '') {
    alert('Resume content is empty! Please generate it first.');
    return;
  }

  // 2. Inject Print Styles
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
      .ui-controls, .theme-switcher-bar, button, nav, .debug-info {
        display: none !important;
      }

      body, html {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* Sizing Mechanics (A4) */
      @page {
        size: A4;
        margin: 10mm;
      }

      #resume-container {
        width: 100% !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Pagination Break Protections */
      .entity-item, .section-block, .positioned-block {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      h1, h2, h3 {
        page-break-after: avoid;
      }
    }
  `;

  // 3. Execution
  window.print();
}
