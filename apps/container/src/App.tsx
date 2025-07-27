import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MFEPage, createMFERegistry } from '@mfe/dev-kit';
import { createMFEServices } from '@/services/mfe-services';

function App() {
  const mfeRegistry = useMemo(() => {
    const registry = createMFERegistry();

    // Register example MFE
    registry.register({
      name: 'example',
      version: '1.0.0',
      // Development: Vite dev server
      url: 'http://localhost:3001/mfe-example.umd.js',
      // Production examples:
      // url: 'https://cdn.example.com/mfes/example/1.0.0/mfe-example.umd.js',
      // url: 'https://mfe-example.example.com/mfe-example.umd.js',
      // url: '/mfes/example/mfe-example.umd.js', // Same origin
      dependencies: ['react', 'react-dom'],
      sharedLibs: ['@reduxjs/toolkit', 'react-redux'],
    });

    return registry;
  }, []);

  const mfeServices = useMemo(() => createMFEServices(), []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route
              path="mfe/:mfeName"
              element={
                <MFEPage
                  services={mfeServices}
                  registry={mfeRegistry}
                  fallback={
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading MFE...</p>
                      </div>
                    </div>
                  }
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
