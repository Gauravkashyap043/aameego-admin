import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import AdminUsers from "./pages/AdminUsers";
import VehicleMaster from "./pages/VehicleMaster";
import Finance from "./pages/Finance";
import Chat from "./pages/Chat";
import LatestActivity from "./pages/LatestActivity";
import AddUser from "./pages/AddUser";
import './styles/App.css';
import AddVehicle from "./pages/AddVehicle";
import VehicleQR from "./pages/VehicleQR";


const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/user-management" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/admin-users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
        <Route path="/vehicle-master" element={<PrivateRoute><VehicleMaster /></PrivateRoute>} />
        <Route path="/finance" element={<PrivateRoute><Finance /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/latest-activity" element={<PrivateRoute><LatestActivity /></PrivateRoute>} />
        <Route path="/add-user/:id" element={<PrivateRoute><AddUser /></PrivateRoute>} />
        <Route path="/add-vehicle" element={<PrivateRoute><AddVehicle /></PrivateRoute>} />
        <Route path="/add-vehicle/:id" element={<PrivateRoute><AddVehicle /></PrivateRoute>} />
        <Route path="/vehicle-qr/:vehicleNumber" element={<PrivateRoute><VehicleQR /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
