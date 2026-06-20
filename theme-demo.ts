/**
 * Theme Switcher Demo for Resume Builder
 * 
 * This example demonstrates how to use the ThemeSwitcher class
 * to dynamically switch between Professional, Creative, and Minimalist themes.
 */

import { renderResume, buildThemeLayoutConfig, DEFAULT_LAYOUT_CONFIG } from './resume-builder'
import { 
  createThemeSwitcher, 
  THEME_CONFIGS, 
  type ResumeThemeName,
  injectThemeStyles,
  applyTheme,
} from './resume-themes'
import type { ResumeData } from './resume-builder'

// ============================================================================
// Sample Resume Data
// ============================================================================

const sampleResume: ResumeData = {
  name: 'Alex Johnson',
  contact: {
    email: 'alex.johnson@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://alexjohnson.dev',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexjohnson',
  },
  summary: 'Full-stack developer with 8+ years of experience building scalable web applications and leading engineering teams.',
  experience: [
    {
      company: 'TechCorp Inc.',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2020-01',
      current: true,
      highlights: [
        'Led migration of monolithic architecture to microservices, reducing deployment time by 60%',
        'Mentored team of 5 junior developers, conducting code reviews and career development sessions',
        'Implemented CI/CD pipeline that reduced production bugs by 40%',
      ],
    },
    {
      company: 'StartupXYZ',
      position: 'Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2017-06',
      endDate: '2019-12',
      highlights: [
        'Built real-time analytics dashboard serving 100K+ daily active users',
        'Optimized database queries reducing API response time by 50%',
        'Collaborated with design team to implement responsive UI components',
      ],
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      location: 'Berkeley, CA',
      startDate: '2013-09',
      endDate: '2017-05',
      gpa: '3.8',
      highlights: [
        'Dean\'s List all semesters',
        'Teaching Assistant for Data Structures course',
      ],
    },
  ],
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'PostgreSQL',
    'AWS',
    'Docker',
    'GraphQL',
  ],
}

// ============================================================================
// Example 1: Basic Theme Switching with ThemeSwitcher Class
// ============================================================================

export function demoBasicThemeSwitcher(): void {
  console.log('=== Basic Theme Switcher Demo ===\n')
  
  // Create theme switcher (auto-initializes with Professional theme)
  const switcher = createThemeSwitcher()
  
  // Subscribe to theme changes
  const unsubscribe = switcher.onThemeChange((theme) => {
    console.log(`Theme changed to: ${theme}`)
  })
  
  // Render with current theme
  let blocks = renderResume(sampleResume, {
    ...DEFAULT_LAYOUT_CONFIG,
    theme: switcher.getTheme(),
  })
  console.log(`Rendered ${blocks.length} blocks with ${switcher.getTheme()} theme\n`)
  
  // Toggle to Creative theme
  switcher.switchTheme('creative')
  blocks = renderResume(sampleResume, {
    ...DEFAULT_LAYOUT_CONFIG,
    theme: 'creative',
  })
  console.log(`Rendered ${blocks.length} blocks with creative theme\n`)
  
  // Cycle through all themes
  switcher.cycleTheme() // Now minimalist
  console.log(`Current theme: ${switcher.getTheme()}\n`)
  
  // Cleanup
  unsubscribe()
}

// ============================================================================
// Example 2: Using Theme Configurations Directly
// ============================================================================

export function demoDirectThemeConfig(): void {
  console.log('=== Direct Theme Configuration Demo ===\n')
  
  // Get Creative theme config
  const creativeConfig = THEME_CONFIGS.creative
  
  // Build layout config from theme
  const layoutConfig = buildThemeLayoutConfig(creativeConfig)
  
  console.log('Creative Theme Layout Config:')
  console.log(`  Name Font: ${layoutConfig.nameFont}`)
  console.log(`  Section Spacing: ${layoutConfig.sectionSpacing}px`)
  console.log(`  Entry Spacing: ${layoutConfig.entrySpacing}px`)
  console.log(`  Highlight Indent: ${layoutConfig.highlightIndent}px\n`)
  
  // Render with theme config
  const blocks = renderResume(sampleResume, layoutConfig)
  console.log(`Rendered ${blocks.length} blocks with direct theme config\n`)
}

// ============================================================================
// Example 3: Dynamic Theme Switching in Rendering Flow
// ============================================================================

