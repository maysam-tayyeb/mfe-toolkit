/**
 * MFE Development Configuration
 * This file configures the standalone development server
 */
export default {
  dev: {
    // Load our design system CSS
    styles: [
      '../../../../packages/design-system/dist/styles.css'
    ],
    
    // Viewport configuration for container simulation
    viewport: {
      // Default viewport on load (options: mobile, tablet, desktop, wide, fullscreen, sidebar, widget, modal, custom)
      default: 'desktop',
      
      // Custom viewport when default is 'custom'
      // custom: {
      //   width: 800,
      //   height: 600,
      //   name: 'Custom Dashboard'
      // },
      
      // Add project-specific viewport presets
      // presets: [
      //   { name: 'Dashboard Widget', width: 450, height: 350, icon: '📊' },
      //   { name: 'Notification Panel', width: 380, height: 500, icon: '🔔' }
      // ]
    }
    
    // Optional: Add import maps for any JS modules
    // importMap: {
    //   '@mfe/design-system': '../../../../packages/design-system/dist/index.js'
    // },
    
    // Optional: Custom port (default is 3100)
    // port: 3100,
    
    // Optional: Additional HTML to inject
    // headHtml: '<link rel="icon" href="/favicon.ico">',
    // bodyHtml: '<script>console.log("Custom script")</script>'
  }
};