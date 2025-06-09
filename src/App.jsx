import Canvas from './canvas';
import GPayButton from './gpay/upi';
import Customizer from './pages/Customizer';
import Home from './pages/Home';

function App() {
  return (
    <main className="app transition-all ease-in">
      <Home />
      <Canvas />
        <GPayButton/>
      <Customizer />
    
    </main>
  )
}

export default App