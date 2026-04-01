import { memo } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Routing from './Routing';

const App = memo(function App() {
  return (
    <ThemeProvider>
      <Routing />
    </ThemeProvider>
  );
});

export default App;
