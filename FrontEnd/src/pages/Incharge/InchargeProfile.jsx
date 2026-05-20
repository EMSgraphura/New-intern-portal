import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Building, 
  Calendar,
  Shield,
  Filter,
  X,
  Edit,
  Key,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Power
} from 'lucide-react';

const InternInchargeProfile = () => {
  const { id } = useParams();
  const [incharge, setIncharge] = useState(null);
  const [interns, setInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchInchargeProfile();
  }, [id]);

  useEffect(() => {
    filterInterns();
  }, [interns, selectedDepartment, searchTerm, searchType]);

  const fetchInchargeProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/intern-incharge/${id}/profile`);
      setIncharge(response.data.Incharge);
      setInterns(response.data.Interns);
    } catch (err) {
      setError('Failed to fetch incharge profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterInterns = () => {
    let filtered = [...interns];

    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(intern => 
        intern.domain === selectedDepartment
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(intern => {
        switch (searchType) {
          case 'name':
            return intern.fullName?.toLowerCase().includes(term);
          case 'email':
            return intern.email?.toLowerCase().includes(term);
          case 'domain':
            return intern.domain?.toLowerCase().includes(term);
          default:
            return true;
        }
      });
    }

    setFilteredInterns(filtered);
  };

  const clearFilters = () => {
    setSelectedDepartment('All');
    setSearchTerm('');
    setSearchType('name');
  };

  const getDepartmentStats = () => {
    const stats = {};
    interns.forEach(intern => {
      const dept = intern.domain;
      stats[dept] = (stats[dept] || 0) + 1;
    });
    return stats;
  };

  const handleAddDepartment = async (newDepartment) => {
    try {
      const response = await axios.put(`/api/admin/intern-incharge/${id}/add/departments`, {
        departments: [...incharge.departments, newDepartment]
      });
      setIncharge(response.data.incharge);
      setShowEditModal(false);
      setEditingDepartment('');
      fetchInchargeProfile();
    } catch (err) {
      console.error('Error adding department:', err);
      alert('Failed to add department');
    }
  };

  const handleRemoveDepartment = async (departmentToRemove) => {
    try {
      const updatedDepartments = incharge.departments.filter(
        dept => dept !== departmentToRemove
      );
      const response = await axios.put(`/api/admin/intern-incharge/${id}/remove/departments`, {
        departments: updatedDepartments
      });
      setIncharge(response.data.incharge);
      fetchInchargeProfile();
    } catch (err) {
      console.error('Error removing department:', err);
      alert('Failed to remove department');
    }
  };

  const handleStatusChange = async () => {
    try {
      const response = await axios.put(`/api/admin/intern-incharge/${id}/status`, {
        status: newStatus
      });
      setIncharge(response.data.incharge);
      setShowStatusModal(false);
      setNewStatus('');
      alert(`Status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const openStatusModal = (currentStatus) => {
    setNewStatus(currentStatus === 'Active' ? 'Inactive' : 'Active');
    setShowStatusModal(true);
  };

  const departmentStats = getDepartmentStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!incharge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Incharge not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-8 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30">
                  {incharge.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <button
                    onClick={() => openStatusModal(incharge.status)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                      incharge.status === 'Active' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {incharge.status === 'Active' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {incharge.status}
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {incharge.fullName}
                    </h1>
                    <p className="text-blue-100 text-lg mb-3">{incharge.role}</p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <button
                      onClick={() => openStatusModal(incharge.status)}
                      className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                        incharge.status === 'Active'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {incharge.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Departments
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-blue-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{incharge.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{incharge.mobile}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Gender</span>
                  <span className="text-gray-900">{incharge.gender}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    incharge.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {incharge.status === 'Active' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {incharge.status}
                  </span>
                </div>
                
                {incharge.address && (
                  <div className="flex items-start gap-2 py-2 border-b border-gray-100">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-gray-600 font-medium block">Address</span>
                      <span className="text-gray-900">{incharge.address}</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-gray-600 text-sm font-medium">City</span>
                    <p className="text-gray-900">{incharge.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm font-medium">State</span>
                    <p className="text-gray-900">{incharge.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm font-medium">Pin Code</span>
                    <p className="text-gray-900">{incharge.pinCode || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Departments Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Departments
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {incharge.departments.length} departments
                </span>
              </div>
              
              <div className="space-y-3">
                {incharge.departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <span className="text-sm font-medium text-gray-700">{dept}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveDepartment(dept)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Interns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Assigned Interns
                </h2>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredInterns.length} of {interns.length} interns
                  </span>
                </div>
              </div>

              {/* Filters Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Department Filter */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter by Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All">All Departments</option>
                      {incharge.departments.map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept} ({departmentStats[dept] || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Filter */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Interns
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="domain">Domain</option>
                      </select>
                      <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder={`Search by ${searchType}...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedDepartment !== 'All' || searchTerm) && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {selectedDepartment !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Department: {selectedDepartment}
                        <button
                          onClick={() => setSelectedDepartment('All')}
                          className="ml-1 hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {searchType}: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-1 hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {filteredInterns.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    {interns.length === 0 
                      ? 'No interns found in matching departments' 
                      : 'No interns match your filters'
                    }
                  </p>
                  {(selectedDepartment !== 'All' || searchTerm) && (
                    <button
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear filters to see all interns
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredInterns.map((intern) => (
                    <InternCard key={intern._id} intern={intern} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Departments Modal */}
      {showEditModal && (
        <EditDepartmentsModal
          incharge={incharge}
          onClose={() => setShowEditModal(false)}
          onAddDepartment={handleAddDepartment}
          editingDepartment={editingDepartment}
          setEditingDepartment={setEditingDepartment}
        />
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <StatusChangeModal
          currentStatus={incharge.status}
          newStatus={newStatus}
          onClose={() => setShowStatusModal(false)}
          onConfirm={handleStatusChange}
          inchargeName={incharge.fullName}
        />
      )}
    </div>
  );
};

// Intern Card Component
const InternCard = ({ intern }) => {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4">
        {/* Intern Avatar */}
        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {intern.fullName?.split(' ').map(n => n[0]).join('') || 'I'}
        </div>
        
        {/* Intern Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {intern.fullName}
          </h3>
          <p className="text-gray-600 text-sm truncate mb-1">
            {intern.email}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-blue-600 text-sm font-medium">
              {intern.domain}
            </p>
          </div>    
          
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              intern.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : intern.status === 'Completed'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {intern.status || 'Active'}
            </span>
            
            {intern.joinDate && (
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Calendar className="w-3 h-3" />
                {new Date(intern.joinDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Departments Modal Component
const EditDepartmentsModal = ({ incharge, onClose, onAddDepartment, editingDepartment, setEditingDepartment }) => {
  const availableDepartments = [
    "Sales & Marketing",
    "Data & AI Intelligence",
    "Data Science & Analytics",
    "Human Resources",
    "Social Media Management",
    "Graphic Design",
    "Digital Marketing",
    "Video Editing",
    "Full Stack Development",
    "MERN Stack Development",
    "Email and Outreaching",
    "Content Creator",
    "Content Writing",
    "UI/UX Designing",
    "Front-end Developer",
    "Back-end Developer",
  ];

  const unassignedDepartments = availableDepartments.filter(
    dept => !incharge.departments.includes(dept)
  );

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Manage Departments</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Department
              </label>
              <div className="flex gap-2">
                <select
                  value={editingDepartment}
                  onChange={(e) => setEditingDepartment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select department</option>
                  {unassignedDepartments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
                <button
                  onClick={() => onAddDepartment(editingDepartment)}
                  disabled={!editingDepartment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Departments</h4>
              <div className="space-y-2">
                {incharge.departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{dept}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Change Modal Component
const StatusChangeModal = ({newStatus, onClose, onConfirm, inchargeName }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Change Status</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              newStatus === 'Active' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {newStatus === 'Active' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {newStatus === 'Active' ? 'Activate Incharge' : 'Deactivate Incharge'}
            </h4>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to {newStatus === 'Active' ? 'activate' : 'deactivate'} {' '}
              <span className="font-semibold">{inchargeName}</span>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  newStatus === 'Active' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {newStatus === 'Active' ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternInchargeProfile;