/**
 * Print-to-PDF Functionality for Pretext Resume Builder
 * 
 * Provides CSS @media print styles and a TypeScript function to trigger
 * the browser's native print dialog with proper theme support.
 */

import { injectThemeStyles, getCurrentTheme, applyTheme } from './resume-themes'

// ============================================================================
// Print CSS Styles
// ============================================================================

export const PRINT_CSS = `
/* ============================================================================
   Print Styles for Resume Builder
   Optimized for A4 paper format
   ============================================================================ */

@media print {
  /* Page setup for A4 */
  @page {
    size: A4;
    margin: 0;
  }

  /* Ensure colors print correctly */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* Hide UI elements that shouldn't appear in print */
  .theme-switcher,
  .theme-switcher *,
  [data-theme-switcher],
  [data-theme-switcher] *,
  .no-print,
  .no-print *,
  nav,
  navigation,
  .navigation,
  .nav-buttons,
  .btn-print,
  button,
  input,
  select,
  textarea,
  .controls,
  .toolbar,
  header:not(.resume-header),
  footer:not(.resume-footer),
  aside,
  .sidebar,
  .modal,
  .dialog,
  .popup {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    left: -9999px !important;
  }

  /* Reset body margins for print */
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    color: black !important;
  }

  /* Ensure resume container is properly sized and centered */
  .resume-container,
  #resume-container,
  .resume,
  #resume,
  .resume-content,
  #resume-content {
    width: 210mm !important; /* A4 width */
    min-height: 297mm !important; /* A4 height */
    margin: 0 auto !important;
    padding: 15mm !important; /* Standard print margin */
    box-shadow: none !important;
    background: white !important;
    position: relative !important;
    left: 0 !important;
    top: 0 !important;
    float: none !important;
    clear: both !important;
    page-break-after: always !important;
  }

  /* Ensure text is readable in print */
  .resume-container *,
  #resume-container * {
    text-shadow: none !important;
    box-shadow: none !important;
  }

  /* Prevent content from breaking awkwardly */
  .resume-section,
  .resume-entry,
  .resume-block {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Force section titles to stay with their content */
  .resume-section-title {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  /* Ensure links are visible (optional: show URLs) */
  a[href]:after {
    content: "" !important;
  }

  /* Remove hover effects */
  *:hover {
    background: transparent !important;
  }

  /* Ensure images scale properly */
  img {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid !important;
  }

  /* Force background graphics for gradients and colored sections */
  .resume-section-bg,
  [style*="background"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

/* Screen-specific adjustments when preparing for print */
.print-preview-mode {
  .theme-switcher,
  .controls,
  .toolbar {
    opacity: 0.3;
    pointer-events: none;
  }
}
`

// ============================================================================
// Print Utility Functions
// ============================================================================

/**
 * Inject print CSS into the document
 * Should be called once during initialization
 */
export function injectPrintStyles(): void {
  if (typeof document === 'undefined') return

  const existingStyle = document.getElementById('resume-print-styles')
  if (existingStyle) return

  const styleElement = document.createElement('style')
  styleElement.id = 'resume-print-styles'
  styleElement.setAttribute('media', 'print, screen')
  styleElement.textContent = PRINT_CSS
  document.head.appendChild(styleElement)
}

/**
 * Options for printResume function
 */
export type PrintOptions = {
  /** Callback before print dialog opens */
  onBeforePrint?: () => void
  /** Callback after print dialog closes (or is cancelled) */
  onAfterPrint?: () => void
  /** Force inject styles before printing (default: true) */
  injectStyles?: boolean
  /** Theme to apply before printing (default: current theme) */
  theme?: string
  /** Container element selector or reference */
  container?: HTMLElement | string
}

/**
 * Triggers the browser's native print dialog with proper theme support.
 * 
 * This function ensures that:
 * - Print styles are injected
 * - Current theme is preserved
 * - UI elements are hidden during print
 * - Lifecycle callbacks are executed
 * 
 * @param options - Optional configuration for print behavior
 * 
 * @example
 * // Basic usage
 * printResume()
 * 
 * @example
 * // With callbacks
 * printResume({
 *   onBeforePrint: () => console.log('Preparing to print...'),
 *   onAfterPrint: () => console.log('Print completed or cancelled')
 * })
 * 
 * @example
 * // With specific theme
 * printResume({ theme: 'professional' })
 */
