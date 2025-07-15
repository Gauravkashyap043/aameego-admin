import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/vehicle-master" element={<VehicleMaster />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/latest-activity" element={<LatestActivity />} />
        <Route path="/add-user" element={<AddUser />} />
      </Routes>
    </Router>
  );
}

export default App;
