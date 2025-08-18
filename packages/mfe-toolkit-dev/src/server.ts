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
      background: white;
      margin: 0 auto;
      transition: all 0.3s ease;
    }
    
    /* Viewport container styles */
    #root.viewport-container {
      width: var(--viewport-width, 100%);
      height: var(--viewport-height, 100vh);
      max-width: 100vw;
      max-height: 100vh;
      margin: 20px auto;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      overflow: auto;
      position: relative;
    }
    
    #root.viewport-fullscreen {
      width: 100%;
      height: 100vh;
      margin: 0;
      box-shadow: none;
    }
    
    /* Viewport size indicator */
    .viewport-indicator {
      position: fixed;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(30, 41, 59, 0.9);
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .viewport-indicator.visible {
      opacity: 1;
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
      width: 450px;
      height: 400px;
      min-width: 350px;
      min-height: 200px;
      max-width: 90vw;
      max-height: 80vh;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      resize: both;
      overflow: auto;
    }
    
    #devtools.dragging {
      opacity: 0.9;
      cursor: move;
      user-select: none;
    }
    
    /* Resize handle styling */
    #devtools::-webkit-resizer {
      background: transparent;
    }
    
    .devtools-resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      cursor: nwse-resize;
      z-index: 1;
    }
    
    .devtools-resize-handle::after {
      content: '';
      position: absolute;
      bottom: 3px;
      right: 3px;
      width: 5px;
      height: 5px;
      border-right: 2px solid #9ca3af;
      border-bottom: 2px solid #9ca3af;
    }
    
    #devtools.minimized {
      display: none !important;
    }
    
    /* Floating restore button */
    #devtools-restore-btn {
      display: none;
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #1e293b;
      color: white;
      border: none;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 10001;
      font-size: 20px;
      transition: transform 0.2s, background 0.2s;
    }
    
    #devtools-restore-btn:hover {
      transform: scale(1.1);
      background: #334155;
    }
    
    #devtools-restore-btn.visible {
      display: flex;
      align-items: center;
      justify-content: center;
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
      user-select: none;
    }
    
    .devtools-header:active {
      cursor: grabbing;
    }
    
    .devtools-title {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .devtools-controls {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    .devtools-control-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 16px;
      padding: 2px 6px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .devtools-control-btn:hover {
      background: rgba(255, 255, 255, 0.1);
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
    
    /* Viewport Controls */
    .viewport-controls {
      padding: 12px;
    }
    
    .viewport-presets {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .viewport-preset-btn {
      padding: 8px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      font-size: 12px;
    }
    
    .viewport-preset-btn:hover {
      background: #f3f4f6;
      border-color: #3b82f6;
    }
    
    .viewport-preset-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    
    .viewport-preset-icon {
      font-size: 20px;
      display: block;
      margin-bottom: 4px;
    }
    
    .viewport-custom-controls {
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      margin-top: 12px;
    }
    
    .viewport-input-group {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .viewport-input-group label {
      font-size: 12px;
      color: #6b7280;
      width: 50px;
    }
    
    .viewport-input-group input {
      flex: 1;
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .viewport-input-group select {
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
      background: white;
    }
    
    .viewport-current {
      margin-top: 12px;
      padding: 8px;
      background: #1e293b;
      color: white;
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="dev-banner">
    🚀 MFE Development Mode - ${mfeName} | Press Ctrl+Shift+D to toggle dev tools
  </div>
  <div class="viewport-indicator" id="viewport-indicator"></div>
  <div id="root" class="viewport-fullscreen"></div>
  
  <!-- Floating Restore Button -->
  <button id="devtools-restore-btn" onclick="toggleDevTools()" title="Open Dev Tools">🛠️</button>
  
  <!-- Dev Tools Panel -->
  <div id="devtools">
    <div class="devtools-header">
      <div class="devtools-title">
        🛠️ MFE Dev Tools
      </div>
      <div class="devtools-controls">
        <button class="devtools-control-btn" onclick="toggleDevTools()" title="Minimize">－</button>
      </div>
    </div>
    <div class="devtools-tabs">
      <button class="devtools-tab active" onclick="switchTab('console')">Console</button>
      <button class="devtools-tab" onclick="switchTab('events')">Events</button>
      <button class="devtools-tab" onclick="switchTab('metrics')">Metrics</button>
      <button class="devtools-tab" onclick="switchTab('viewport')">Viewport</button>
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
      <div id="viewport-tab" style="display: none;">
        <div class="viewport-controls">
          <div class="viewport-presets" id="viewport-presets">
            <!-- Preset buttons will be added dynamically -->
          </div>
          
          <div class="viewport-custom-controls">
            <div class="viewport-input-group">
              <label>Width:</label>
              <input type="text" id="viewport-width" placeholder="e.g., 1280 or 100%">
              <select id="viewport-width-unit">
                <option value="px">px</option>
                <option value="%">%</option>
                <option value="vw">vw</option>
              </select>
            </div>
            <div class="viewport-input-group">
              <label>Height:</label>
              <input type="text" id="viewport-height" placeholder="e.g., 720 or 100vh">
              <select id="viewport-height-unit">
                <option value="px">px</option>
                <option value="%">%</option>
                <option value="vh">vh</option>
              </select>
            </div>
            <div class="viewport-input-group">
              <button onclick="applyCustomViewport()" style="flex: 1; padding: 6px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Apply Custom Size
              </button>
            </div>
          </div>
          
          <div class="viewport-current" id="viewport-current">
            Current: Fullscreen
          </div>
        </div>
      </div>
    </div>
    <div class="devtools-resize-handle"></div>
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
      const restoreBtn = document.getElementById('devtools-restore-btn');
      const isMinimized = devtools.classList.contains('minimized');
      
      if (isMinimized) {
        // Restore previous state
        devtools.classList.remove('minimized');
        restoreBtn.classList.remove('visible');
      } else {
        // Minimize - hide panel and show floating button
        devtools.classList.add('minimized');
        restoreBtn.classList.add('visible');
      }
      
      // Save state
      saveDevToolsState();
    };
    
    window.switchTab = function(tab) {
      // Hide all tabs
      document.getElementById('console-tab').style.display = 'none';
      document.getElementById('events-tab').style.display = 'none';
      document.getElementById('metrics-tab').style.display = 'none';
      document.getElementById('viewport-tab').style.display = 'none';
      
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
    
    // Drag functionality
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    const devtools = document.getElementById('devtools');
    const header = devtools.querySelector('.devtools-header');
    
    header.addEventListener('mousedown', (e) => {
      // Don't drag if clicking on controls
      if (e.target.classList.contains('devtools-control-btn')) return;
      
      isDragging = true;
      devtools.classList.add('dragging');
      
      const rect = devtools.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - devtools.offsetWidth;
      const maxY = window.innerHeight - devtools.offsetHeight;
      
      const finalX = Math.max(0, Math.min(x, maxX));
      const finalY = Math.max(0, Math.min(y, maxY));
      
      devtools.style.left = finalX + 'px';
      devtools.style.top = finalY + 'px';
      devtools.style.right = 'auto';
      devtools.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        devtools.classList.remove('dragging');
      }
    });
    
    
    // Save and restore position/size
    const saveDevToolsState = () => {
      const rect = devtools.getBoundingClientRect();
      const isMinimized = devtools.classList.contains('minimized');
      const state = {
        left: rect.left,
        top: rect.top,
        width: devtools.style.width || devtools.offsetWidth,
        height: devtools.style.height || devtools.offsetHeight,
        minimized: isMinimized
      };
      
      localStorage.setItem('devtools-state', JSON.stringify(state));
    };
    
    const restoreDevToolsState = () => {
      const saved = localStorage.getItem('devtools-state');
      const restoreBtn = document.getElementById('devtools-restore-btn');
      
      if (saved) {
        try {
          const state = JSON.parse(saved);
          
          // Restore minimized state first
          if (state.minimized) {
            devtools.classList.add('minimized');
            restoreBtn.classList.add('visible');
          } else {
            // Restore position and size
            devtools.style.left = state.left + 'px';
            devtools.style.top = state.top + 'px';
            devtools.style.width = state.width + (typeof state.width === 'number' ? 'px' : '');
            devtools.style.height = state.height + (typeof state.height === 'number' ? 'px' : '');
            devtools.style.right = 'auto';
            devtools.style.bottom = 'auto';
          }
        } catch (e) {
          // Invalid state, ignore
        }
      }
    };
    
    // Restore on load
    restoreDevToolsState();
    
    // Save on changes
    const observer = new MutationObserver(saveDevToolsState);
    observer.observe(devtools, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
    
    // Also save on resize
    devtools.addEventListener('mouseup', saveDevToolsState);
    
    // Viewport functionality
    const defaultPresets = [
      { name: 'Mobile', width: 375, height: 667, icon: '📱' },
      { name: 'Tablet', width: 768, height: 1024, icon: '📱' },
      { name: 'Desktop', width: 1280, height: 720, icon: '🖥️' },
      { name: 'Wide', width: 1920, height: 1080, icon: '🖥️' },
      { name: 'Fullscreen', width: '100%', height: '100vh', icon: '⛶' },
      { name: 'Sidebar', width: 350, height: '100vh', icon: '📑' },
      { name: 'Widget', width: 400, height: 300, icon: '◻' },
      { name: 'Modal', width: 600, height: 400, icon: '🗗' }
    ];
    
    // Merge with config presets
    const configViewport = ${JSON.stringify(config?.dev?.viewport || {})};
    const allPresets = [...defaultPresets, ...(configViewport.presets || [])];
    let currentViewport = configViewport.default || 'fullscreen';
    
    // Initialize viewport presets
    const viewportPresetsContainer = document.getElementById('viewport-presets');
    allPresets.forEach(preset => {
      const btn = document.createElement('button');
      btn.className = 'viewport-preset-btn';
      btn.onclick = () => applyViewportPreset(preset);
      btn.innerHTML = \`
        <span class="viewport-preset-icon">\${preset.icon || '📐'}</span>
        <div>\${preset.name}</div>
        <div style="font-size: 10px; opacity: 0.7;">\${formatViewportSize(preset.width, preset.height)}</div>
      \`;
      viewportPresetsContainer.appendChild(btn);
    });
    
    function formatViewportSize(width, height) {
      const w = typeof width === 'number' ? \`\${width}px\` : width;
      const h = typeof height === 'number' ? \`\${height}px\` : height;
      return \`\${w} × \${h}\`;
    }
    
    function applyViewportPreset(preset) {
      const root = document.getElementById('root');
      const indicator = document.getElementById('viewport-indicator');
      
      // Update active button
      document.querySelectorAll('.viewport-preset-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(preset.name)) {
          btn.classList.add('active');
        }
      });
      
      // Apply viewport size
      if (preset.name === 'Fullscreen') {
        root.className = 'viewport-fullscreen';
        document.documentElement.style.removeProperty('--viewport-width');
        document.documentElement.style.removeProperty('--viewport-height');
      } else {
        root.className = 'viewport-container';
        const width = typeof preset.width === 'number' ? \`\${preset.width}px\` : preset.width;
        const height = typeof preset.height === 'number' ? \`\${preset.height}px\` : preset.height;
        document.documentElement.style.setProperty('--viewport-width', width);
        document.documentElement.style.setProperty('--viewport-height', height);
      }
      
      // Update current display
      document.getElementById('viewport-current').textContent = 
        \`Current: \${preset.name} (\${formatViewportSize(preset.width, preset.height)})\`;
      
      // Show indicator briefly
      indicator.textContent = \`\${preset.name}: \${formatViewportSize(preset.width, preset.height)}\`;
      indicator.classList.add('visible');
      setTimeout(() => indicator.classList.remove('visible'), 2000);
      
      // Save to localStorage
      localStorage.setItem('devtools-viewport', JSON.stringify({
        name: preset.name,
        width: preset.width,
        height: preset.height
      }));
    }
    
    window.applyCustomViewport = function() {
      const widthInput = document.getElementById('viewport-width');
      const heightInput = document.getElementById('viewport-height');
      const widthUnit = document.getElementById('viewport-width-unit').value;
      const heightUnit = document.getElementById('viewport-height-unit').value;
      
      if (!widthInput.value || !heightInput.value) {
        alert('Please enter both width and height values');
        return;
      }
      
      const width = widthInput.value + widthUnit;
      const height = heightInput.value + heightUnit;
      
      applyViewportPreset({
        name: 'Custom',
        width: width,
        height: height
      });
    };
    
    // Load saved viewport or apply default
    const savedViewport = localStorage.getItem('devtools-viewport');
    if (savedViewport) {
      try {
        const viewport = JSON.parse(savedViewport);
        applyViewportPreset(viewport);
      } catch (e) {
        // Apply default from config
        if (currentViewport === 'custom' && configViewport.custom) {
          applyViewportPreset({
            name: configViewport.custom.name || 'Custom',
            width: configViewport.custom.width,
            height: configViewport.custom.height
          });
        } else {
          const defaultPreset = allPresets.find(p => 
            p.name.toLowerCase() === currentViewport.toLowerCase()
          ) || allPresets.find(p => p.name === 'Fullscreen');
          if (defaultPreset) {
            applyViewportPreset(defaultPreset);
          }
        }
      }
    } else {
      // Apply default from config
      if (currentViewport === 'custom' && configViewport.custom) {
        applyViewportPreset({
          name: configViewport.custom.name || 'Custom',
          width: configViewport.custom.width,
          height: configViewport.custom.height
        });
      } else {
        const defaultPreset = allPresets.find(p => 
          p.name.toLowerCase() === currentViewport.toLowerCase()
        ) || allPresets.find(p => p.name === 'Fullscreen');
        if (defaultPreset) {
          applyViewportPreset(defaultPreset);
        }
      }
    }
    
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