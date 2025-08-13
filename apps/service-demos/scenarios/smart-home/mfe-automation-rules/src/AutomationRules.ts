import type { MFEServices } from '@mfe-toolkit/core';

type Rule = {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
};

export class AutomationRules {
  private container: HTMLElement;
  private services: MFEServices;
  private rules: Rule[] = [
    {
      id: 'r1',
      name: 'Motion Lights',
      trigger: 'Motion detected',
      condition: 'After sunset',
      action: 'Turn on lights',
      enabled: true,
      triggerCount: 5
    },
    {
      id: 'r2',
      name: 'Energy Saver',
      trigger: 'Nobody home',
      condition: 'All users away',
      action: 'Set thermostat to eco mode',
      enabled: true,
      triggerCount: 2
    },
    {
      id: 'r3',
      name: 'Security Alert',
      trigger: 'Door opened',
      condition: 'Security mode on',
      action: 'Send notification & record',
      enabled: false,
      triggerCount: 0
    },
    {
      id: 'r4',
      name: 'Morning Routine',
      trigger: 'Time: 7:00 AM',
      condition: 'Weekday',
      action: 'Open blinds, start coffee',
      enabled: true,
      triggerCount: 12
    },
    {
      id: 'r5',
      name: 'Temperature Control',
      trigger: 'Temperature > 24°C',
      condition: 'Someone home',
      action: 'Turn on AC',
      enabled: true,
      triggerCount: 8
    }
  ];
  
  private eventListeners: Array<() => void> = [];

  constructor(container: HTMLElement, services: MFEServices) {
    this.container = container;
    this.services = services;
    this.init();
  }

  private init(): void {
    this.render();
    this.attachEventListeners();
    this.subscribeToEvents();
  }

