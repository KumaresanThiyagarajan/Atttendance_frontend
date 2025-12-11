import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Clock, DollarSign, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        todayAttendance: 0,
        pendingAdvances: 0,
        totalAdvanceAmount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch employees
            const employeesRes = await axios.get('/api/employees');
            const employees = employeesRes.data;
            const activeEmployees = employees.filter(emp => emp.isActive);

            // Fetch today's attendance
            const today = new Date().toISOString().split('T')[0];
            const attendanceRes = await axios.get(`/api/attendance?startDate=${today}&endDate=${today}`);

            // Fetch pending advances
            const advancesRes = await axios.get('/api/advances?status=pending');
            const advances = advancesRes.data;
            const totalAdvanceAmount = advances.reduce((sum, adv) => sum + adv.amount, 0);

            setStats({
                totalEmployees: employees.length,
                activeEmployees: activeEmployees.length,
                todayAttendance: attendanceRes.data.length,
                pendingAdvances: advances.length,
                totalAdvanceAmount
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Employees',
            value: stats.totalEmployees,
            subtitle: `${stats.activeEmployees} active`,
            icon: Users,
            color: 'primary',
            gradient: 'var(--gradient-primary)'
        },
        {
            title: "Today's Attendance",
            value: stats.todayAttendance,
            subtitle: 'employees present',
            icon: Clock,
            color: 'success',
            gradient: 'var(--gradient-success)'
        },
        {
            title: 'Pending Advances',
            value: stats.pendingAdvances,
            subtitle: `₹${stats.totalAdvanceAmount.toLocaleString()}`,
            icon: DollarSign,
            color: 'warning',
            gradient: 'var(--gradient-secondary)'
        },
        {
            title: 'System Status',
            value: 'Active',
            subtitle: 'All systems operational',
            icon: TrendingUp,
            color: 'success',
            gradient: 'var(--gradient-success)'
        }
    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p className="text-gray-600">Welcome to Attendance Salary Management System</p>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="stat-icon">
                                <Icon size={28} />
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-title">{stat.title}</h3>
                                <p className="stat-value">{stat.value}</p>
                                <p className="stat-subtitle">{stat.subtitle}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-info">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div className="quick-actions">
                        <a href="/employees" className="btn btn-primary">
                            <Users size={18} />
                            Manage Employees
                        </a>
                        <a href="/attendance" className="btn btn-primary">
                            <Clock size={18} />
                            Log Attendance
                        </a>
                        <a href="/advances" className="btn btn-primary">
                            <DollarSign size={18} />
                            Record Advance
                        </a>
                        <a href="/salary-report" className="btn btn-success">
                            <TrendingUp size={18} />
                            Generate Report
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
