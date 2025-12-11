import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Save, X, CheckCircle, History } from 'lucide-react';
import { format } from 'date-fns';
import './Attendance.css';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [attendanceData, setAttendanceData] = useState({});
    const [existingAttendance, setExistingAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [attendanceHistory, setAttendanceHistory] = useState([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (employees.length > 0) {
            fetchAttendanceForDate();
        }
    }, [selectedDate, employees]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/employees');
            const activeEmployees = response.data.filter(emp => emp.isActive);
            setEmployees(activeEmployees);

            // Initialize attendance data
            const initialData = {};
            activeEmployees.forEach(emp => {
                initialData[emp._id] = {
                    regularHours: '',
                    overtimeHours: '',
                    notes: '',
                    isPresent: false
                };
            });
            setAttendanceData(initialData);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceForDate = async () => {
        try {
            const response = await axios.get(`/api/attendance?startDate=${selectedDate}&endDate=${selectedDate}`);
            const existing = {};

            response.data.forEach(record => {
                existing[record.employee._id] = {
                    _id: record._id,
                    regularHours: record.regularHours,
                    overtimeHours: record.overtimeHours,
                    notes: record.notes || '',
                    isPresent: true
                };
            });

            setExistingAttendance(existing);

            // Update attendance data with existing records

            const updatedData = { ...attendanceData };
            Object.keys(existing).forEach(empId => {
                updatedData[empId] = existing[empId];
            });
            setAttendanceData(updatedData);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const fetchAttendanceHistory = async () => {
        try {
            const response = await axios.get('/api/attendance');
            setAttendanceHistory(response.data);
            setShowHistory(true);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleAttendanceChange = (employeeId, field, value) => {
        setAttendanceData(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: value,
                isPresent: field === 'regularHours' && value > 0 ? true : prev[employeeId].isPresent
            }
        }));
    };

    const togglePresence = (employeeId) => {
        setAttendanceData(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                isPresent: !prev[employeeId].isPresent,
                regularHours: !prev[employeeId].isPresent ? '' : prev[employeeId].regularHours,
                overtimeHours: !prev[employeeId].isPresent ? '' : prev[employeeId].overtimeHours
            }
        }));
    };

    const saveAttendance = async (employeeId) => {
        const data = attendanceData[employeeId];

        if (!data.isPresent || !data.regularHours || parseFloat(data.regularHours) <= 0) {
            alert('Please enter regular hours for the employee');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                employee: employeeId,
                date: selectedDate,
                regularHours: parseFloat(data.regularHours),
                overtimeHours: parseFloat(data.overtimeHours) || 0,
                notes: data.notes
            };

            if (existingAttendance[employeeId]?._id) {
                // Update existing
                await axios.put(`/api/attendance/${existingAttendance[employeeId]._id}`, payload);
                alert('Attendance updated successfully!');
            } else {
                // Create new
                await axios.post('/api/attendance', payload);
                alert('Attendance saved successfully!');
            }

            fetchAttendanceForDate();
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert(error.response?.data?.message || 'Error saving attendance');
        } finally {
            setSaving(false);
        }
    };

    const clearAttendance = (employeeId) => {
        setAttendanceData(prev => ({
            ...prev,
            [employeeId]: {
                regularHours: '',
                overtimeHours: '',
                notes: '',
                isPresent: false
            }
        }));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="attendance-page fade-in">
            <div className="attendance-header">
                <div>
                    <h1>Daily Attendance</h1>
                    <p className="text-gray-600">Mark attendance for all employees</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchAttendanceHistory}>
                    <History size={18} />
                    View History
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="date-selector">
                    <Calendar size={24} style={{ color: 'var(--primary-600)' }} />
                    <div>
                        <label className="form-label" style={{ marginBottom: '0.25rem' }}>Select Date</label>
                        <input
                            type="date"
                            className="form-input date-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="date-info">
                        <span className="badge badge-primary">
                            {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
                        </span>
                    </div>
                </div>
            </div>

            {employees.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Clock size={64} style={{ color: 'var(--gray-300)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--gray-600)' }}>No Active Employees</h3>
                    <p className="text-gray-500">Add employees first to mark attendance</p>
                </div>
            ) : (
                <div className="employee-grid">
                    {employees.map((employee) => {
                        const data = attendanceData[employee._id] || {};
                        const isMarked = existingAttendance[employee._id];

                        return (
                            <div
                                key={employee._id}
                                className={`employee-card ${data.isPresent ? 'present' : ''} ${isMarked ? 'saved' : ''}`}
                            >
                                <div className="employee-card-header">
                                    <div className="employee-info">
                                        <h3>{employee.name}</h3>
                                        <p className="employee-id">{employee.employeeId}</p>
                                        <p className="employee-rate">₹{employee.hourlyRate}/hr</p>
                                    </div>
                                    <div className="presence-toggle">
                                        <button
                                            className={`presence-btn ${data.isPresent ? 'active' : ''}`}
                                            onClick={() => togglePresence(employee._id)}
                                        >
                                            {data.isPresent ? (
                                                <>
                                                    <CheckCircle size={20} />
                                                    Present
                                                </>
                                            ) : (
                                                <>
                                                    <X size={20} />
                                                    Absent
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {data.isPresent && (
                                    <div className="attendance-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    <Clock size={14} />
                                                    Regular Hours *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    max="24"
                                                    className="form-input"
                                                    value={data.regularHours}
                                                    onChange={(e) => handleAttendanceChange(employee._id, 'regularHours', e.target.value)}
                                                    placeholder="8"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    <Clock size={14} />
                                                    Overtime Hours
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    max="24"
                                                    className="form-input"
                                                    value={data.overtimeHours}
                                                    onChange={(e) => handleAttendanceChange(employee._id, 'overtimeHours', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Notes (Optional)</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={data.notes}
                                                onChange={(e) => handleAttendanceChange(employee._id, 'notes', e.target.value)}
                                                placeholder="Any remarks..."
                                            />
                                        </div>

                                        {data.regularHours && (
                                            <div className="hours-summary">
                                                <span>Total: {(parseFloat(data.regularHours || 0) + parseFloat(data.overtimeHours || 0)).toFixed(1)} hrs</span>
                                                {data.overtimeHours > 0 && (
                                                    <span className="overtime-badge">+{data.overtimeHours} OT</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="card-actions">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => saveAttendance(employee._id)}
                                                disabled={saving}
                                            >
                                                <Save size={16} />
                                                {isMarked ? 'Update' : 'Save'}
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => clearAttendance(employee._id)}
                                            >
                                                <X size={16} />
                                                Clear
                                            </button>
                                        </div>

                                        {isMarked && (
                                            <div className="saved-indicator">
                                                <CheckCircle size={14} />
                                                Saved
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* History Modal */}
            {showHistory && (
                <div className="modal-overlay" onClick={() => setShowHistory(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Attendance History</h3>
                            <button className="btn btn-sm btn-secondary" onClick={() => setShowHistory(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Employee</th>
                                            <th>Regular Hours</th>
                                            <th>Overtime Hours</th>
                                            <th>Total Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceHistory.map((record) => (
                                            <tr key={record._id}>
                                                <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                                                <td>
                                                    <strong>{record.employee?.name}</strong>
                                                    <br />
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                                        {record.employee?.employeeId}
                                                    </span>
                                                </td>
                                                <td>{record.regularHours} hrs</td>
                                                <td>{record.overtimeHours} hrs</td>
                                                <td><strong>{record.regularHours + record.overtimeHours} hrs</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
