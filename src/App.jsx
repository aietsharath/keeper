import { AuthProvider, useAuth } from './components/AuthContext';
import AuthScreen from './components/AuthScreen';
import Customizer from './pages/Customizer';
import CanvasModel from './canvas';
import Home from './pages/Home';
import { CartProvider } from './context/cartContext';

function ProtectedApp() {
  const { user } = useAuth();
  if (!user) return <AuthScreen />;

  return (
    <main className="app transition-all ease-in">
      <Home />
      <CanvasModel />
      <CartProvider>
        <Customizer />
      </CartProvider>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}

export default App;
