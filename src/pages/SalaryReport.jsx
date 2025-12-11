import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Calculator } from 'lucide-react';
import { format } from 'date-fns';

const SalaryReport = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });
    const [salaryData, setSalaryData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/api/employees');
            setEmployees(response.data.filter(emp => emp.isActive));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const calculateSalary = async () => {
        if (!selectedEmployee) {
            alert('Please select an employee');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(
                `/api/salary/calculate/${selectedEmployee}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
            );
            setSalaryData(response.data);
        } catch (error) {
            console.error('Error calculating salary:', error);
            alert(error.response?.data?.message || 'Error calculating salary');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!selectedEmployee) {
            alert('Please select an employee and calculate salary first');
            return;
        }

        try {
            const response = await axios.get(
                `/api/salary/report/${selectedEmployee}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `salary-report-${salaryData?.employee?.employeeId}-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error downloading PDF report');
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1>Salary Report</h1>
                <p className="text-gray-600">Generate detailed salary reports with PDF export</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <h3 className="card-title">Report Parameters</h3>
                </div>

                <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Employee *</label>
                        <select
                            className="form-select"
                            value={selectedEmployee}
                            onChange={(e) => {
                                setSelectedEmployee(e.target.value);
                                setSalaryData(null);
                            }}
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.name} ({emp.employeeId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Start Date *</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateRange.startDate}
                            onChange={(e) => {
                                setDateRange({ ...dateRange, startDate: e.target.value });
                                setSalaryData(null);
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">End Date *</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateRange.endDate}
                            onChange={(e) => {
                                setDateRange({ ...dateRange, endDate: e.target.value });
                                setSalaryData(null);
                            }}
                        />
                    </div>
                </div>

                <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={calculateSalary}
                        disabled={loading}
                    >
                        <Calculator size={18} />
                        {loading ? 'Calculating...' : 'Calculate Salary'}
                    </button>

                    {salaryData && (
                        <button
                            className="btn btn-success"
                            onClick={downloadPDF}
                        >
                            <Download size={18} />
                            Download PDF
                        </button>
                    )}
                </div>
            </div>

            {salaryData && (
                <div className="card fade-in">
                    <div className="card-header">
                        <h3 className="card-title">Salary Breakdown</h3>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>Employee Information</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Employee ID:</span>
                                    <strong>{salaryData.employee.employeeId}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Name:</span>
                                    <strong>{salaryData.employee.name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Hourly Rate:</span>
                                    <strong>₹{salaryData.employee.hourlyRate.toFixed(2)}/hr</strong>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>Period</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">From:</span>
                                    <strong>{format(new Date(salaryData.period.startDate), 'MMM dd, yyyy')}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">To:</span>
                                    <strong>{format(new Date(salaryData.period.endDate), 'MMM dd, yyyy')}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Days:</span>
                                    <strong>{salaryData.attendance.totalDays} days</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'var(--gray-50)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '2rem'
                    }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>Hours Worked</h4>
                        <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                                    Regular Hours
                                </p>
                                <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-600)' }}>
                                    {salaryData.attendance.regularHours.toFixed(2)}
                                </p>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                                    Overtime Hours
                                </p>
                                <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--secondary-600)' }}>
                                    {salaryData.attendance.overtimeHours.toFixed(2)}
                                </p>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                                    Total Hours
                                </p>
                                <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--gray-900)' }}>
                                    {(salaryData.attendance.regularHours + salaryData.attendance.overtimeHours).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        color: 'white'
                    }}>
                        <h4 style={{ marginBottom: '1rem', color: 'white' }}>Salary Calculation</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="flex justify-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                <span>Regular Pay ({salaryData.attendance.regularHours.toFixed(2)} hrs × ₹{salaryData.employee.hourlyRate.toFixed(2)})</span>
                                <strong style={{ fontSize: '1.125rem' }}>₹{salaryData.salary.regularPay.toFixed(2)}</strong>
                            </div>

                            <div className="flex justify-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                <span>Overtime Pay ({salaryData.attendance.overtimeHours.toFixed(2)} hrs × ₹{(salaryData.employee.hourlyRate * 1.5).toFixed(2)})</span>
                                <strong style={{ fontSize: '1.125rem' }}>₹{salaryData.salary.overtimePay.toFixed(2)}</strong>
                            </div>

                            <div className="flex justify-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                <span style={{ fontSize: '1.125rem' }}>Gross Salary</span>
                                <strong style={{ fontSize: '1.25rem' }}>₹{salaryData.salary.grossSalary.toFixed(2)}</strong>
                            </div>

                            {salaryData.salary.totalAdvances > 0 && (
                                <div className="flex justify-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                    <span style={{ color: '#fca5a5' }}>Advances Deducted ({salaryData.advances.length} records)</span>
                                    <strong style={{ fontSize: '1.125rem', color: '#fca5a5' }}>- ₹{salaryData.salary.totalAdvances.toFixed(2)}</strong>
                                </div>
                            )}

                            <div className="flex justify-between" style={{ paddingTop: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>NET SALARY</span>
                                <strong style={{ fontSize: '2rem', fontWeight: '800' }}>₹{salaryData.salary.netSalary.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>

                    {salaryData.advances.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>Advance Deductions</h4>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaryData.advances.map((adv, index) => (
                                            <tr key={index}>
                                                <td>{format(new Date(adv.date), 'MMM dd, yyyy')}</td>
                                                <td><strong>₹{adv.amount.toFixed(2)}</strong></td>
                                                <td>{adv.reason || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {salaryData.attendanceDetails.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>Attendance Details</h4>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Regular Hours</th>
                                            <th>Overtime Hours</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaryData.attendanceDetails.map((att, index) => (
                                            <tr key={index}>
                                                <td>{format(new Date(att.date), 'MMM dd, yyyy')}</td>
                                                <td>{att.regularHours.toFixed(2)} hrs</td>
                                                <td>{att.overtimeHours.toFixed(2)} hrs</td>
                                                <td>{att.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!salaryData && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <FileText size={64} style={{ color: 'var(--gray-300)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>No Report Generated</h3>
                    <p className="text-gray-500">Select an employee and date range, then click "Calculate Salary"</p>
                </div>
            )}
        </div>
    );
};

export default SalaryReport;
