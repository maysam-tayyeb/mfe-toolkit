import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

export const useExampleStore = create<ExampleStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      increment: () => set({ count: get().count + 1 }),
      decrement: () => set({ count: get().count - 1 }),
      setUser: (user: ExampleState['user']) => set({ user }),
      addItem: (item: string) => set({ items: [...get().items, item] }),
      removeItem: (index: number) =>
        set({
          items: get().items.filter((_: string, i: number) => i !== index),
        }),
      reset: () => set(initialState),
    }),
    {
      name: 'example-store',
    }
  )
);
