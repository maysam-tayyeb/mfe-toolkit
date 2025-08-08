import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { Button } from '@/components/ui/button';
import { Settings, Save, RotateCcw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addNotification } = useUI();

  const handleSave = () => {
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your settings have been saved successfully'
    });
  };

  const handleReset = () => {
    addNotification({
      type: 'info',
      title: 'Settings Reset',
      message: 'Settings have been reset to defaults'
    });
  };

  return (
    <div className="ds-page">
      <div className="ds-section">
        <h1 className="ds-page-title">Platform Settings</h1>
        <p className="ds-text-muted">Configure platform behavior and preferences</p>
      </div>

      <div className="grid gap-6">
        <div className="ds-card-padded">
          <h2 className="ds-section-title mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="ds-label">Platform Name</label>
              <input
                type="text"
                className="ds-input"
                defaultValue="MFE Platform"
                placeholder="Enter platform name"
              />
            </div>
            <div>
              <label className="ds-label">Default Timeout (ms)</label>
              <input
                type="number"
                className="ds-input"
                defaultValue="30000"
                placeholder="Enter timeout in milliseconds"
              />
            </div>
            <div>
              <label className="ds-label">Max Retries</label>
              <input
                type="number"
                className="ds-input"
                defaultValue="3"
                placeholder="Enter maximum retry attempts"
              />
            </div>
          </div>
        </div>

        <div className="ds-card-padded">
          <h2 className="ds-section-title mb-4">Feature Flags</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="ds-checkbox" defaultChecked />
              <span className="text-sm">Enable Typed Events</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="ds-checkbox" defaultChecked />
              <span className="text-sm">Enable Error Boundaries</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="ds-checkbox" defaultChecked />
              <span className="text-sm">Use Manifest V2</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="ds-checkbox" />
              <span className="text-sm">Enable Debug Mode</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="ds-checkbox" />
              <span className="text-sm">Enable Performance Monitoring</span>
            </label>
          </div>
        </div>

        <div className="ds-card-padded">
          <h2 className="ds-section-title mb-4">Registry Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="ds-label">Registry URL</label>
              <input
                type="url"
                className="ds-input"
                defaultValue="/mfe-registry.json"
                placeholder="Enter registry URL"
              />
            </div>
            <div>
              <label className="ds-label">Environment</label>
              <select className="ds-select">
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};