export function printResume(options: PrintOptions = {}): void {
  const {
    onBeforePrint,
    onAfterPrint,
    injectStyles = true,
    theme,
    container,
  } = options

  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('printResume() requires a browser environment')
    return
  }

  // Inject styles if requested
  if (injectStyles) {
    injectPrintStyles()
    injectThemeStyles()
  }

  // Resolve container element
  let containerElement: HTMLElement | null = null
  if (container) {
    if (typeof container === 'string') {
      containerElement = document.querySelector(container)
    } else {
      containerElement = container
    }
  }

  // Store current theme to restore after printing
  const previousTheme = getCurrentTheme(containerElement || undefined)

  // Apply specified theme if provided
  if (theme && ['professional', 'creative', 'minimalist'].includes(theme)) {
    applyTheme(theme as 'professional' | 'creative' | 'minimalist', containerElement || undefined)
  }

  // Execute before print callback
  if (onBeforePrint) {
    onBeforePrint()
  }

  // Add a small delay to ensure styles are applied
  setTimeout(() => {
    try {
      // Trigger the browser's print dialog
      window.print()
    } catch (error) {
      console.error('Error triggering print dialog:', error)
    } finally {
      // Execute after print callback
      // Note: This fires immediately after print() returns,
      // not necessarily after the user completes/cancels printing
      if (onAfterPrint) {
        onAfterPrint()
      }

      // Restore previous theme if we changed it
      if (theme && theme !== previousTheme) {
        // Defer theme restoration to avoid interfering with print preview
        setTimeout(() => {
          applyTheme(previousTheme, containerElement || undefined)
        }, 100)
      }
    }
  }, 50)
}

/**
 * Prepares the resume for print preview mode without opening the dialog.
 * Useful for showing users how their resume will look when printed.
 * 
 * @param container - Container element or selector
 * @param enable - Whether to enable or disable preview mode
 */
export function setPrintPreviewMode(
  enable: boolean,
  container?: HTMLElement | string,
): void {
  if (typeof document === 'undefined') return

  let containerElement: HTMLElement | null = null
  if (container) {
    if (typeof container === 'string') {
      containerElement = document.querySelector(container)
    } else {
      containerElement = container
    }
  }

  const target = containerElement || document.body

  if (enable) {
    target.classList.add('print-preview-mode')
  } else {
    target.classList.remove('print-preview-mode')
  }
}

/**
 * Creates a print-ready version of the resume by cloning and styling it.
 * Returns the cloned element which can be used for custom print workflows.
 * 
 * @param container - Source container element or selector
 * @param theme - Optional theme to apply
 * @returns Cloned and styled resume element
 */
export function createPrintReadyClone(
  container: HTMLElement | string,
  theme?: string,
): HTMLElement | null {
  if (typeof document === 'undefined') return null

  let sourceElement: HTMLElement | null = null
  if (typeof container === 'string') {
    sourceElement = document.querySelector(container)
  } else {
    sourceElement = container
  }

  if (!sourceElement) {
    console.warn('Source container not found')
    return null
  }

  // Clone the element
  const clone = sourceElement.cloneNode(true) as HTMLElement

  // Apply print-specific styles
  clone.style.width = '210mm'
  clone.style.minHeight = '297mm'
  clone.style.margin = '0'
  clone.style.padding = '15mm'
  clone.style.background = 'white'
  clone.style.boxShadow = 'none'

  // Apply theme if specified
  if (theme && ['professional', 'creative', 'minimalist'].includes(theme)) {
    clone.classList.add(`resume-theme-${theme}`)
    clone.setAttribute('data-resume-theme', theme)
  }

  return clone
}

// ============================================================================
// Auto-injection helper
// ============================================================================

/**
 * Initialize all print-related styles and utilities.
 * Call this once during application startup.
 */
export function initializePrintSupport(): void {
  injectPrintStyles()
  injectThemeStyles()
}
