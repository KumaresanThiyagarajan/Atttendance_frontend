import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Clock, DollarSign, FileText } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/employees', label: 'Employees', icon: Users },
        { path: '/attendance', label: 'Attendance', icon: Clock },
        { path: '/advances', label: 'Advances', icon: DollarSign },
        { path: '/salary-report', label: 'Salary Report', icon: FileText },
    ];

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <div className="navbar-brand">
                        <Clock className="navbar-logo" size={32} />
                        <span className="navbar-title">AttendancePro</span>
                    </div>

                    <div className="navbar-links">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
