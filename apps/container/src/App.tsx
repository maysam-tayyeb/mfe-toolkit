import { Provider } from 'react-redux';
import { store } from '@/store';
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
