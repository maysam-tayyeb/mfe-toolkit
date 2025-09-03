import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { createServiceContainer } from '../../services/service-container';
import { createPinoLogger } from '../../services/pino-logger';
import { createLogger } from '@mfe-toolkit/core';

/**
 * Logger Demo Page
 * 
 * Demonstrates the ability to override the default logger service
 * with custom implementations like Pino for enhanced logging.
 */
export function LoggerDemoPage() {
  const [logs, setLogs] = useState<Array<{ type: string; message: string; timestamp: string }>>([]);
  const [currentLogger, setCurrentLogger] = useState<'default' | 'pino'>('default');

  // Create containers with different loggers
  const defaultContainer = createServiceContainer({ usePinoLogger: false });
  const pinoContainer = createServiceContainer({ usePinoLogger: true });

  const addLog = (type: string, message: string) => {
    setLogs(prev => [
      ...prev,
      {
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      }
    ].slice(-10)); // Keep last 10 logs
  };

  const demonstrateDefaultLogger = () => {
    setCurrentLogger('default');
    const logger = defaultContainer.get('logger');
    
    addLog('info', 'Using default console logger');
    logger.debug('Debug message from default logger', { extra: 'data' });
    logger.info('Info message from default logger');
    logger.warn('Warning from default logger');
    logger.error('Error from default logger', { errorCode: 'DEMO_001' });
  };

  const demonstratePinoLogger = () => {
    setCurrentLogger('pino');
    const logger = pinoContainer.get('logger');
    
    addLog('info', 'Using Pino structured logger');
    logger.debug('Debug message from Pino', { extra: 'structured data' });
    logger.info('Info message from Pino');
    logger.warn('Warning from Pino');
    logger.error('Error from Pino', { errorCode: 'DEMO_002', stack: 'trace' });
  };

  const demonstrateDirectUsage = () => {
    // Show how to use loggers directly
    const defaultLogger = createLogger('DirectDemo');
    const pinoLogger = createPinoLogger('DirectDemo', { level: 'debug' });
    
    addLog('info', 'Direct logger usage (check console)');
    defaultLogger.info('Direct usage of default logger');
    pinoLogger.info('Direct usage of Pino logger', { customField: 'value' });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Logger Service Override Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates how the logger service can be overridden with custom implementations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Default Logger Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Default Console Logger</CardTitle>
            <CardDescription>
              Built-in logger using console methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p>✓ Simple console output</p>
              <p>✓ Lightweight</p>
              <p>✓ No dependencies</p>
              <p>✓ Good for development</p>
            </div>
            <Button 
              onClick={demonstrateDefaultLogger}
              variant={currentLogger === 'default' ? 'default' : 'outline'}
              className="w-full"
            >
              Test Default Logger
            </Button>
          </CardContent>
        </Card>

        {/* Pino Logger Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Pino Structured Logger</CardTitle>
            <CardDescription>
              High-performance structured logging library
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p>✓ Structured JSON output</p>
              <p>✓ Better performance</p>
              <p>✓ Log levels & filtering</p>
              <p>✓ Production ready</p>
            </div>
            <Button 
              onClick={demonstratePinoLogger}
              variant={currentLogger === 'pino' ? 'default' : 'outline'}
              className="w-full"
            >
              Test Pino Logger
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Direct Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Logger Usage</CardTitle>
          <CardDescription>
            Create and use loggers directly without service container
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={demonstrateDirectUsage} variant="secondary">
            Test Direct Usage
          </Button>
        </CardContent>
      </Card>

      {/* Log Output */}
      <Card>
        <CardHeader>
          <CardTitle>Log Activity</CardTitle>
          <CardDescription>
            Recent log messages (also check browser console for full output)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No logs yet. Click a test button above.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-center gap-2 text-sm font-mono">
                  <span className="text-muted-foreground">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    log.type === 'error' ? 'bg-red-100 text-red-700' :
                    log.type === 'warn' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {log.type.toUpperCase()}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
          {logs.length > 0 && (
            <Button onClick={clearLogs} variant="outline" size="sm" className="mt-4">
              Clear Logs
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Alert>
        <AlertDescription>
          <strong>How to enable Pino globally:</strong>
          <br />
          1. Set environment variable: <code>REACT_APP_USE_PINO=true</code>
          <br />
          2. Or modify <code>src/config/logger.config.ts</code>
          <br />
          3. The service container will automatically use Pino when configured
        </AlertDescription>
      </Alert>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Example</CardTitle>
          <CardDescription>
            How to override the logger service in your container
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`// Option 1: Use configuration
const container = createServiceContainer({ 
  usePinoLogger: true 
});

// Option 2: Direct override
import { PinoLogger } from './services/pino-logger';

const container = new ServiceContainer();
container.register('logger', new PinoLogger('MyApp'));

// Option 3: Use any Logger implementation
class CustomLogger implements Logger {
  debug(message: string, data?: unknown): void {
    // Custom implementation
  }
  // ... other methods
}

container.register('logger', new CustomLogger());`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}