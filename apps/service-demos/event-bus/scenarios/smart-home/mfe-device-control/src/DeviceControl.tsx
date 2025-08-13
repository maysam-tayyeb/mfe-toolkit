import React, { useState, useEffect } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type Device = {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera';
  status: 'on' | 'off' | 'active' | 'inactive';
  value?: number;
  room: string;
};

type DeviceControlProps = {
  services: MFEServices;
};

export const DeviceControl: React.FC<DeviceControlProps> = ({ services }) => {
  const [devices, setDevices] = useState<Device[]>([
    { id: 'd1', name: 'Living Room Light', type: 'light', status: 'on', room: 'Living Room' },
    { id: 'd2', name: 'Smart Thermostat', type: 'thermostat', status: 'active', value: 22, room: 'Living Room' },
    { id: 'd3', name: 'Front Door Lock', type: 'lock', status: 'active', room: 'Entrance' },
    { id: 'd4', name: 'Security Camera', type: 'camera', status: 'active', room: 'Entrance' },
    { id: 'd5', name: 'Bedroom Light', type: 'light', status: 'off', room: 'Bedroom' },
    { id: 'd6', name: 'Kitchen Light', type: 'light', status: 'on', room: 'Kitchen' },
  ]);

  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      light: '💡',
      thermostat: '🌡️',
      lock: '🔒',
      camera: '📹'
    };
    return icons[type] || '📱';
  };

  const toggleDevice = (device: Device) => {
    const newStatus = device.status === 'on' || device.status === 'active' ? 'off' : 'on';
    
    setDevices(prev => prev.map(d => 
      d.id === device.id ? { ...d, status: newStatus === 'on' ? (d.type === 'light' ? 'on' : 'active') : (d.type === 'light' ? 'off' : 'inactive') } : d
    ));

    // Emit device state change event
    services.eventBus.emit('device:state-changed', {
      deviceId: device.id,
      device: device.name,
      type: device.type,
      newState: newStatus,
      room: device.room,
      timestamp: Date.now()
    });

    // Show notification
    services.notifications?.addNotification({
      type: 'info',
      title: 'Device Updated',
      message: `${device.name} turned ${newStatus}`
    });
  };

  const adjustThermostat = (device: Device, delta: number) => {
    setDevices(prev => prev.map(d => 
      d.id === device.id ? { ...d, value: (d.value || 22) + delta } : d
    ));

    const newValue = (device.value || 22) + delta;
    
    services.eventBus.emit('device:thermostat-adjusted', {
      deviceId: device.id,
      device: device.name,
      temperature: newValue,
      room: device.room
    });
  };

  const addDevice = () => {
    const deviceTypes: Array<'light' | 'thermostat' | 'lock' | 'camera'> = ['light', 'thermostat', 'lock', 'camera'];
    const rooms = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'];
    const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    
    const newDevice: Device = {
      id: `d${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      status: 'off',
      room,
      value: type === 'thermostat' ? 21 : undefined
    };

    setDevices(prev => [...prev, newDevice]);
    
    services.eventBus.emit('device:added', {
      device: newDevice.name,
      type: newDevice.type,
      room: newDevice.room
    });
  };

  const rooms = ['all', ...Array.from(new Set(devices.map(d => d.room)))];
  const filteredDevices = selectedRoom === 'all' ? devices : devices.filter(d => d.room === selectedRoom);

  useEffect(() => {
    // Listen for automation control events
    const unsubscribe = services.eventBus.on('automation:control-device', (payload: any) => {
      const { action, deviceType, devices: deviceIds, value } = payload.data || {};
      
      if (action === 'turn-on') {
        devices.filter(d => 
          (deviceType ? d.type === deviceType : true) && 
          (deviceIds ? deviceIds.includes(d.id) : true) &&
          (d.status === 'off' || d.status === 'inactive')
        ).forEach(device => toggleDevice(device));
      } else if (action === 'turn-off') {
        devices.filter(d => 
          (deviceType ? d.type === deviceType : true) && 
          (deviceIds ? deviceIds.includes(d.id) : true) &&
          (d.status === 'on' || d.status === 'active')
        ).forEach(device => toggleDevice(device));
      } else if (action === 'adjust-temperature' && value !== undefined) {
        devices.filter(d => d.type === 'thermostat').forEach(device => {
          setDevices(prev => prev.map(d => 
            d.id === device.id ? { ...d, value } : d
          ));
          services.eventBus.emit('device:thermostat-adjusted', {
            deviceId: device.id,
            device: device.name,
            temperature: value,
            room: device.room
          });
        });
      } else if (action === 'lock') {
        devices.filter(d => 
          d.type === 'lock' && 
          (deviceIds ? deviceIds.includes(d.id) : true)
        ).forEach(device => {
          if (device.status !== 'active') {
            toggleDevice(device);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [devices]);

  return (
    <div className="ds-card ds-p-4">
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 className="ds-card-title ds-mb-0">🏠 Device Control</h4>
        <button onClick={addDevice} className="ds-btn-primary ds-btn-sm">
          ➕ Add Device
        </button>
      </div>

      <div className="ds-flex ds-gap-2 ds-mb-3">
        {rooms.map(room => (
          <button
            key={room}
            onClick={() => setSelectedRoom(room)}
            className={`ds-btn-sm ${selectedRoom === room ? 'ds-btn-primary' : 'ds-btn-outline'}`}
          >
            {room === 'all' ? 'All Rooms' : room}
          </button>
        ))}
      </div>

      <div className="ds-grid ds-grid-cols-2 ds-gap-2">
        {filteredDevices.map(device => (
          <div 
            key={device.id} 
            className={`ds-p-3 ds-rounded-lg ds-border ${
              device.status === 'on' || device.status === 'active' 
                ? 'ds-bg-accent-success-soft ds-border-success' 
                : 'ds-bg-slate-50 ds-border-slate-200'
            }`}
          >
            <div className="ds-flex ds-items-center ds-justify-between ds-mb-2">
              <div className="ds-flex ds-items-center ds-gap-2">
                <span className="ds-text-lg">{getDeviceIcon(device.type)}</span>
                <div>
                  <div className="ds-text-sm ds-font-medium">{device.name}</div>
                  <div className="ds-text-xs ds-text-muted">{device.room}</div>
                </div>
              </div>
              {device.type === 'thermostat' && device.value !== undefined ? (
                <div className="ds-flex ds-items-center ds-gap-1">
                  <button 
                    onClick={() => adjustThermostat(device, -1)}
                    className="ds-btn-sm ds-btn-outline ds-px-2 ds-py-1"
                  >
                    -
                  </button>
                  <span className="ds-text-sm ds-font-bold ds-mx-2">{device.value}°C</span>
                  <button 
                    onClick={() => adjustThermostat(device, 1)}
                    className="ds-btn-sm ds-btn-outline ds-px-2 ds-py-1"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleDevice(device)}
                  className={`ds-btn-sm ${
                    device.status === 'on' || device.status === 'active'
                      ? 'ds-btn-success'
                      : 'ds-btn-outline'
                  }`}
                >
                  {device.status === 'on' || device.status === 'active' ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="ds-mt-4 ds-text-xs ds-text-muted">
        📊 {devices.filter(d => d.status === 'on' || d.status === 'active').length} / {devices.length} devices active
      </div>
    </div>
  );
};