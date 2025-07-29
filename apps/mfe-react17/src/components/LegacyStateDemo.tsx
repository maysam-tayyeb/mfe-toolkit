import React, { useState } from 'react';
import { useReact17Store } from '@/store/useReact17Store';

export const LegacyStateDemo: React.FC = () => {
  const store = useReact17Store();
  const [newMessage, setNewMessage] = useState('');

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      store.addMessage(`[React 17]: ${newMessage}`);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div>
        <h2 className="text-2xl font-bold mb-2">React 17 State Management</h2>
        <p className="text-gray-600">Legacy MFE with Zustand state (React {React.version})</p>
      </div>

      {/* Counter Section */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Counter</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={store.decrement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            -
          </button>
          <span className="text-3xl font-bold tabular-nums">{store.count}</span>
          <button
            onClick={store.increment}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Legacy Data Section */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Legacy Data</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">React Version:</span> {store.legacyData.version}</p>
          <p>
            <span className="font-medium">Last Updated:</span> {' '}
            {store.legacyData.lastUpdated 
              ? store.legacyData.lastUpdated.toLocaleString() 
              : 'Never'}
          </p>
        </div>
        <button
          onClick={() => store.updateLegacyData('17.0.2-legacy')}
          className="mt-3 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Update Version
        </button>
      </div>

      {/* Messages Section */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Message Log</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {store.messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet...</p>
          ) : (
            store.messages.map((msg, idx) => (
              <div key={idx} className="text-sm p-1 bg-gray-50 rounded">
                {msg}
              </div>
            ))
          )}
        </div>
        {store.messages.length > 0 && (
          <button
            onClick={store.clearMessages}
            className="mt-2 text-sm text-red-600 hover:text-red-700"
          >
            Clear Messages
          </button>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={store.reset}
        className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
      >
        Reset All State
      </button>
    </div>
  );
};