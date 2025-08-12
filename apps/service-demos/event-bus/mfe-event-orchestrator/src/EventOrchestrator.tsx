import React, { useState, useEffect } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type EventOrchestratorProps = {
  services: MFEServices;
};

type WorkerStatus = {
  id: string;
  lastActivity: string;
  eventsProcessed: number;
  status: 'idle' | 'busy' | 'error';
};

export const EventOrchestrator: React.FC<EventOrchestratorProps> = ({ services }) => {
  const [workers, setWorkers] = useState<WorkerStatus[]>([
    { id: 'worker-a', lastActivity: '-', eventsProcessed: 0, status: 'idle' },
    { id: 'worker-b', lastActivity: '-', eventsProcessed: 0, status: 'idle' }
  ]);
  const [currentPattern, setCurrentPattern] = useState<'broadcast' | 'round-robin' | 'load-balance'>('broadcast');
  const [totalDispatched, setTotalDispatched] = useState(0);
  const [lastDispatchedEvent, setLastDispatchedEvent] = useState<string | null>(null);
  const [roundRobinIndex, setRoundRobinIndex] = useState(0);

  const dispatchToWorker = (workerId: string, eventType: string, data: any) => {
    services.eventBus.emit(`worker:${workerId}:task`, {
      type: eventType,
      data,
      timestamp: Date.now()
    });

    setWorkers(prev => prev.map(w => 
      w.id === workerId 
        ? { ...w, status: 'busy', lastActivity: new Date().toLocaleTimeString(), eventsProcessed: w.eventsProcessed + 1 }
        : w
    ));

    setTimeout(() => {
      setWorkers(prev => prev.map(w => 
        w.id === workerId ? { ...w, status: 'idle' } : w
      ));
    }, 500);

    services.logger.info(`[Orchestrator] Dispatched to ${workerId}:`, { eventType, data });
  };

  const handleBroadcast = () => {
    const data = { 
      message: 'Broadcast message to all workers',
      pattern: 'broadcast',
      timestamp: Date.now()
    };
    
    workers.forEach(worker => {
      dispatchToWorker(worker.id, 'orchestrator:broadcast', data);
    });
    
    setTotalDispatched(prev => prev + workers.length);
    setLastDispatchedEvent('Broadcast to All');
    
    services.notifications?.addNotification({
      type: 'info',
      title: 'Broadcast Sent',
      message: `Event sent to ${workers.length} workers`
    });
  };

  const handleRoundRobin = () => {
    const worker = workers[roundRobinIndex];
    const data = { 
      message: `Round-robin message ${roundRobinIndex + 1}`,
      pattern: 'round-robin',
      workerIndex: roundRobinIndex
    };
    
    dispatchToWorker(worker.id, 'orchestrator:round-robin', data);
    
    setRoundRobinIndex((prev) => (prev + 1) % workers.length);
    setTotalDispatched(prev => prev + 1);
    setLastDispatchedEvent(`Round Robin → ${worker.id}`);
  };

  const handleLoadBalance = () => {
    const idleWorker = workers.find(w => w.status === 'idle');
    const leastBusyWorker = workers.reduce((prev, curr) => 
      curr.eventsProcessed < prev.eventsProcessed ? curr : prev
    );
    
    const selectedWorker = idleWorker || leastBusyWorker;
    const data = { 
      message: 'Load balanced task',
      pattern: 'load-balance',
      selectedBy: idleWorker ? 'idle-first' : 'least-busy'
    };
    
    dispatchToWorker(selectedWorker.id, 'orchestrator:load-balance', data);
    
    setTotalDispatched(prev => prev + 1);
    setLastDispatchedEvent(`Load Balance → ${selectedWorker.id}`);
  };

  const handleSequentialBurst = () => {
    const events = [
      { type: 'task:start', data: { task: 'Process batch' } },
      { type: 'task:progress', data: { progress: 25 } },
      { type: 'task:progress', data: { progress: 50 } },
      { type: 'task:progress', data: { progress: 75 } },
      { type: 'task:complete', data: { result: 'Success' } }
    ];

    events.forEach((event, index) => {
      setTimeout(() => {
        const worker = workers[index % workers.length];
        dispatchToWorker(worker.id, event.type, event.data);
      }, index * 200);
    });

    setTotalDispatched(prev => prev + events.length);
    setLastDispatchedEvent('Sequential Burst');
  };

  const handleChaosTest = () => {
    const eventTypes = ['error', 'warning', 'info', 'debug', 'critical'];
    const randomEvents = 10;
    
    for (let i = 0; i < randomEvents; i++) {
      setTimeout(() => {
        const randomWorker = workers[Math.floor(Math.random() * workers.length)];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        dispatchToWorker(randomWorker.id, `chaos:${randomType}`, {
          index: i,
          random: Math.random(),
          timestamp: Date.now()
        });
      }, i * 100);
    }

    setTotalDispatched(prev => prev + randomEvents);
    setLastDispatchedEvent('Chaos Test (10 events)');
  };

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    unsubscribes.push(
      services.eventBus.on('worker:status', (payload) => {
        const { workerId, status } = payload.data;
        setWorkers(prev => prev.map(w => 
          w.id === workerId ? { ...w, status } : w
        ));
      })
    );

    unsubscribes.push(
      services.eventBus.on('worker:complete', (payload) => {
        const { workerId } = payload.data;
        setWorkers(prev => prev.map(w => 
          w.id === workerId 
            ? { ...w, status: 'idle', lastActivity: new Date().toLocaleTimeString() }
            : w
        ));
      })
    );

    services.eventBus.emit('mfe:ready', { 
      name: 'event-orchestrator',
      capabilities: ['coordinate', 'distribute', 'monitor']
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
      services.eventBus.emit('mfe:unloaded', { 
        name: 'event-orchestrator'
      });
    };
  }, [services]); // Remove totalDispatched from dependencies to prevent re-mounting

  return (
    <div className="ds-card ds-p-4">
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 className="ds-card-title ds-mb-0">🎛️ Event Orchestrator</h4>
        <span className="ds-badge-primary">📊 Dispatched: {totalDispatched}</span>
      </div>

      {lastDispatchedEvent && (
        <div className="ds-alert-success ds-mb-3 ds-text-xs ds-animate-in">
          Last: <strong>{lastDispatchedEvent}</strong>
        </div>
      )}

      <div className="ds-space-y-3">
        <div>
          <p className="ds-text-sm ds-text-muted ds-mb-2">Distribution Patterns:</p>
          <div className="ds-grid ds-grid-cols-1 ds-gap-2">
            <button
              onClick={handleBroadcast}
              className={`ds-btn-${currentPattern === 'broadcast' ? 'primary' : 'outline'} ds-btn-sm ds-w-full`}
              onMouseEnter={() => setCurrentPattern('broadcast')}
            >
              📢 Broadcast to All
            </button>
            <button
              onClick={handleRoundRobin}
              className={`ds-btn-${currentPattern === 'round-robin' ? 'primary' : 'outline'} ds-btn-sm ds-w-full`}
              onMouseEnter={() => setCurrentPattern('round-robin')}
            >
              🔄 Round Robin (Next: {workers[roundRobinIndex].id})
            </button>
            <button
              onClick={handleLoadBalance}
              className={`ds-btn-${currentPattern === 'load-balance' ? 'primary' : 'outline'} ds-btn-sm ds-w-full`}
              onMouseEnter={() => setCurrentPattern('load-balance')}
            >
              ⚖️ Load Balance
            </button>
          </div>
        </div>

        <div>
          <p className="ds-text-sm ds-text-muted ds-mb-2">Advanced Patterns:</p>
          <div className="ds-grid ds-grid-cols-2 ds-gap-2">
            <button
              onClick={handleSequentialBurst}
              className="ds-btn-secondary ds-btn-sm"
            >
              📈 Sequential
            </button>
            <button
              onClick={handleChaosTest}
              className="ds-btn-danger ds-btn-sm"
            >
              🎲 Chaos Test
            </button>
          </div>
        </div>

        <div className="ds-border-t ds-pt-3">
          <p className="ds-text-sm ds-font-medium ds-mb-2">Worker Status:</p>
          <div className="ds-space-y-2">
            {workers.map(worker => (
              <div key={worker.id} className="ds-flex ds-justify-between ds-items-center ds-text-xs">
                <span className="ds-font-medium">{worker.id}</span>
                <div className="ds-flex ds-gap-2 ds-items-center">
                  <span className={`ds-badge ds-badge-sm ${
                    worker.status === 'idle' ? 'ds-badge-success' : 
                    worker.status === 'busy' ? 'ds-badge-warning' : 
                    'ds-badge-danger'
                  }`}>
                    {worker.status}
                  </span>
                  <span className="ds-text-muted">
                    Processed: {worker.eventsProcessed}
                  </span>
                  <span className="ds-text-muted">
                    Last: {worker.lastActivity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ds-text-xs ds-text-muted">
          <p>🎯 Coordinating {workers.length} workers</p>
          <p>📡 Pattern: {currentPattern}</p>
        </div>
      </div>
    </div>
  );
};