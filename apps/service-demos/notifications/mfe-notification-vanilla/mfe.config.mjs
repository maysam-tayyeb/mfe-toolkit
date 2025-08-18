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