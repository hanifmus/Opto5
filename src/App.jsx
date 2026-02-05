import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layout/DashboardLayout';
import Dashboard from './pages/Dashboard';

// Dashboard component is imported above

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Dashboard />} />
                    <Route path="/inventory" element={<Dashboard />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
