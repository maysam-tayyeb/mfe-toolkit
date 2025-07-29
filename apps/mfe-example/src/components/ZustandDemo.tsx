import React, { useState } from 'react';
import { useExampleStore } from '@/store/useExampleStore';

export const ZustandDemo: React.FC = () => {
  const store = useExampleStore();
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      store.addItem(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Zustand State Management Demo</h2>
      
      {/* Counter Section */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Counter</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={store.decrement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -
          </button>
          <span className="text-2xl font-bold">{store.count}</span>
          <button
            onClick={store.increment}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      {/* User Section */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">User Management</h3>
        {store.user ? (
          <div>
            <p>Name: {store.user.name}</p>
            <p>Email: {store.user.email}</p>
            <button
              onClick={() => store.setUser(null)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => store.setUser({ name: 'John Doe', email: 'john@example.com' })}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Login Demo User
          </button>
        )}
      </div>

      {/* Items List Section */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Items List</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="Add new item..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <ul className="list-disc list-inside">
          {store.items.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{item}</span>
              <button
                onClick={() => store.removeItem(index)}
                className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Reset Button */}
      <button
        onClick={store.reset}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Reset All
      </button>
    </div>
  );
};