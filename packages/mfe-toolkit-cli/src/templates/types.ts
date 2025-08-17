export type Framework = 'react' | 'vue' | 'solid' | 'vanilla-ts' | 'vanilla-js';
export type ReactVersion = '17' | '18' | '19';
export type ServiceType = 'modal' | 'notification' | 'event-bus' | 'general';

export interface TemplateConfig {
  name: string;
  framework: Framework;
  projectPath: string;
  reactVersion?: ReactVersion;
  serviceType?: ServiceType;
  includeRouter?: boolean;
  includeState?: boolean;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export interface TemplateGenerator {
  generateMain(): string;
  generateApp(): string;
  generatePackageJson(): object;
  generateManifest(): object;
  generateBuildScript(): string;
  generateTsConfig(): object;
  generateReadme(): string;
}

export interface ServiceConfig {
  requiredServices: string[];
  capabilities: string[];
  emits: string[];
  listens: string[];
  features: string[];
  eventNamespace: string;
}

export function detectServiceType(projectPath: string, name: string): ServiceType {
  // Auto-detect service type from path or name
  if (projectPath.includes('modal') || name.includes('modal')) {
    return 'modal';
  }
  if (projectPath.includes('notification') || name.includes('notification')) {
    return 'notification';
  }
  if (projectPath.includes('event-bus') || name.includes('event')) {
    return 'event-bus';
  }
  return 'general';
}

export function getServiceConfig(serviceType: ServiceType, name: string): ServiceConfig {
  switch (serviceType) {
    case 'modal':
      return {
        requiredServices: ['modal', 'logger'],
        capabilities: ['modal-demo', 'modal-testing'],
        emits: ['modal:test-opened', 'modal:test-closed'],
        listens: [],
        features: ['modal-testing', 'custom-modals', 'modal-stacking'],
        eventNamespace: 'modal-demo'
      };
    
    case 'notification':
      return {
        requiredServices: ['notification', 'logger'],
        capabilities: ['notification-demo', 'notification-testing'],
        emits: ['notification:test-triggered'],
        listens: [],
        features: ['notification-testing', 'custom-notifications'],
        eventNamespace: 'notification-demo'
      };
    
    case 'event-bus':
      return {
        requiredServices: ['eventBus', 'logger'],
        capabilities: ['event-bus-demo', 'event-testing'],
        emits: [`${name}:event-sent`],
        listens: ['*'],
        features: ['event-testing', 'event-monitoring'],
        eventNamespace: name
      };
    
    default:
      return {
        requiredServices: ['logger'],
        capabilities: ['demo'],
        emits: [],
        listens: [],
        features: [],
        eventNamespace: name
      };
  }
}

export function getFrameworkIcon(framework: Framework): string {
  switch (framework) {
    case 'react': return '⚛️';
    case 'vue': return '💚';
    case 'solid': return '🔷';
    case 'vanilla-ts':
    case 'vanilla-js': return '📦';
    default: return '🚀';
  }
}

export function getFrameworkDisplayName(framework: Framework, version?: ReactVersion): string {
  switch (framework) {
    case 'react': return `React${version ? ` ${version}` : ''}`;
    case 'vue': return 'Vue 3';
    case 'solid': return 'Solid.js';
    case 'vanilla-ts': return 'Vanilla TypeScript';
    case 'vanilla-js': return 'Vanilla JavaScript';
    default: return 'Unknown';
  }
}