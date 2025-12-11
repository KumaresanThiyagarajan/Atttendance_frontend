import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Plus, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';

const Advances = () => {
    const [employees, setEmployees] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        employee: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        reason: ''
    });
    const [filters, setFilters] = useState({
        employeeId: '',
        status: ''
    });

    useEffect(() => {
        fetchEmployees();
        fetchAdvances();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/api/employees');
            setEmployees(response.data.filter(emp => emp.isActive));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAdvances = async () => {
        try {
            setLoading(true);
            let url = '/api/advances?';
            if (filters.employeeId) url += `employeeId=${filters.employeeId}&`;
            if (filters.status) url += `status=${filters.status}&`;

            const response = await axios.get(url);
            setAdvances(response.data);
        } catch (error) {
            console.error('Error fetching advances:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post('/api/advances', formData);
            alert('Advance payment recorded successfully!');
            resetForm();
            fetchAdvances();
        } catch (error) {
            console.error('Error saving advance:', error);
            alert(error.response?.data?.message || 'Error saving advance');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this advance record?')) return;

        try {
            await axios.delete(`/api/advances/${id}`);
            alert('Advance deleted successfully!');
            fetchAdvances();
        } catch (error) {
            console.error('Error deleting advance:', error);
            alert('Error deleting advance');
        }
    };

    const resetForm = () => {
        setFormData({
            employee: '',
            amount: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            reason: ''
        });
        setShowForm(false);
    };

    const totalPendingAdvances = advances
        .filter(adv => adv.status === 'pending')
        .reduce((sum, adv) => sum + adv.amount, 0);

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Advance Payments</h1>
                    <p className="text-gray-600">Track employee advances and deductions</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Plus size={18} />
                    {showForm ? 'Cancel' : 'Record Advance'}
                </button>
            </div>

            <div className="grid grid-cols-3" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--gradient-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}
                        >
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                Total Pending
                            </p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                                ₹{totalPendingAdvances.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}
                        >
                            <Filter size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                Pending Records
                            </p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                                {advances.filter(adv => adv.status === 'pending').length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--gradient-success)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}
                        >
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                Total Records
                            </p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                                {advances.length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">Record Advance Payment</h3>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Employee *</label>
                                <select
                                    className="form-select"
                                    value={formData.employee}
                                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.name} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Amount (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="form-input"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Reason</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="e.g., Medical emergency, Personal loan"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-success">
                                Record Advance
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <h3 className="card-title">Filter Advances</h3>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Employee</label>
                        <select
                            className="form-select"
                            value={filters.employeeId}
                            onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="deducted">Deducted</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <button className="btn btn-primary" onClick={fetchAdvances}>
                        <Filter size={18} />
                        Apply Filters
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Advance Records ({advances.length})</h3>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Employee</th>
                                    <th>Amount</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {advances.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No advance records found
                                        </td>
                                    </tr>
                                ) : (
                                    advances.map((advance) => (
                                        <tr key={advance._id}>
                                            <td>{format(new Date(advance.date), 'MMM dd, yyyy')}</td>
                                            <td>
                                                <strong>{advance.employee?.name}</strong>
                                                <br />
                                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                                    {advance.employee?.employeeId}
                                                </span>
                                            </td>
                                            <td>
                                                <strong style={{ fontSize: '1.125rem' }}>
                                                    ₹{advance.amount.toLocaleString()}
                                                </strong>
                                            </td>
                                            <td>{advance.reason || '-'}</td>
                                            <td>
                                                <span className={`badge ${advance.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                                                    {advance.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(advance._id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Advances;
