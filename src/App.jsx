import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Advances from './pages/Advances';
import SalaryReport from './pages/SalaryReport';

function App() {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <main style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 0' }}>
                    <div className="container">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/employees" element={<Employees />} />
                            <Route path="/attendance" element={<Attendance />} />
                            <Route path="/advances" element={<Advances />} />
                            <Route path="/salary-report" element={<SalaryReport />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}

export default App;
