import { useMFEStore } from '@mfe-toolkit/react';

interface React17State {
  count: number;
  legacyData: {
    version: string;
    lastUpdated: Date | null;
  };
  messages: string[];
}

interface React17Actions {
  increment: () => void;
  decrement: () => void;
  updateLegacyData: (version: string) => void;
  addMessage: (message: string) => void;
  clearMessages: () => void;
  reset: () => void;
}

type React17Store = React17State & React17Actions;

const initialState: React17State = {
  count: 0,
  legacyData: {
    version: '17.0.2',
    lastUpdated: null,
  },
  messages: [],
};

export const useReact17Store = () => {
  const [state] = useMFEStore<React17Store>(
    {
      name: 'react17',
      enableDevtools: true,
    },
    initialState as React17Store,
    (set: any, get: any) => ({
      increment: () => set({ count: get().count + 1 }),
      decrement: () => set({ count: get().count - 1 }),
      updateLegacyData: (version: string) =>
        set({
          legacyData: {
            version,
            lastUpdated: new Date(),
          },
        }),
      addMessage: (message: string) =>
        set({
          messages: [...get().messages, message],
        }),
      clearMessages: () => set({ messages: [] }),
      reset: () => set(initialState),
    })
  );

  return state;
};
