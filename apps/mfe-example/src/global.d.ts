declare global {
  interface Window {
    ExampleMFE: {
      mount: (containerId: string) => void;
      unmount: () => void;
    };
  }
}

export {};
