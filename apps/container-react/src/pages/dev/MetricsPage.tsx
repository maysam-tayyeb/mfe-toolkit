import React from 'react';
import { MetricCard } from '@mfe/design-system-react';
import { Activity, Cpu, HardDrive, TrendingUp, Clock, Users } from 'lucide-react';

export const MetricsPage: React.FC = () => {
  return (
    <div className="ds-page">
      <div className="ds-section">
        <h1 className="ds-page-title">Platform Metrics</h1>
        <p className="ds-text-muted">Monitor platform performance and resource usage</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          title="CPU Usage"
          value="32%"
          icon={<Cpu className="h-5 w-5" />}
          trend="down"
          trendValue="5%"
        />
        <MetricCard
          title="Memory"
          value="45MB"
          icon={<HardDrive className="h-5 w-5" />}
          trend="up"
          trendValue="2MB"
        />
        <MetricCard
          title="Response Time"
          value="120ms"
          icon={<Clock className="h-5 w-5" />}
          trend="down"
          trendValue="15ms"
        />
        <MetricCard
          title="Active Users"
          value="1"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ds-card-padded">
          <h2 className="ds-section-title mb-4">Performance Metrics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">First Contentful Paint</span>
              <span className="font-medium">1.2s</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Time to Interactive</span>
              <span className="font-medium">2.1s</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Largest Contentful Paint</span>
              <span className="font-medium">2.5s</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Cumulative Layout Shift</span>
              <span className="font-medium">0.03</span>
            </div>
          </div>
        </div>

        <div className="ds-card-padded">
          <h2 className="ds-section-title mb-4">Resource Usage</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Bundle Size</span>
              <span className="font-medium">542 KB</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Cache Size</span>
              <span className="font-medium">12 MB</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Network Requests</span>
              <span className="font-medium">24</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">WebSocket Connections</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ds-card-padded">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="ds-section-title">Live Activity</h2>
        </div>
        <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Activity chart would be displayed here
          </p>
        </div>
      </div>
    </div>
  );
};