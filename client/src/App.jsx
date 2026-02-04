import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import Members from "./pages/Members";
import Events from "./pages/Events";
import Leaderboard from "./pages/Leaderboard";
import Attendance from "./pages/Attendance";
import Meetings from "./pages/Meetings";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [initialLoad, setInitialLoad] = useState(true);

  if (initialLoad) {
    return <LoadingScreen onComplete={() => setInitialLoad(false)} />;
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/members" element={<Members />} />
          <Route path="/events" element={<Events />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Route */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
