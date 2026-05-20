import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Filter,
    Search,
    Users,
    Building,
    Mail,
    Phone,
    Calendar,
    User,
    Clock,
    BarChart3
} from 'lucide-react';
import * as XLSX from 'xlsx';

const AttendanceAdminPage = () => {
    const [internsData, setInternsData] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [departmentStats, setDepartmentStats] = useState({});
    const [overallStats, setOverallStats] = useState({});
    const [selectedStatus, setSelectedStatus] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchDepartments();
        fetchInternsData();
    }, []);

    useEffect(() => {
        fetchInternsData();
    }, [selectedDepartment, searchTerm, dateFilter,selectedStatus   ]);

    const fetchDepartments = async () => {
        try {
            const { data } = await axios.get('/api/admin/departments', {
                withCredentials: true,
            });
            setDepartments(data.departments || []);
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    const fetchInternsData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedDepartment) params.append('department', selectedDepartment);
            if (searchTerm) params.append('search', searchTerm);
            if (dateFilter) params.append('date', dateFilter);
            if (selectedStatus) params.append('status', selectedStatus); // ✅ status filter

            const { data } = await axios.get(`/api/admin/attendance/interns?${params}`, {
                withCredentials: true,
            });

            if (data.success) {
                setInternsData(data.interns || []);
                setDepartmentStats(data.departmentStats || {});
                setOverallStats(data.overallStats || {});
            }
        } catch (err) {
            console.error('Error fetching interns data:', err);
            setInternsData([]);
            setDepartmentStats({});
            setOverallStats({});
        }
        setLoading(false);
    };


    const exportToExcel = () => {
        try {
            const dataToExport = internsData.map(intern => ({
                'Department': intern.domain,
                'Full Name': intern.fullName,
                'Email': intern.email,
                'Mobile': intern.mobile,
                'Unique ID': intern.uniqueId,
                'Status': intern.status,
                'Total Meetings': intern.totalMeetings,
                'Meetings Attended': intern.meetingsAttended,
                'Leaves Taken': intern.leavesTaken,
                'Attendance Rate': `${intern.attendanceRate}%`,
                'Present Count': intern.presentCount,
                'Absent Count': intern.absentCount,
                'Leave Count': intern.leaveCount,
                'Joining Date': intern.joiningDate,
                'Performance': intern.performance
            }));

            if (dataToExport.length === 0) {
                alert('No data available to export');
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Interns Attendance');
            XLSX.writeFile(workbook, `Interns_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Error exporting data to Excel');
        }
    };

    const getAttendanceRateColor = (rate) => {
        if (rate >= 90) return 'text-green-600';
        if (rate >= 75) return 'text-blue-600';
        if (rate >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Selected': return 'bg-blue-100 text-blue-800';
            case 'Applied': return 'bg-yellow-100 text-yellow-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPerformanceColor = (performance) => {
        switch (performance) {
            case 'Excellent': return 'bg-purple-100 text-purple-800';
            case 'Good': return 'bg-green-100 text-green-800';
            case 'Average': return 'bg-yellow-100 text-yellow-800';
            case 'Poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/Admin-Dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Interns Attendance Management</h1>
                                <p className="text-gray-600">View and manage intern attendance by departments</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={exportToExcel}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                            >
                                <Download size={20} />
                                Export Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{overallStats.totalInterns || 0}</div>
                        <div className="text-sm text-blue-800">Total Interns</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{overallStats.totalPresent || 0}</div>
                        <div className="text-sm text-green-800">Total Present</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{overallStats.totalAbsent || 0}</div>
                        <div className="text-sm text-red-800">Total Absent</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{overallStats.totalLeave || 0}</div>
                        <div className="text-sm text-yellow-800">Total Leave</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{overallStats.totalDepartments || 0}</div>
                        <div className="text-sm text-purple-800">Departments</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className={`text-2xl font-bold ${getAttendanceRateColor(overallStats.avgAttendance || 0)}`}>
                            {overallStats.avgAttendance || 0}%
                        </div>
                        <div className="text-sm text-gray-800">Avg Attendance</div>
                    </div>
                </div>

                {/* Department Stats Preview */}
                {Object.keys(departmentStats).length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <BarChart3 size={20} />
                            Department Statistics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(departmentStats).map(([department, stats]) => (
                                <div key={department} className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-2">{department}</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Interns:</span>
                                            <span className="font-medium">{stats.totalInterns}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Present:</span>
                                            <span className="text-green-600 font-medium">{stats.present}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Absent:</span>
                                            <span className="text-red-600 font-medium">{stats.absent}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Leave:</span>
                                            <span className="text-yellow-600 font-medium">{stats.leave}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-1 mt-1">
                                            <span className="text-gray-600">Attendance:</span>
                                            <span className={`font-bold ${getAttendanceRateColor(stats.attendanceRate)}`}>
                                                {stats.attendanceRate}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            {(selectedDepartment || searchTerm || dateFilter || selectedStatus) && (
                                <button
                                    onClick={() => {
                                        setSelectedDepartment('');
                                        setSearchTerm('');
                                        setDateFilter('');
                                        setSelectedStatus(''); // ✅ reset status
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center"
                                >
                                    <Filter size={20} />
                                    Clear Filters
                                </button>
                            )}

                        </div>
                    </div>

                    {/* Active Filters Info */}
                    {(selectedDepartment || searchTerm || dateFilter) && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                                {selectedDepartment && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        <Building size={12} />
                                        Department: {selectedDepartment}
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        <Search size={12} />
                                        Search: {searchTerm}
                                    </span>
                                )}
                                {dateFilter && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                        <Calendar size={12} />
                                        Date: {new Date(dateFilter).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Interns Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : internsData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-gray-700">Intern Details</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Contact Info</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Department</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Performance</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Attendance Stats</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Attendance %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {internsData.map((intern) => (
                                        <tr key={intern._id} className="hover:bg-gray-50 transition-colors">
                                            {/* Intern Details */}
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                        <User size={20} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800">{intern.fullName}</div>
                                                        <div className="text-sm text-gray-600">{intern.uniqueId}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Joined: {intern.joiningDate ? new Date(intern.joiningDate).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Info */}
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} />
                                                        <span className="truncate">{intern.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone size={14} />
                                                        <span>{intern.mobile}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td className="p-4">
                                                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                                                    {intern.domain}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(intern.status)}`}>
                                                    {intern.status}
                                                </span>
                                            </td>

                                            {/* Performance */}
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(intern.performance)}`}>
                                                    {intern.performance}
                                                </span>
                                            </td>

                                            {/* Attendance Stats */}
                                            <td className="p-4">
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Total Meetings:</span>
                                                        <span className="font-semibold">{intern.totalMeetings}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-green-600">Attended:</span>
                                                        <span className="font-semibold">{intern.meetingsAttended}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-red-600">Absent:</span>
                                                        <span className="font-semibold">{intern.absentCount}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-yellow-600">Leaves:</span>
                                                        <span className="font-semibold">{intern.leaveCount}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Attendance Percentage */}
                                            <td className="p-4">
                                                <div className="text-center">
                                                    <div className={`text-2xl font-bold ${getAttendanceRateColor(intern.attendanceRate)}`}>
                                                        {intern.attendanceRate}%
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">Attendance Rate</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">👥</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Interns Found</h3>
                            <p className="text-gray-500">No interns match your search criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceAdminPage;