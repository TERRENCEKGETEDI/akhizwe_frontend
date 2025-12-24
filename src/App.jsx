import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import AirtimeData from './components/AirtimeData';
import VideoMusic from './components/VideoMusic';
import Tickets from './components/Tickets';
import Admin from './components/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/airtime-data" element={<AirtimeData />} />
        <Route path="/video-music" element={<VideoMusic />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;