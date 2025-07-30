import { useMFEStore } from '@mfe/dev-kit';

interface ExampleState {
  count: number;
  user: {
    name: string;
    email: string;
  } | null;
  items: string[];
}

interface ExampleActions {
  increment: () => void;
  decrement: () => void;
  setUser: (user: ExampleState['user']) => void;
  addItem: (item: string) => void;
  removeItem: (index: number) => void;
  reset: () => void;
}

type ExampleStore = ExampleState & ExampleActions;

const initialState: ExampleState = {
  count: 0,
  user: null,
  items: [],
};

export const useExampleStore = () => {
  const [state] = useMFEStore<ExampleStore>(
    {
      name: 'example',
      enableDevtools: true,
    },
    initialState as ExampleStore,
    (set: any, get: any) => ({
      increment: () => set({ count: get().count + 1 }),
      decrement: () => set({ count: get().count - 1 }),
      setUser: (user: ExampleState['user']) => set({ user }),
      addItem: (item: string) => set({ items: [...get().items, item] }),
      removeItem: (index: number) =>
        set({
          items: get().items.filter((_: string, i: number) => i !== index),
        }),
      reset: () => set(initialState),
    })
  );

  return state;
};
