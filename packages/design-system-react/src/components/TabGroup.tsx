import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabGroupProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string; // For controlled mode
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export function TabGroup({ tabs, defaultTab, activeTab: controlledActiveTab, className = '', onTabChange }: TabGroupProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  
  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      <div className="ds-tab-group">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            className={`ds-tab ${activeTab === tab.id ? 'ds-tab-active' : ''}`}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ds-tab-panel">{activeTabContent}</div>
    </div>
  );
}
