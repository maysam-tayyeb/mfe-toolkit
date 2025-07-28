import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MFECommunicationPage } from '@/pages/MFECommunicationPage';
import { MFEPage } from '@mfe/dev-kit';
import { createMFEServices } from '@/services/mfe-services';
import { RegistryProvider } from '@/contexts/RegistryContext';
import { AppContent } from './AppContent';

function App() {
  return (
    <Provider store={store}>
      <RegistryProvider>
        <AppContent />
      </RegistryProvider>
    </Provider>
  );
}

export default App;
