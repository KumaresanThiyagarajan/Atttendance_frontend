import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Edit2, Trash2, Search } from 'lucide-react';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        hourlyRate: '',
        position: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            alert('Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await axios.put(`/api/employees/${editingId}`, formData);
                alert('Employee updated successfully!');
            } else {
                await axios.post('/api/employees', formData);
                alert('Employee added successfully!');
            }

            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Error saving employee:', error);
            alert(error.response?.data?.message || 'Error saving employee');
        }
    };

    const handleEdit = (employee) => {
        setFormData({
            employeeId: employee.employeeId,
            name: employee.name,
            email: employee.email || '',
            phone: employee.phone || '',
            hourlyRate: employee.hourlyRate,
            position: employee.position || ''
        });
        setEditingId(employee._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;

        try {
            await axios.delete(`/api/employees/${id}`);
            alert('Employee deleted successfully!');
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Error deleting employee');
        }
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            name: '',
            email: '',
            phone: '',
            hourlyRate: '',
            position: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Employee Management</h1>
                    <p className="text-gray-600">Manage your workforce</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    <UserPlus size={18} />
                    {showForm ? 'Cancel' : 'Add Employee'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Employee ID *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                    required
                                    disabled={editingId !== null}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Hourly Rate (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={formData.hourlyRate}
                                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Position</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-success">
                                {editingId ? 'Update Employee' : 'Add Employee'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Employees ({filteredEmployees.length})</h3>
                    <div className="form-group" style={{ marginBottom: 0, maxWidth: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--gray-400)'
                                }}
                            />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Hourly Rate</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No employees found
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee._id}>
                                        <td><strong>{employee.employeeId}</strong></td>
                                        <td>{employee.name}</td>
                                        <td>{employee.position || '-'}</td>
                                        <td>₹{employee.hourlyRate.toFixed(2)}/hr</td>
                                        <td>
                                            <div style={{ fontSize: '0.875rem' }}>
                                                {employee.email && <div>{employee.email}</div>}
                                                {employee.phone && <div>{employee.phone}</div>}
                                                {!employee.email && !employee.phone && '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${employee.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {employee.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(employee)}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(employee._id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;
