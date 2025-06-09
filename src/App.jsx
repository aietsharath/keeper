import Canvas from './canvas';
import GPayButton from './gpay/upi';
import Customizer from './pages/Customizer';
import Home from './pages/Home';
import { CartProvider } from './context/cartContext'
import CanvasModel from './canvas';

function App() {
  return (
    <main className="app transition-all ease-in">
      <Home />
        
      <CanvasModel />
     <CartProvider>
      <Customizer />
      </CartProvider>
    
    </main>
  )
}

export default App