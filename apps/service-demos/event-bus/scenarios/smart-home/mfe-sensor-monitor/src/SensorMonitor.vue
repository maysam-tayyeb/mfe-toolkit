<template>
  <div class="ds-card ds-p-4">
    <div class="ds-flex ds-justify-between ds-items-center ds-mb-4">
      <h4 class="ds-card-title ds-mb-0">📊 Sensor Monitor</h4>
      <span class="ds-badge" :class="alertLevel === 'normal' ? 'ds-badge-success' : alertLevel === 'warning' ? 'ds-badge-warning' : 'ds-badge-danger'">
        {{ alertLevel.toUpperCase() }}
      </span>
    </div>

    <div class="ds-space-y-3">
      <div v-for="sensor in sensors" :key="sensor.id" class="ds-p-3 ds-rounded-lg ds-border">
        <div class="ds-flex ds-justify-between ds-items-start ds-mb-2">
          <div>
            <div class="ds-flex ds-items-center ds-gap-2">
              <span class="ds-text-lg">{{ getSensorIcon(sensor.type) }}</span>
              <span class="ds-font-medium">{{ sensor.name }}</span>
            </div>
            <div class="ds-text-xs ds-text-muted">{{ sensor.location }}</div>
          </div>
          <div class="ds-text-right">
            <div class="ds-text-lg ds-font-bold" :class="getSensorValueClass(sensor)">
              {{ formatSensorValue(sensor) }}{{ sensor.unit }}
            </div>
            <div class="ds-text-xs ds-text-muted">{{ sensor.lastUpdate }}</div>
          </div>
        </div>
        
        <div class="ds-w-full ds-bg-slate-200 ds-rounded-full ds-h-2">
          <div 
            class="ds-h-2 ds-rounded-full ds-transition-all"
            :class="getSensorBarClass(sensor)"
            :style="`width: ${getSensorPercentage(sensor)}%`"
          ></div>
        </div>
        
        <div class="ds-flex ds-justify-between ds-text-xs ds-text-muted ds-mt-1">
          <span>{{ formatMinMax(sensor, sensor.min) }}{{ sensor.unit }}</span>
          <span>{{ formatMinMax(sensor, sensor.max) }}{{ sensor.unit }}</span>
        </div>
      </div>

      <div class="ds-p-3 ds-bg-slate-50 ds-rounded-lg">
        <div class="ds-text-sm ds-font-medium ds-mb-2">Recent Alerts</div>
        <div v-if="alerts.length === 0" class="ds-text-xs ds-text-muted">
          No alerts in the last hour
        </div>
        <div v-else class="ds-space-y-1">
          <div v-for="alert in alerts" :key="alert.id" class="ds-flex ds-items-center ds-gap-2 ds-text-xs">
            <span :class="alert.type === 'warning' ? 'ds-text-warning' : 'ds-text-danger'">⚠️</span>
            <span>{{ alert.message }}</span>
            <span class="ds-text-muted">{{ alert.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  services: any;
}>();

type Sensor = {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'motion' | 'air-quality' | 'water-leak' | 'smoke';
  value: number;
  unit: string;
  min: number;
  max: number;
  location: string;
  lastUpdate: string;
  status: 'normal' | 'warning' | 'critical';
};

type Alert = {
  id: string;
  message: string;
  type: 'warning' | 'critical';
  time: string;
};

const sensors = ref<Sensor[]>([
  {
    id: 's1',
    name: 'Temperature',
    type: 'temperature',
    value: 22,
    unit: '°C',
    min: 15,
    max: 30,
    location: 'Living Room',
    lastUpdate: 'Just now',
    status: 'normal'
  },
  {
    id: 's2',
    name: 'Humidity',
    type: 'humidity',
    value: 45,
    unit: '%',
    min: 30,
    max: 60,
    location: 'Living Room',
    lastUpdate: '1 min ago',
    status: 'normal'
  },
  {
    id: 's3',
    name: 'Air Quality',
    type: 'air-quality',
    value: 85,
    unit: '',
    min: 0,
    max: 100,
    location: 'Kitchen',
    lastUpdate: '2 min ago',
    status: 'normal'
  },
  {
    id: 's4',
    name: 'Motion Detector',
    type: 'motion',
    value: 0,
    unit: '',
    min: 0,
    max: 1,
    location: 'Entrance',
    lastUpdate: '5 min ago',
    status: 'normal'
  },
  {
    id: 's5',
    name: 'Water Leak',
    type: 'water-leak',
    value: 0,
    unit: '',
    min: 0,
    max: 1,
    location: 'Basement',
    lastUpdate: '10 min ago',
    status: 'normal'
  }
]);

const alerts = ref<Alert[]>([]);

const alertLevel = computed(() => {
  const criticalSensors = sensors.value.filter(s => s.status === 'critical');
  const warningSensors = sensors.value.filter(s => s.status === 'warning');
  
  if (criticalSensors.length > 0) return 'critical';
  if (warningSensors.length > 0) return 'warning';
  return 'normal';
});

const getSensorIcon = (type: string) => {
  const icons: Record<string, string> = {
    temperature: '🌡️',
    humidity: '💧',
    motion: '🚶',
    'air-quality': '💨',
    'water-leak': '💦',
    smoke: '🔥'
  };
  return icons[type] || '📊';
};

const formatSensorValue = (sensor: Sensor) => {
  if (sensor.type === 'temperature' || sensor.type === 'humidity') {
    return sensor.value.toFixed(1);
  }
  if (sensor.type === 'air-quality') {
    return Math.round(sensor.value);
  }
  return sensor.value;
};

const formatMinMax = (sensor: Sensor, value: number) => {
  if (sensor.type === 'temperature' || sensor.type === 'humidity') {
    return value.toFixed(0);
  }
  return value;
};

const getSensorPercentage = (sensor: Sensor) => {
  const range = sensor.max - sensor.min;
  const value = sensor.value - sensor.min;
  return Math.min(100, Math.max(0, (value / range) * 100));
};

const getSensorValueClass = (sensor: Sensor) => {
  if (sensor.status === 'critical') return 'ds-text-danger';
  if (sensor.status === 'warning') return 'ds-text-warning';
  return 'ds-text-success';
};

const getSensorBarClass = (sensor: Sensor) => {
  if (sensor.status === 'critical') return 'ds-bg-danger';
  if (sensor.status === 'warning') return 'ds-bg-warning';
  return 'ds-bg-success';
};

const updateSensorValue = (sensorId: string, delta: number) => {
  sensors.value = sensors.value.map(s => {
    if (s.id === sensorId) {
      const newValue = Math.min(s.max, Math.max(s.min, s.value + delta));
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      
      if (s.type === 'temperature') {
        if (newValue < 18 || newValue > 26) status = 'warning';
        if (newValue < 15 || newValue > 30) status = 'critical';
      } else if (s.type === 'humidity') {
        if (newValue < 35 || newValue > 55) status = 'warning';
        if (newValue < 30 || newValue > 60) status = 'critical';
      } else if (s.type === 'air-quality') {
        if (newValue < 50) status = 'warning';
        if (newValue < 30) status = 'critical';
      }
      
      return {
        ...s,
        value: newValue,
        status,
        lastUpdate: 'Just now'
      };
    }
    return s;
  });
};

let intervalId: NodeJS.Timeout | null = null;

onMounted(() => {
  // Simulate sensor updates
  intervalId = setInterval(() => {
    const randomSensor = sensors.value[Math.floor(Math.random() * sensors.value.length)];
    const delta = (Math.random() - 0.5) * 4;
    
    updateSensorValue(randomSensor.id, delta);
    
    const sensor = sensors.value.find(s => s.id === randomSensor.id);
    if (sensor) {
      props.services.eventBus.emit('sensor:reading', {
        sensorId: sensor.id,
        sensor: sensor.name,
        value: parseFloat(formatSensorValue(sensor)),
        unit: sensor.unit,
        location: sensor.location,
        status: sensor.status
      });
      
      if (sensor.status === 'warning' || sensor.status === 'critical') {
        const alert: Alert = {
          id: `alert-${Date.now()}`,
          message: `${sensor.name} in ${sensor.location}: ${formatSensorValue(sensor)}${sensor.unit}`,
          type: sensor.status === 'critical' ? 'critical' : 'warning',
          time: new Date().toLocaleTimeString()
        };
        
        alerts.value = [alert, ...alerts.value].slice(0, 5);
        
        props.services.eventBus.emit('sensor:alert', {
          ...alert,
          sensorId: sensor.id
        });
        
        props.services.notifications?.addNotification({
          type: sensor.status === 'critical' ? 'error' : 'warning',
          title: `Sensor Alert`,
          message: alert.message
        });
      }
    }
  }, 3000);
  
  // Listen for device state changes
  const unsubscribe = props.services.eventBus.on('device:state-changed', (payload: any) => {
    // Update relevant sensors based on device changes
    if (payload.data?.type === 'thermostat') {
      props.services.eventBus.emit('sensor:triggered', {
        trigger: 'device-change',
        device: payload.data.device
      });
    }
  });
  
  return () => {
    unsubscribe();
  };
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>