export function demoDynamicThemeSwitching(): void {
  console.log('=== Dynamic Theme Switching Demo ===\n')
  
  const themes: ResumeThemeName[] = ['professional', 'creative', 'minimalist']
  
  for (const theme of themes) {
    console.log(`Rendering with ${theme.toUpperCase()} theme:`)
    
    const blocks = renderResume(sampleResume, {
      ...DEFAULT_LAYOUT_CONFIG,
      theme: theme,
    })
    
    console.log(`  - Total blocks: ${blocks.length}`)
    console.log(`  - First block Y: ${blocks[0]?.y}px`)
    console.log(`  - Last block Y: ${blocks[blocks.length - 1]?.y}px\n`)
  }
}

// ============================================================================
// Example 4: Custom Theme Overrides
// ============================================================================

export function demoCustomThemeOverride(): void {
  console.log('=== Custom Theme Override Demo ===\n')
  
  // Start with professional theme
  const baseConfig = THEME_CONFIGS.professional
  
  // Override specific properties
  const customConfig = {
    ...baseConfig,
    accentColor: '#10b981', // Emerald green
    sectionSpacing: 28,
    entrySpacing: 16,
    nameFontSize: '32px',
  }
  
  const layoutConfig = buildThemeLayoutConfig(customConfig)
  
  console.log('Custom Theme Overrides:')
  console.log(`  Accent Color: ${customConfig.accentColor}`)
  console.log(`  Section Spacing: ${customConfig.sectionSpacing}px`)
  console.log(`  Name Font Size: ${customConfig.nameFontSize}\n`)
  
  const blocks = renderResume(sampleResume, layoutConfig)
  console.log(`Rendered ${blocks.length} blocks with custom theme\n`)
}

// ============================================================================
// Example 5: Browser-based Theme Switching (for React/Vue/etc.)
// ============================================================================

/**
 * Example hook/component pattern for framework integration
 * This would be used in a browser environment
 */
export class ResumeViewerWithTheme {
  private switcher: ReturnType<typeof createThemeSwitcher>
  private container: HTMLElement | null = null
  private currentBlocks: any[] = []
  
  constructor(containerId?: string) {
    if (typeof document !== 'undefined' && containerId) {
      this.container = document.getElementById(containerId)
    }
    this.switcher = createThemeSwitcher(this.container || undefined)
  }
  
  /**
   * Set resume data and render with current theme
   */
  setResumeData(data: ResumeData): void {
    this.currentBlocks = renderResume(data, {
      ...DEFAULT_LAYOUT_CONFIG,
      theme: this.switcher.getTheme(),
    })
    this.render()
  }
  
  /**
   * Switch theme and re-render
   */
  switchTheme(theme: ResumeThemeName): void {
    this.switcher.switchTheme(theme)
    // Re-render with new theme
    this.currentBlocks = renderResume(
      // In real app, you'd store the resume data
      sampleResume,
      {
        ...DEFAULT_LAYOUT_CONFIG,
        theme: this.switcher.getTheme(),
      }
    )
    this.render()
  }
  
  /**
   * Toggle between Professional and Creative
   */
  toggleTheme(): void {
    this.switcher.togglePrimaryThemes()
    this.render()
  }
  
  /**
   * Render blocks to DOM (placeholder - actual implementation depends on your rendering pipeline)
   */
  private render(): void {
    console.log(`Rendering ${this.currentBlocks.length} blocks`)
    // In a real implementation, you would:
    // 1. Clear container
    // 2. Create elements for each block
    // 3. Position them based on x/y coordinates
    // 4. Apply CSS variables from current theme
  }
  
  /**
   * Get current theme
   */
  getCurrentTheme(): ResumeThemeName {
    return this.switcher.getTheme()
  }
  
  /**
   * Subscribe to theme changes
   */
  onThemeChange(callback: (theme: ResumeThemeName) => void): () => void {
    return this.switcher.onThemeChange(callback)
  }
}

// ============================================================================
// Run Demos (Browser-safe environment check)
// ============================================================================

/**
 * Check if running in Node.js environment and execute demos
 * This uses a type-safe approach that works without @types/node
 */
function runDemosIfNode(): void {
  // Type-safe check for Node.js environment
  const globalObj = typeof globalThis !== 'undefined' ? globalThis : window as any
  
  if (globalObj.process?.versions?.node && globalObj.require?.main === globalObj.module) {
    console.log('Running Resume Theme Switcher Demos\n')
    console.log('='.repeat(50))
    console.log()
    
    demoBasicThemeSwitcher()
    console.log('='.repeat(50))
    console.log()
    
    demoDirectThemeConfig()
    console.log('='.repeat(50))
    console.log()
    
    demoDynamicThemeSwitching()
    console.log('='.repeat(50))
    console.log()
    
    demoCustomThemeOverride()
    console.log('='.repeat(50))
    console.log()
    
    console.log('All demos completed!')
  }
}

// Execute if in Node.js
runDemosIfNode()

// Export for use in other modules
export { sampleResume }