  private render(): void {
    const html = `
      <div class="ds-card ds-p-4">
        <div class="ds-flex ds-justify-between ds-items-center ds-mb-4">
          <h4 class="ds-card-title ds-mb-0">🤖 Automation Rules</h4>
          <button id="add-rule" class="ds-btn-primary ds-btn-sm">
            ➕ New Rule
          </button>
        </div>

        <div class="ds-space-y-3">
          ${this.rules.map(rule => `
            <div class="ds-p-3 ds-rounded-lg ds-border ${rule.enabled ? 'ds-bg-white' : 'ds-bg-slate-50'}">
              <div class="ds-flex ds-justify-between ds-items-start">
                <div class="ds-flex-1">
                  <div class="ds-flex ds-items-center ds-gap-2 ds-mb-2">
                    <span class="ds-font-medium">${rule.name}</span>
                    <span class="ds-badge ${rule.enabled ? 'ds-badge-success' : 'ds-badge-secondary'} ds-badge-sm">
                      ${rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div class="ds-space-y-1 ds-text-sm">
                    <div class="ds-flex ds-items-center ds-gap-2">
                      <span class="ds-text-muted">When:</span>
                      <span class="ds-text-primary">${rule.trigger}</span>
                    </div>
                    <div class="ds-flex ds-items-center ds-gap-2">
                      <span class="ds-text-muted">If:</span>
                      <span>${rule.condition}</span>
                    </div>
                    <div class="ds-flex ds-items-center ds-gap-2">
                      <span class="ds-text-muted">Then:</span>
                      <span class="ds-font-medium">${rule.action}</span>
                    </div>
                  </div>
                  
                  <div class="ds-flex ds-items-center ds-gap-4 ds-mt-2 ds-text-xs ds-text-muted">
                    <span>Triggered ${rule.triggerCount} times</span>
                    ${rule.lastTriggered ? `<span>Last: ${rule.lastTriggered}</span>` : ''}
                  </div>
                </div>
                
                <div class="ds-flex ds-flex-col ds-gap-2">
                  <button 
                    data-toggle="${rule.id}" 
                    class="ds-btn-sm ${rule.enabled ? 'ds-btn-outline' : 'ds-btn-success'}"
                  >
                    ${rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button data-test="${rule.id}" class="ds-btn-sm ds-btn-outline">
                    Test
                  </button>
                  <button data-delete="${rule.id}" class="ds-btn-sm ds-btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="ds-mt-4 ds-p-3 ds-bg-slate-50 ds-rounded-lg">
          <div class="ds-text-sm ds-font-medium ds-mb-2">Quick Scenarios</div>
          <div class="ds-grid ds-grid-cols-3 ds-gap-2">
            <button data-scenario="away" class="ds-btn-outline ds-btn-sm">
              🏃 Away Mode
            </button>
            <button data-scenario="night" class="ds-btn-outline ds-btn-sm">
              🌙 Night Mode
            </button>
            <button data-scenario="party" class="ds-btn-outline ds-btn-sm">
              🎉 Party Mode
            </button>
            <button data-scenario="movie" class="ds-btn-outline ds-btn-sm">
              🎬 Movie Mode
            </button>
            <button data-scenario="work" class="ds-btn-outline ds-btn-sm">
              💼 Work Mode
            </button>
            <button data-scenario="eco" class="ds-btn-outline ds-btn-sm">
              🌱 Eco Mode
            </button>
          </div>
        </div>

        <div class="ds-mt-4 ds-text-xs ds-text-muted ds-text-center">
          ${this.rules.filter(r => r.enabled).length} active rules • ${this.rules.reduce((acc, r) => acc + r.triggerCount, 0)} total triggers today
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Add rule button
    const addBtn = this.container.querySelector('#add-rule');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addRule());
    }

    // Toggle rule buttons
    this.container.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ruleId = (e.target as HTMLElement).dataset.toggle;
        if (ruleId) this.toggleRule(ruleId);
      });
    });

    // Test rule buttons
    this.container.querySelectorAll('[data-test]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ruleId = (e.target as HTMLElement).dataset.test;
        if (ruleId) this.testRule(ruleId);
      });
    });

    // Delete rule buttons
    this.container.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ruleId = (e.target as HTMLElement).dataset.delete;
        if (ruleId) this.deleteRule(ruleId);
      });
    });

    // Scenario buttons
    this.container.querySelectorAll('[data-scenario]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scenario = (e.target as HTMLElement).dataset.scenario;
        if (scenario) this.activateScenario(scenario);
      });
    });
  }

  private subscribeToEvents(): void {
    // Listen for sensor alerts to trigger rules
    const unsubscribe1 = this.services.eventBus.on('sensor:alert', (payload: any) => {
      const rule = this.rules.find(r => 
        r.enabled && r.trigger.includes('Temperature') && payload.data?.type === 'critical'
      );
      
      if (rule) {
        this.triggerRule(rule);
      }
    });

    // Listen for device state changes
    const unsubscribe2 = this.services.eventBus.on('device:state-changed', (payload: any) => {
      // Check if any rules should trigger based on device state
      this.checkRules();
    });

    this.eventListeners.push(unsubscribe1, unsubscribe2);
  }

  private toggleRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      this.render();
      
      this.services.eventBus.emit('automation:rule-toggled', {
        ruleId,
        name: rule.name,
        enabled: rule.enabled
      });

      this.services.notifications?.addNotification({
        type: 'info',
        title: 'Rule Updated',
        message: `${rule.name} ${rule.enabled ? 'enabled' : 'disabled'}`
      });
    }
  }

  private testRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      this.triggerRule(rule);
    }
  }

  private triggerRule(rule: Rule): void {
    rule.triggerCount++;
    rule.lastTriggered = new Date().toLocaleTimeString();

    this.services.eventBus.emit('automation:rule-triggered', {
      ruleId: rule.id,
      name: rule.name,
      action: rule.action
    });

    // Execute rule actions
    if (rule.action.includes('Turn on lights')) {
      this.services.eventBus.emit('automation:control-device', {
        action: 'turn-on',
        deviceType: 'light'
      });
    } else if (rule.action.includes('Turn on AC')) {
      this.services.eventBus.emit('automation:control-device', {
        action: 'adjust-temperature',
        deviceType: 'thermostat',
        value: 20
      });
    } else if (rule.action.includes('Set thermostat to eco mode')) {
      this.services.eventBus.emit('automation:control-device', {
        action: 'adjust-temperature',
        deviceType: 'thermostat',
        value: 18
      });
    } else if (rule.action.includes('Send notification')) {
      this.services.notifications?.addNotification({
        type: 'warning',
        title: 'Security Alert',
        message: 'Door opened while in security mode'
      });
    } else if (rule.action.includes('Open blinds')) {
      this.services.notifications?.addNotification({
        type: 'info',
        title: 'Morning Routine',
        message: 'Blinds opened and coffee started'
      });
    }
    
    this.render();

    this.services.notifications?.addNotification({
      type: 'success',
      title: 'Rule Triggered',
      message: `${rule.name}: ${rule.action}`
    });
  }

  private deleteRule(ruleId: string): void {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      const rule = this.rules[index];
      this.rules.splice(index, 1);
      this.render();
      
      this.services.eventBus.emit('automation:rule-deleted', {
        ruleId,
        name: rule.name
      });

      this.services.notifications?.addNotification({
        type: 'warning',
        title: 'Rule Deleted',
        message: `${rule.name} has been removed`
      });
    }
  }

  private addRule(): void {
    const triggers = ['Motion detected', 'Door opened', 'Temperature change', 'Time based', 'User arrives'];
    const conditions = ['Always', 'During daytime', 'When home', 'When away', 'On weekends'];
    const actions = ['Turn on lights', 'Send notification', 'Lock doors', 'Adjust temperature', 'Play music'];

    const newRule: Rule = {
      id: `r${Date.now()}`,
      name: `New Rule ${this.rules.length + 1}`,
      trigger: triggers[Math.floor(Math.random() * triggers.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      enabled: false,
      triggerCount: 0
    };

    this.rules.push(newRule);
    this.render();
    this.attachEventListeners();

    this.services.eventBus.emit('automation:rule-created', {
      ruleId: newRule.id,
      name: newRule.name
    });
  }

  private activateScenario(scenario: string): void {
    const scenarios: Record<string, { actions: string[], execute: () => void }> = {
      away: {
        actions: ['Lock all doors', 'Set security mode', 'Lower thermostat'],
        execute: () => {
          this.services.eventBus.emit('automation:control-device', {
            action: 'lock',
            deviceType: 'lock'
          });
          this.services.eventBus.emit('automation:control-device', {
            action: 'adjust-temperature',
            deviceType: 'thermostat',
            value: 18
          });
          this.services.eventBus.emit('automation:control-device', {
            action: 'turn-off',
            deviceType: 'light'
          });
        }
      },
      night: {
        actions: ['Turn off lights', 'Lock doors', 'Enable motion sensors'],
        execute: () => {
          this.services.eventBus.emit('automation:control-device', {
            action: 'turn-off',
            deviceType: 'light'
          });
          this.services.eventBus.emit('automation:control-device', {
            action: 'lock',
            deviceType: 'lock'
          });
        }
      },
      party: {
        actions: ['Set mood lighting', 'Play music', 'Disable quiet hours'],
        execute: () => {
          this.services.eventBus.emit('automation:control-device', {
            action: 'turn-on',
            deviceType: 'light'
          });
        }
      },
      movie: {
        actions: ['Dim lights', 'Close blinds', 'Set theater mode'],
        execute: () => {
          this.services.eventBus.emit('automation:control-device', {
            action: 'turn-off',
            deviceType: 'light',
            devices: ['d5', 'd6']
          });
        }
      },
      work: {
        actions: ['Bright lights', 'Focus mode', 'Do not disturb'],
        execute: () => {
          this.services.eventBus.emit('automation:control-device', {
            action: 'turn-on',
            deviceType: 'light'
          });
          this.services.eventBus.emit('automation:control-device', {
            action: 'adjust-temperature',
            deviceType: 'thermostat',
            value: 22
          });
        }
      },
      eco: {
        actions: ['Optimize temperature', 'Turn off unused devices', 'Energy saving'],
        execute: () => {
          this.services.eventBus.emit('automation:control-device', {
            action: 'adjust-temperature',
            deviceType: 'thermostat',
            value: 19
          });
          this.services.eventBus.emit('automation:control-device', {
            action: 'turn-off',
            deviceType: 'light',
            devices: ['d5']
          });
        }
      }
    };

    const config = scenarios[scenario];
    if (config) {
      config.execute();
      
      this.services.eventBus.emit('automation:scenario-activated', {
        scenario,
        actions: config.actions
      });

      this.services.notifications?.addNotification({
        type: 'success',
        title: `${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Mode`,
        message: `Activated with ${config.actions.length} actions`
      });
    }
  }

  private checkRules(): void {
    // Check and trigger rules based on current conditions
    this.rules.forEach(rule => {
      if (rule.enabled && Math.random() > 0.8) {
        // Simulate rule condition check
        this.triggerRule(rule);
      }
    });
  }

  destroy(): void {
    this.eventListeners.forEach(unsubscribe => unsubscribe());
    this.container.innerHTML = '';
  }
}