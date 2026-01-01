import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Leaderboard from './pages/Leaderboard';
import Attendance from './pages/Attendance';
import Meetings from './pages/Meetings';
import Calendar from './pages/Calendar';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/attendance" element={<Attendance />} />

          <Route path="/meetings" element={<Meetings />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
