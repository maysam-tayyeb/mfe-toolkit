import express from 'express';
import cors from 'cors';
import { resolve, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import pc from 'picocolors';
import { loadConfig, resolvePath } from './config.js';

export interface ServerOptions {
  cwd?: string;
  port?: number;
}

export async function startDevServer(options: ServerOptions = {}) {
  const { cwd = process.cwd() } = options;
  
  // Load configuration
  const config = await loadConfig(cwd);
  const port = options.port || config?.dev?.port || 3100;
  
  const app = express();
  app.use(cors());
  
  // Serve the built MFE files
  const distPath = resolve(cwd, 'dist');
  app.use('/dist', express.static(distPath));
  
  // Serve node_modules for design system files
  const nodeModulesPath = resolve(cwd, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    app.use('/node_modules', express.static(nodeModulesPath));
  }
  
  // Serve workspace root for monorepo packages
  const workspaceRoot = resolve(cwd, '../../../..');
  if (existsSync(workspaceRoot)) {
    app.use('/workspace', express.static(workspaceRoot));
  }
  
  // Get MFE name from package.json
  const packageJson = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf-8'));
  const mfeName = packageJson.name?.split('/').pop() || 'mfe';
  
  // Serve the development container HTML
  app.get('/', async (req, res) => {
    // Prepare style links
    const styleLinks = config?.dev?.styles?.map(stylePath => {
      // If it's a relative path to workspace, convert to workspace URL
      if (stylePath.startsWith('../')) {
        // Remove leading ../ segments and use workspace route
        const cleanPath = stylePath.replace(/^(\.\.\/)+/, '');
        return `<link rel="stylesheet" href="/workspace/${cleanPath}">`;
      } else if (stylePath.includes('node_modules')) {
        // For node_modules paths
        return `<link rel="stylesheet" href="/node_modules/${stylePath.split('node_modules/')[1]}">`;
      }
      // For absolute URLs or other paths
      return `<link rel="stylesheet" href="${stylePath}">`;
    }).join('\n    ') || '';
    
    // Prepare script tags
    const scriptTags = config?.dev?.scripts?.map(scriptPath => {
      // If it's a relative path to workspace, convert to workspace URL
      if (scriptPath.startsWith('../')) {
        // Remove leading ../ segments and use workspace route
        const cleanPath = scriptPath.replace(/^(\.\.\/)+/, '');
        return `<script src="/workspace/${cleanPath}"></script>`;
      } else if (scriptPath.includes('node_modules')) {
        // For node_modules paths
        return `<script src="/node_modules/${scriptPath.split('node_modules/')[1]}"></script>`;
      }
      // For absolute URLs or other paths
      return `<script src="${scriptPath}"></script>`;
    }).join('\n    ') || '';
    
    // Prepare import map
    const importMapScript = config?.dev?.importMap ? `
  <script type="importmap">
  {
    "imports": ${JSON.stringify(config.dev.importMap, null, 2)}
  }
  </script>` : '';
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mfeName} - Development</title>
  ${styleLinks}
  ${importMapScript}
  ${config?.dev?.headHtml || ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    #root { 
      min-height: 100vh;
      background: white;
      margin: 0 auto;
      max-width: 1400px;
    }
    .dev-banner {
      background: #1e293b;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 14px;
    }
    
    /* Dev Tools Panel */
    #devtools {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      flex-direction: column;
    }
    
    #devtools.minimized {
      height: auto;
      max-height: none;
    }
    
    #devtools.minimized .devtools-content {
      display: none;
    }
    
    .devtools-header {
      padding: 12px 16px;
      background: #1e293b;
      color: white;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
    }
    
    .devtools-title {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .devtools-minimize {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
      padding: 0 4px;
    }
    
    .devtools-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .devtools-tab {
      padding: 8px 16px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: #6b7280;
      border-bottom: 2px solid transparent;
    }
    
    .devtools-tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }
    
    .devtools-content {
      flex: 1;
      overflow: auto;
      padding: 16px;
    }
    
    .log-entry {
      padding: 4px 8px;
      margin: 2px 0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      word-break: break-all;
    }
    
    .log-debug { background: #f3f4f6; color: #6b7280; }
    .log-info { background: #dbeafe; color: #1e40af; }
    .log-warn { background: #fed7aa; color: #c2410c; }
    .log-error { background: #fee2e2; color: #b91c1c; }
    
    .event-entry {
      padding: 8px;
      margin: 4px 0;
      background: #f9fafb;
      border-radius: 4px;
      font-size: 12px;
      border-left: 3px solid #3b82f6;
    }
    
    .event-timestamp {
      font-size: 11px;
      color: #9ca3af;
      font-family: monospace;
    }
    
    .event-name {
      font-weight: 600;
      color: #1e293b;
      margin-top: 2px;
    }
    
    .event-data {
      color: #6b7280;
      margin-top: 4px;
      font-family: monospace;
      background: #ffffff;
      padding: 4px;
      border-radius: 2px;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 100px;
      overflow-y: auto;
    }
    
    .event-emitter {
      padding: 12px;
      background: #f3f4f6;
      border-radius: 6px;
      margin-bottom: 12px;
      border: 1px solid #e5e7eb;
    }
    
    .event-emitter-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #1e293b;
      font-size: 13px;
    }
    
    .event-emitter-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .event-emitter-row {
      display: flex;
      gap: 8px;
    }
    
    .event-emitter input[type="text"], 
    .event-emitter textarea {
      flex: 1;
      padding: 6px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
      font-family: inherit;
    }
    
    .event-emitter textarea {
      min-height: 60px;
      font-family: monospace;
      resize: vertical;
    }
    
    .event-emitter button {
      padding: 6px 12px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .event-emitter button:hover {
      background: #2563eb;
    }
    
    .event-presets {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    
    .event-preset {
      padding: 4px 8px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      color: #6b7280;
    }
    
    .event-preset:hover {
      background: #f9fafb;
      border-color: #3b82f6;
      color: #3b82f6;
    }
    
    .event-logs-container {
      flex: 1;
      overflow-y: auto;
      max-height: 250px;
      padding: 8px;
    }
    
    .event-clear-btn {
      position: absolute;
      top: 12px;
      right: 50px;
      padding: 4px 8px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }
    
    .event-clear-btn:hover {
      background: #dc2626;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .metric-card {
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
    }
    
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .metric-value {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="dev-banner">
    🚀 MFE Development Mode - ${mfeName} | Press Ctrl+Shift+D to toggle dev tools
  </div>
  <div id="root"></div>
  
  <!-- Dev Tools Panel -->
  <div id="devtools">
    <div class="devtools-header">
      <div class="devtools-title">
        🛠️ MFE Dev Tools
      </div>
      <button class="devtools-minimize" onclick="toggleDevTools()">－</button>
    </div>
    <div class="devtools-tabs">
      <button class="devtools-tab active" onclick="switchTab('console')">Console</button>
      <button class="devtools-tab" onclick="switchTab('events')">Events</button>
      <button class="devtools-tab" onclick="switchTab('metrics')">Metrics</button>
    </div>
    <div class="devtools-content" id="devtools-content">
      <div id="console-tab">
        <div id="console-logs"></div>
      </div>
      <div id="events-tab" style="display: none;">
        <button class="event-clear-btn" onclick="clearEvents()">Clear</button>
        <div class="event-emitter">
          <div class="event-emitter-title">Emit Event</div>
          <div class="event-emitter-form">
            <div class="event-emitter-row">
              <input type="text" id="event-name" placeholder="Event name (e.g., user:login)" />
            </div>
            <textarea id="event-data" placeholder='Event data (JSON format, e.g., {"userId": "123"})'>{}</textarea>
            <div class="event-emitter-row">
              <button onclick="emitCustomEvent()">Emit Event</button>
            </div>
            <div class="event-presets">
              <div class="event-preset" onclick="loadPreset('user:login', {userId: '123', timestamp: Date.now()})">user:login</div>
              <div class="event-preset" onclick="loadPreset('cart:add', {productId: 'ABC', quantity: 1})">cart:add</div>
              <div class="event-preset" onclick="loadPreset('navigation', {path: '/dashboard'})">navigation</div>
              <div class="event-preset" onclick="loadPreset('api:request', {method: 'GET', url: '/api/data'})">api:request</div>
            </div>
          </div>
        </div>
        <div class="event-logs-container">
          <div id="event-logs"></div>
        </div>
      </div>
      <div id="metrics-tab" style="display: none;">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Events Emitted</div>
            <div class="metric-value" id="metric-events">0</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Notifications</div>
            <div class="metric-value" id="metric-notifications">0</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Log Entries</div>
            <div class="metric-value" id="metric-logs">0</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Errors</div>
            <div class="metric-value" id="metric-errors">0</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <script type="module">
    // Dev Tools State
    let logs = [];
    let events = [];
    let metrics = {
      events: 0,
      notifications: 0,
      logs: 0,
      errors: 0
    };
    
    // Dev Tools Functions
    window.toggleDevTools = function() {
      const devtools = document.getElementById('devtools');
      devtools.classList.toggle('minimized');
    };
    
    window.switchTab = function(tab) {
      // Hide all tabs
      document.getElementById('console-tab').style.display = 'none';
      document.getElementById('events-tab').style.display = 'none';
      document.getElementById('metrics-tab').style.display = 'none';
      
      // Show selected tab
      document.getElementById(tab + '-tab').style.display = 'block';
      
      // Update active tab
      document.querySelectorAll('.devtools-tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
    };
    
    function addLog(level, message, ...args) {
      const entry = { level, message, args, timestamp: new Date() };
      logs.push(entry);
      metrics.logs++;
      if (level === 'error') metrics.errors++;
      
      // Update UI
      const logDiv = document.getElementById('console-logs');
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry log-' + level;
      logEntry.textContent = \`[\${entry.timestamp.toLocaleTimeString()}] [\${level.toUpperCase()}] \${message} \${args.join(' ')}\`;
      logDiv.appendChild(logEntry);
      
      // Auto-scroll
      logDiv.scrollTop = logDiv.scrollHeight;
      
      // Update metrics
      document.getElementById('metric-logs').textContent = metrics.logs;
      document.getElementById('metric-errors').textContent = metrics.errors;
    }
    
    function addEvent(eventName, data, source = 'MFE') {
      const entry = { eventName, data, timestamp: new Date(), source };
      events.push(entry);
      metrics.events++;
      
      // Update UI
      const eventDiv = document.getElementById('event-logs');
      const eventEntry = document.createElement('div');
      eventEntry.className = 'event-entry';
      
      const time = entry.timestamp.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3
      });
      
      const dataStr = data ? JSON.stringify(data, null, 2) : 'undefined';
      
      eventEntry.innerHTML = \`
        <div class="event-timestamp">[\${time}] [\${source}]</div>
        <div class="event-name">\${eventName}</div>
        \${dataStr !== 'undefined' ? \`<div class="event-data">\${dataStr}</div>\` : ''}
      \`;
      eventDiv.appendChild(eventEntry);
      
      // Auto-scroll
      const container = document.querySelector('.event-logs-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
      
      // Update metrics
      document.getElementById('metric-events').textContent = metrics.events;
    }
    
    // Event emitter functions
    window.emitCustomEvent = function() {
      const eventName = document.getElementById('event-name').value;
      const eventDataStr = document.getElementById('event-data').value;
      
      if (!eventName) {
        alert('Please enter an event name');
        return;
      }
      
      let eventData;
      try {
        eventData = eventDataStr ? JSON.parse(eventDataStr) : undefined;
      } catch (e) {
        alert('Invalid JSON format in event data');
        return;
      }
      
      // Emit the event directly
      console.log('[EventBus] Emit:', eventName, eventData);
      addEvent(eventName, eventData, 'DevTools');
      window.dispatchEvent(new CustomEvent('mfe-event', { detail: { event: eventName, data: eventData } }));
    };
    
    window.loadPreset = function(eventName, eventData) {
      document.getElementById('event-name').value = eventName;
      document.getElementById('event-data').value = JSON.stringify(eventData, null, 2);
    };
    
    window.clearEvents = function() {
      events = [];
      metrics.events = 0;
      document.getElementById('event-logs').innerHTML = '';
      document.getElementById('metric-events').textContent = '0';
    };
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDevTools();
      }
    });
    
    // Import and initialize the MFE with mock services
    import mfeModule from '/dist/${mfeName}.js';
    
    // Create mock services with dev tools integration
    const mockServices = {
      logger: {
        debug: (...args) => {
          console.log('[DEBUG]', ...args);
          addLog('debug', args.join(' '));
        },
        info: (...args) => {
          console.log('[INFO]', ...args);
          addLog('info', args.join(' '));
        },
        warn: (...args) => {
          console.warn('[WARN]', ...args);
          addLog('warn', args.join(' '));
        },
        error: (...args) => {
          console.error('[ERROR]', ...args);
          addLog('error', args.join(' '));
        }
      },
      eventBus: {
        emit: (event, data) => {
          console.log('[EventBus] Emit:', event, data);
          addEvent(event, data);
          window.dispatchEvent(new CustomEvent('mfe-event', { detail: { event, data } }));
        },
        on: (event, handler) => {
          const listener = (e) => {
            if (e.detail.event === event) {
              handler(e.detail.data);
            }
          };
          window.addEventListener('mfe-event', listener);
          return () => window.removeEventListener('mfe-event', listener);
        },
        off: () => {}
      },
      notification: {
        show: (options) => {
          console.log('[Notification]', options.type || 'info', options.title);
          metrics.notifications++;
          document.getElementById('metric-notifications').textContent = metrics.notifications;
          // Simple notification display
          const notification = document.createElement('div');
          notification.style.cssText = \`
            position: fixed;
            top: 60px;
            right: 20px;
            background: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 300px;
          \`;
          notification.innerHTML = \`
            <div style="font-weight: bold; margin-bottom: 4px;">\${options.title}</div>
            <div style="color: #666;">\${options.message}</div>
          \`;
          document.body.appendChild(notification);
          
          if (options.duration !== 0) {
            setTimeout(() => notification.remove(), options.duration || 3000);
          }
        },
        success: (title, message) => mockServices.notification.show({ title, message, type: 'success' }),
        error: (title, message) => mockServices.notification.show({ title, message, type: 'error' }),
        warning: (title, message) => mockServices.notification.show({ title, message, type: 'warning' }),
        info: (title, message) => mockServices.notification.show({ title, message, type: 'info' }),
        clear: () => {
          document.querySelectorAll('[data-notification]').forEach(n => n.remove());
        }
      },
      modal: {
        open: (options) => {
          console.log('[Modal] Open:', options.title);
          alert(options.content);
        },
        close: () => console.log('[Modal] Close')
      },
      auth: {
        getUser: () => ({ id: 'dev-user', name: 'Developer', email: 'dev@example.com' }),
        isAuthenticated: () => true,
        hasPermission: () => true,
        hasRole: () => true
      }
    };
    
    // Initialize the MFE
    const rootElement = document.getElementById('root');
    
    if (typeof mfeModule === 'function') {
      // It's a function that expects services
      const mfe = mfeModule(mockServices);
      if (mfe && mfe.mount) {
        mfe.mount(rootElement);
      }
    } else if (mfeModule.mount) {
      // It's an MFEModule
      const container = {
        getAllServices: () => mockServices,
        getService: (name) => mockServices[name]
      };
      mfeModule.mount(rootElement, container);
    }
    
    console.log('✅ MFE loaded with mock services');
  </script>
  ${scriptTags}
  ${config?.dev?.bodyHtml || ''}
</body>
</html>
    `;
    
    res.type('html').send(html);
  });
  
  const server = app.listen(port, () => {
    console.log(pc.green(`\n✨ Development server running at ${pc.bold(`http://localhost:${port}`)}\n`));
    console.log(pc.gray('Press Ctrl+C to stop\n'));
  });
  
  return server;
}