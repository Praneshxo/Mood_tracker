import { Route, Routes } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import Login from './Login.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Home" element={<HomePage />} />
    </Routes>
  );
}
 export default App;