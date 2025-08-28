/**
 * MFE Development Configuration for Trading Terminal
 * Using @mfe-toolkit/dev for standalone development
 */

export default {
  dev: {
    // Custom port for trading terminal
    port: 5174,

    // Load design system CSS from served dist
    styles: [
      // Load from the served dist folder (requires pnpm serve running on port 8080)
      'http://localhost:8080/design-system/styles.css',
    ],

    // Configure import map for Vue and dependencies
    importMap: {
      'vue@3': 'https://esm.sh/vue@3.4.0',
      'vue@3/dist/vue.esm-bundler': 'https://esm.sh/vue@3.4.0/dist/vue.esm-bundler',
      '@vue/runtime-dom': 'https://esm.sh/@vue/runtime-dom@3.4.0',
      '@vue/runtime-core': 'https://esm.sh/@vue/runtime-core@3.4.0',
      '@vue/shared': 'https://esm.sh/@vue/shared@3.4.0',
      '@vue/reactivity': 'https://esm.sh/@vue/reactivity@3.4.0',
      '@mfe-toolkit/core@0': '/node_modules/@mfe-toolkit/core/dist/index.js',
    },

    // Configure viewport for trading interface
    viewport: {
      default: 'desktop', // Trading terminal needs desktop view by default

      // Add custom viewport presets for trading scenarios
      presets: [
        { name: 'Trading Desktop', width: 1440, height: 900, icon: '💹' },
        { name: 'Trading Tablet', width: 1024, height: 768, icon: '📱' },
        { name: 'Order Widget', width: 400, height: 600, icon: '📊' },
        { name: 'Portfolio Panel', width: 350, height: '100vh', icon: '💼' },
      ],
    },

    // Theme configuration for testing
    themes: {
      default: 'light',
      themes: [
        {
          name: 'trading-dark',
          displayName: 'Trading Dark',
          variables: {
            '--primary-color': '#00d4aa',
            '--bg-primary': '#0a0e27',
            '--bg-secondary': '#151932',
            '--text-primary': '#e4e4e7',
            '--text-secondary': '#a1a1aa',
            '--border-color': '#27293d',
            '--success-color': '#00d4aa',
            '--danger-color': '#ff3860',
            '--warning-color': '#ffdd57',
          },
        },
        {
          name: 'trading-light',
          displayName: 'Trading Light',
          variables: {
            '--primary-color': '#0066ff',
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f8fafc',
            '--text-primary': '#0f172a',
            '--text-secondary': '#64748b',
            '--border-color': '#e2e8f0',
            '--success-color': '#10b981',
            '--danger-color': '#ef4444',
            '--warning-color': '#f59e0b',
          },
        },
      ],
    },

    // Additional HTML for trading terminal
    headHtml: `
      <meta name="description" content="Trading Terminal MFE - Vue 3">
      <script>
        // Define Vue devtools global to prevent errors
        window.__VUE_PROD_DEVTOOLS__ = false;
      </script>
      <style>
        /* Trading-specific overrides */
        body {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
        }
        
        /* Price indicators */
        .price-up { color: var(--success-color, #00d4aa); }
        .price-down { color: var(--danger-color, #ff3860); }
        .price-unchanged { color: var(--text-secondary, #a1a1aa); }
        
        /* Trading grid layout */
        .trading-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr 2fr 1fr;
          grid-template-areas:
            "orderbook chart portfolio"
            "orderbook chart orders";
          height: 100%;
        }
        
        @media (max-width: 1024px) {
          .trading-grid {
            grid-template-columns: 1fr;
            grid-template-areas:
              "chart"
              "orderbook"
              "portfolio"
              "orders";
          }
        }
      </style>
    `,

    // Initialize mock data for trading
    bodyHtml: `
      <script>
        // Mock market data for development
        window.__TRADING_MOCK_DATA__ = {
          stocks: [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34, changePercent: 1.35 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.69, change: -1.23, changePercent: -0.87 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 5.67, changePercent: 1.52 },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.64, change: -3.45, changePercent: -1.40 },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.32, change: 0.89, changePercent: 0.62 }
          ],
          portfolio: {
            totalValue: 125000,
            dayChange: 1250,
            positions: [
              { symbol: 'AAPL', shares: 100, avgPrice: 165.00 },
              { symbol: 'MSFT', shares: 50, avgPrice: 350.00 },
              { symbol: 'GOOGL', shares: 75, avgPrice: 135.00 }
            ]
          }
        };
        
        // Simulate real-time price updates
        setInterval(() => {
          const stocks = window.__TRADING_MOCK_DATA__.stocks;
          const randomStock = stocks[Math.floor(Math.random() * stocks.length)];
          const priceChange = (Math.random() - 0.5) * 2;
          
          randomStock.price += priceChange;
          randomStock.change += priceChange;
          randomStock.changePercent = (randomStock.change / randomStock.price) * 100;
          
          // Emit market update event
          window.dispatchEvent(new CustomEvent('market:price-update', {
            detail: {
              symbol: randomStock.symbol,
              price: randomStock.price,
              change: randomStock.change,
              changePercent: randomStock.changePercent,
              timestamp: new Date().toISOString()
            }
          }));
        }, 3000); // Update every 3 seconds
        
        console.log('[Trading Terminal] Mock market data initialized');
      </script>
    `,
  },
};
