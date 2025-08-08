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
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export function TabGroup({
  tabs,
  defaultTab,
  className = '',
  onTabChange
}: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };
  
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;
  
  return (
    <div className={className}>
      <div className="ds-tab-group">
        {tabs.map(tab => (
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
      <div className="ds-tab-panel">
        {activeTabContent}
      </div>
    </div>
  );
}