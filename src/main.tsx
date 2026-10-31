import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseAuthProvider } from './auth/firebaseAuth';
import { AuthGate } from './auth/AuthGate';

createRoot(document.getElementById('root')!).render(
  <FirebaseAuthProvider>
    <AuthGate>
      <App />
    </AuthGate>
  </FirebaseAuthProvider>
);
