import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Graphura from "../../../public/GraphuraLogo.jpg";
import * as XLSX from "xlsx";
import { Eye, CheckCircle, Calendar, Mail, Wrench, FileSpreadsheet, Printer, Copy, ChevronDown } from "lucide-react";


const AdminDashboard = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [showBulkOfferModal, setShowBulkOfferModal] = useState(false);
  const [generatingOffers, setGeneratingOffers] = useState(false);
  const [showAdminToolsDropdown, setShowAdminToolsDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAdminToolsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const [deletingRejected, setDeletingRejected] = useState(false);
  const [showDeleteRejectedConfirm, setShowDeleteRejectedConfirm] = useState(false);

  const [showBulkJoiningDateModal, setShowBulkJoiningDateModal] = useState(false);
  const [bulkJoiningDate, setBulkJoiningDate] = useState("");
  const [updatingBulkJoining, setUpdatingBulkJoining] = useState(false);
  const [interns, setInterns] = useState([]);
  const [departmentIncharges, setDepartmentIncharges] = useState([]);
  const [hrManagers, setHrManagers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [performance, setPerformance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [showEmailCopy, setShowEmailCopy] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("interns"); // "interns", "incharges", "hr", "loginLogs", "warningLogs", or "settings"
  const [loginLogs, setLoginLogs] = useState([]);
  const [loginLogSearch, setLoginLogSearch] = useState("");
  const [loginLogStartDate, setLoginLogStartDate] = useState("");
  const [loginLogEndDate, setLoginLogEndDate] = useState("");
  
  // Pagination States
  const [internsCurrentPage, setInternsCurrentPage] = useState(1);
  const [inchargesCurrentPage, setInchargesCurrentPage] = useState(1);
  const [hrCurrentPage, setHrCurrentPage] = useState(1);
  const [loginLogsCurrentPage, setLoginLogsCurrentPage] = useState(1);
  const [warningLogsCurrentPage, setWarningLogsCurrentPage] = useState(1);
  const [terminationAppealsCurrentPage, setTerminationAppealsCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when active tab or filters change
  useEffect(() => {
    setInternsCurrentPage(1);
    setInchargesCurrentPage(1);
    setHrCurrentPage(1);
    setLoginLogsCurrentPage(1);
    setWarningLogsCurrentPage(1);
    setTerminationAppealsCurrentPage(1);
  }, [activeTab, search, status, performance, showSelectedOnly, loginLogSearch, loginLogStartDate, loginLogEndDate]);

  const [applicationSettings, setApplicationSettings] = useState({
    isApplicationOpen: true
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const navigate = useNavigate();
  const printRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "interns" || activeTab === "warningLogs" || activeTab === "terminationAppeals") {
        fetchInterns();
      } else if (activeTab === "incharges") {
        fetchDepartmentIncharges();
      } else if (activeTab === "hr") {
        fetchHRManagers();
      } else if (activeTab === "loginLogs") {
        fetchLoginLogs();
      } else if (activeTab === "settings") {
        fetchApplicationSettings();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, performance, activeTab, loginLogSearch, loginLogStartDate, loginLogEndDate]);

  // Add this function
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

  const handleApproveTermination = async (internId) => {
    if (!window.confirm("Are you absolutely sure you want to approve this termination? This will terminate the intern's internship immediately.")) return;

    try {
      setLoading(true);
      const res = await axios.post(`/api/admin/interns/${internId}/approve-termination`, {}, { withCredentials: true });
      if (res.status === 200) {
        alert("✅ Intern terminated successfully!");
        fetchInterns();
      }
    } catch (err) {
      console.error("Error approving termination:", err);
      alert(err.response?.data?.message || "Failed to approve termination appeal");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTerminationAppeal = async (internId) => {
    if (!window.confirm("Are you sure you want to reject this termination appeal? The intern will remain active in the system.")) return;

    try {
      setLoading(true);
      const res = await axios.post(`/api/admin/interns/${internId}/reject-termination`, {}, { withCredentials: true });
      if (res.status === 200) {
        alert("✅ Appeal rejected. Intern status restored to active.");
        fetchInterns();
      }
    } catch (err) {
      console.error("Error rejecting appeal:", err);
      alert(err.response?.data?.message || "Failed to reject termination appeal");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllRejected = async () => {
    setDeletingRejected(true);
    try {
      const response = await axios.post("/api/admin/interns/delete",
        {},
        {
          withCredentials: true
        });

      if (response.data.success) {
        setCopySuccess(`✅ Successfully deleted ${response.data.deletedCount} rejected interns!`);
        await fetchInterns(); // Refresh the list
      } else {
        setCopySuccess("❌ Failed to delete rejected interns");
      }
      setTimeout(() => setCopySuccess(""), 5000);
      scrollToTop()

    } catch (err) {
      console.error("Error deleting rejected interns:", err);
      setCopySuccess("❌ Failed to delete rejected interns");
      setTimeout(() => setCopySuccess(""), 3000);
    }
    setDeletingRejected(false);
    setShowDeleteRejectedConfirm(false);
  };



  const generateBulkOfferLetters = async () => {
    const selectedInterns = interns.filter(intern => intern.status === "Selected");

    if (selectedInterns.length === 0) {
      setCopySuccess("No selected interns found to generate offer letters");
      setTimeout(() => setCopySuccess(""), 3000);
      return;
    }

    // Check if joining date is set
    if (!bulkJoiningDate) {
      setCopySuccess("Please set joining date first");
      setTimeout(() => setCopySuccess(""), 3000);
      return;
    }

    setGeneratingOffers(true);
    try {
      const response = await axios.post(
        "/api/admin/interns/bulk-offer-letters",
        {
          internIds: selectedInterns.map(intern => intern._id),
          joiningDate: bulkJoiningDate  // Add this line
        },
        {
          withCredentials: true,
          timeout: 300000
        }
      );

      setShowBulkOfferModal(false);
      // Clear the date

      if (response.data.success) {
        setCopySuccess(`✅ ${response.data.processed} offer letters generated!`);
        await fetchInterns(); // Refresh data to show new unique IDs
      } else {
        setCopySuccess("❌ Some offer letters failed");
      }
      setTimeout(() => setCopySuccess(""), 5000);

    } catch (err) {
      console.error("Error generating bulk offer letters:", err);
      setCopySuccess("❌ Failed to generate offer letters");
      setTimeout(() => setCopySuccess(""), 3000);
    }
    setGeneratingOffers(false);
  };





  // Fetch application settings
  const fetchApplicationSettings = async () => {
    try {
      const { data } = await axios.get("/api/admin/settings", {
        withCredentials: true,
      });
      setApplicationSettings(data.settings || { isApplicationOpen: true });
      await fetchDepartmentIncharges();
      await fetchHRManagers();
      await fetchInterns(); // if you need intern count too
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load application settings");
    }
  };

  // Handle settings toggle with password
  const handleToggleApplication = async () => {
    setShowPasswordModal(true);
    setPassword("");
    setPasswordError("");
  };

  const confirmToggleApplication = async () => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    setUpdatingSettings(true);
    try {
      const newStatus = !applicationSettings.isApplicationOpen;
      await axios.put(
        "/api/admin/settings/application-status",
        {
          isApplicationOpen: newStatus,
          password: password
        },
        { withCredentials: true }
      );

      setApplicationSettings(prev => ({
        ...prev,
        isApplicationOpen: newStatus
      }));
      setShowPasswordModal(false);
      setPassword("");

      setCopySuccess(`Applications ${newStatus ? 'opened' : 'closed'} successfully!`);
      setTimeout(() => setCopySuccess(""), 3000);
    } catch (err) {
      console.error("Error updating application status:", err);
      if (err.response?.status === 401) {
        setPasswordError("Invalid password");
      } else {
        setPasswordError("Failed to update application status");
      }
    }
    setUpdatingSettings(false);
  };

  // Excel Export Functions
  const exportToExcel = (data, filename, columns) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.header] = col.accessor(item);
      });
      return row;
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Auto-size columns
    const maxWidth = columns.reduce((acc, col) => {
      acc[col.key] = Math.max(
        col.header.length,
        ...data.map(item => String(col.accessor(item)).length)
      );
      return acc;
    }, {});

    worksheet['!cols'] = columns.map(col => ({ width: maxWidth[col.key] + 2 }));

    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportInternsToExcel = () => {
    const columns = [
      { key: 'fullName', header: 'Full Name', accessor: (intern) => intern.fullName || 'Not provided' },
      { key: 'email', header: 'Email', accessor: (intern) => intern.email || 'Not provided' },
      { key: 'mobile', header: 'Mobile', accessor: (intern) => intern.mobile || 'Not provided' },
      { key: 'dob', header: 'Date of Birth', accessor: (intern) => intern.dob || 'Not provided' },
      { key: 'gender', header: 'Gender', accessor: (intern) => intern.gender || 'Not provided' },
      { key: 'state', header: 'State', accessor: (intern) => intern.state || 'Not provided' },
      { key: 'city', header: 'City', accessor: (intern) => intern.city || 'Not provided' },
      { key: 'address', header: 'Address', accessor: (intern) => intern.address || 'Not provided' },
      { key: 'pinCode', header: 'Pin Code', accessor: (intern) => intern.pinCode || 'Not provided' },
      { key: 'college', header: 'College', accessor: (intern) => intern.college || 'Not provided' },
      { key: 'course', header: 'Course', accessor: (intern) => intern.course || 'Not provided' },
      { key: 'educationLevel', header: 'Education Level', accessor: (intern) => intern.educationLevel || 'Not provided' },
      { key: 'domain', header: 'Domain', accessor: (intern) => intern.domain || 'Not specified' },
      { key: 'contactMethod', header: 'Contact Method', accessor: (intern) => intern.contactMethod || 'Not provided' },
      { key: 'resumeUrl', header: 'Resume', accessor: (intern) => intern.resumeUrl || 'Not provided' },
      { key: 'duration', header: 'Duration', accessor: (intern) => intern.duration || 'Not specified' },
      { key: 'prevInternship', header: 'Previous Internship', accessor: (intern) => intern.prevInternship || 'No' },
      { key: 'performance', header: 'Performance', accessor: (intern) => intern.performance || 'Average' },
      { key: 'status', header: 'Status', accessor: (intern) => intern.status || 'Applied' },
      { key: 'uniqueId', header: 'Unique ID', accessor: (intern) => intern.uniqueId || 'Not assigned' },
      { key: 'warningCount', header: 'Warnings Sent', accessor: (intern) => intern.warningCount || 0 },
      { key: 'TpoName', header: 'TPO Name', accessor: (intern) => intern.TpoName || '-' },
      { key: 'TpoEmail', header: 'TPO Email', accessor: (intern) => intern.TpoEmail || '-' },
      { key: 'TpoNumber', header: 'TPO Number', accessor: (intern) => intern.TpoNumber || '-' },
      { key: 'joiningDate', header: 'Joining Date', accessor: (intern) => intern.joiningDate || '-' },
      { key: 'createdAt', header: 'Applied Date', accessor: (intern) => new Date(intern.createdAt).toLocaleDateString() },

    ];


    exportToExcel(filteredInterns, 'Interns_Report', columns);
    setCopySuccess("✅ Interns data exported to Excel!");
    setTimeout(() => setCopySuccess(""), 3000);
  };

  const exportInchargesToExcel = () => {
    const columns = [
      { key: 'fullName', header: 'Full Name', accessor: (incharge) => incharge.fullName },
      { key: 'email', header: 'Email', accessor: (incharge) => incharge.email },
      { key: 'mobile', header: 'Mobile', accessor: (incharge) => incharge.mobile || 'Not provided' },
      { key: 'departments', header: 'Departments', accessor: (incharge) => incharge.departments?.join(', ') || 'Not specified' },
      { key: 'status', header: 'Status', accessor: (incharge) => incharge.status || 'Active' },
      { key: 'createdDate', header: 'Created Date', accessor: (incharge) => new Date(incharge.createdAt).toLocaleDateString() }
    ];

    exportToExcel(departmentIncharges, 'Department_Incharges_Report', columns);
    setCopySuccess("✅ Department Incharges data exported to Excel!");
    setTimeout(() => setCopySuccess(""), 3000);
  };

  const exportHRToExcel = () => {
    const columns = [
      { key: 'fullName', header: 'Full Name', accessor: (hr) => hr.fullName },
      { key: 'email', header: 'Email', accessor: (hr) => hr.email },
      { key: 'mobile', header: 'Mobile', accessor: (hr) => hr.mobile || 'Not provided' },
      { key: 'department', header: 'Department', accessor: (hr) => hr.department || 'HR' },
      { key: 'status', header: 'Status', accessor: (hr) => hr.status },
      { key: 'createdDate', header: 'Created Date', accessor: (hr) => new Date(hr.createdAt).toLocaleDateString() }
    ];

    exportToExcel(hrManagers, 'HR_Managers_Report', columns);
    setCopySuccess("✅ HR Managers data exported to Excel!");
    setTimeout(() => setCopySuccess(""), 3000);
  };

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/interns", {
        params: { search, status, performance },
        withCredentials: true,
      });
      const fetched = data.interns || [];
      setInterns(fetched.filter(intern => intern.status !== "Applied"));
    } catch (err) {
      console.error("Error fetching interns:", err);
      setError("Failed to load interns");
    }
    setLoading(false);
  };

  const fetchDepartmentIncharges = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/department-incharges", {
        withCredentials: true,
      });
      setDepartmentIncharges(data.incharges || []);
    } catch (err) {
      console.error("Error fetching department incharges:", err);
      setError("Failed to load department incharges");
    }
    setLoading(false);
  };

  const fetchHRManagers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/hr-managers", {
        withCredentials: true,
      });
      setHrManagers(data.hrManagers || []);
    } catch (err) {
      console.error("Error fetching HR managers:", err);
      setError("Failed to load HR managers");
    }
    setLoading(false);
  };

  const fetchLoginLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/login-logs", {
        params: {
          search: loginLogSearch || undefined,
          startDate: loginLogStartDate || undefined,
          endDate: loginLogEndDate || undefined,
        },
        withCredentials: true,
      });
      setLoginLogs(data.logs || []);
    } catch (err) {
      console.error("Error fetching login logs:", err);
      setError(err.response?.data?.message || "Failed to load login logs");
    }
    setLoading(false);
  };

  const exportLoginLogsCsv = () => {
    if (!loginLogs.length) {
      setCopySuccess("No login logs available to export");
      setTimeout(() => setCopySuccess(""), 3000);
      return;
    }

    const headers = [
      "Username",
      "Email",
      "Role",
      "DateTime",
      "Latitude",
      "Longitude",
      "IPAddress",
      "DeviceType",
      "BrowserDetails",
    ];

    const rows = loginLogs.map((log) => [
      log.username || "",
      log.email || "",
      log.role || "",
      log.loginAt ? new Date(log.loginAt).toLocaleString() : "",
      log.latitude ?? "",
      log.longitude ?? "",
      log.ipAddress || "",
      log.deviceType || "",
      log.browserDetails || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `login_logs_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportLoginLogsExcel = () => {
    if (!loginLogs.length) {
      setCopySuccess("No login logs available to export");
      setTimeout(() => setCopySuccess(""), 3000);
      return;
    }

    const excelRows = loginLogs.map((log) => ({
      Username: log.username || "",
      Email: log.email || "",
      Role: log.role || "",
      "Date & Time": log.loginAt ? new Date(log.loginAt).toLocaleString() : "",
      Latitude: log.latitude ?? "",
      Longitude: log.longitude ?? "",
      "IP Address": log.ipAddress || "",
      "Device Type": log.deviceType || "",
      "Browser Details": log.browserDetails || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Login Logs");
    XLSX.writeFile(workbook, `login_logs_${new Date().toISOString().split("T")[0]}.xlsx`);
  };
  const handleStatusUpdate = async (internId, newStatus) => {
    setUpdating(internId);
    try {
      await axios.put(
        `/api/admin/interns/${internId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      await fetchInterns();
    } catch (err) {
      console.error("Error updating status:", err);

      // Show specific error message from backend
      if (err.response?.data?.message) {
        setCopySuccess(`❌ ${err.response.data.message}`);
      } else {
        setCopySuccess("❌ Failed to update status");
      }
      setTimeout(() => setCopySuccess(""), 5000);
      scrollToTop()
    }
    setUpdating(null);
  };


  const handleBulkJoiningDateUpdate = async () => {
    if (!bulkJoiningDate) {
      setCopySuccess("Please select a joining date");
      setTimeout(() => setCopySuccess(""), 3000);
      return;
    }

    const selectedInterns = interns.filter(intern => intern.status === "Selected");
    if (selectedInterns.length === 0) {
      setCopySuccess("No selected interns found to update");
      setTimeout(() => setCopySuccess(""), 3000);
      return;
    }

    setUpdatingBulkJoining(true);
    try {
      await axios.put(
        "/api/admin/interns/bulk-joining-date",
        {
          internIds: selectedInterns.map(intern => intern._id),
          joiningDate: bulkJoiningDate
        },
        { withCredentials: true }
      );

      await fetchInterns();
      setShowBulkJoiningDateModal(false);

      setCopySuccess(`✅ Joining date updated for ${selectedInterns.length} selected interns!`);
      setTimeout(() => setCopySuccess(""), 3000);
    } catch (err) {
      console.error("Error updating bulk joining date:", err);
      setCopySuccess("❌ Failed to update joining dates");
      setTimeout(() => setCopySuccess(""), 3000);
    }
    setUpdatingBulkJoining(false);
  };

  const handlePerformanceUpdate = async (internId, newPerformance) => {
    setUpdating(internId);
    try {
      await axios.put(
        `/api/admin/interns/${internId}/performance`,
        { performance: newPerformance },
        { withCredentials: true }
      );
      await fetchInterns();
    } catch (err) {
      console.error("Error updating performance:", err);
      setError("Failed to update performance");
    }
    setUpdating(null);
  };

  const handleDomainUpdate = async (internId, newDomain) => {
    setUpdating(internId);
    try {
      await axios.put(
        `/api/admin/interns/${internId}/domain`,
        { domain: newDomain },
        { withCredentials: true }
      );
      await fetchInterns();
    } catch (err) {
      console.error("Error updating domain:", err);
      setError("Failed to update domain");
    }
    setUpdating(null);
  };

  const handleDeleteIntern = async (internId) => {
    setUpdating(internId);
    try {
      await axios.delete(`/api/admin/interns/${internId}`, {
        withCredentials: true
      });
      setShowDeleteConfirm(null);
      await fetchInterns();
    } catch (err) {
      console.error("Error deleting intern:", err);
      setError("Failed to delete intern");
    }
    setUpdating(null);
  };

  const handleDeleteIncharge = async (inchargeId) => {
    setUpdating(inchargeId);
    try {
      await axios.delete(`/api/admin/department-incharges/${inchargeId}`, {
        withCredentials: true
      });
      setShowDeleteConfirm(null);
      await fetchDepartmentIncharges();
    } catch (err) {
      console.error("Error deleting department incharge:", err);
      setError("Failed to delete department incharge");
    }
    setUpdating(null);
  };

  const handleDeleteHR = async (hrId) => {
    setUpdating(hrId);
    try {
      await axios.delete(`/api/admin/hr-managers/${hrId}`, {
        withCredentials: true
      });
      setShowDeleteConfirm(null);
      await fetchHRManagers();
    } catch (err) {
      console.error("Error deleting HR manager:", err);
      setError("Failed to delete HR manager");
    }
    setUpdating(null);
  };

  const handleHRStatusUpdate = async (hrId, newStatus) => {
    setUpdating(hrId);
    try {
      await axios.put(
        `/api/admin/hr-managers/${hrId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      await fetchHRManagers();
    } catch (err) {
      console.error("Error updating HR status:", err);
      setError("Failed to update HR status");
    }
    setUpdating(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/admin/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('user');
      navigate("/login", { replace: true });
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    const title = activeTab === "interns"
      ? "Admin Dashboard - Interns Report"
      : activeTab === "incharges"
        ? "Admin Dashboard - Department Incharges Report"
        : "Admin Dashboard - HR Managers Report";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .print-header h1 {
              margin: 0 0 10px 0;
              color: #1f2937;
            }
            .print-header p {
              margin: 0;
              color: #6b7280;
            }
            .print-stats {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .stat-card {
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #e5e7eb;
            }
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .stat-label {
              font-size: 14px;
              color: #6b7280;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #7c3aed;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .status-badge, .performance-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-Applied { 
              background-color: #dbeafe; 
              color: #1e40af; 
            }
            .status-Selected { 
              background-color: #dcfce7; 
              color: #166534; 
            }
            .status-Rejected { 
              background-color: #fee2e2; 
              color: #991b1b; 
            }
            .status-Active { 
              background-color: #dcfce7;
              color: #166534;
            }
            .status-Inactive { 
              background-color: #f3f4f6;
              color: #4b5563;
            }
            .status-Completed { 
              background-color: #f0fdf4;
              color: #166534;
            }
            .performance-Average { 
              background-color: #fef3c7; 
              color: #92400e; 
            }
            .performance-Good { 
              background-color: #dcfce7; 
              color: #166534; 
            }
            .performance-Excellent { 
              background-color: #e0e7ff; 
              color: #3730a3; 
            }
            .print-footer {
              margin-top: 30px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Graphura - Admin Dashboard Report</h1>
            <p>${activeTab === "interns" ? "Intern Applications and Performance Report" : activeTab === "incharges" ? "Department Incharges Management Report" : "HR Managers Management Report"}</p>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          ${printContent.innerHTML}
          
          <div class="print-footer">
            <p>Confidential - For Admin Use Only</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getSelectedInternsEmails = () => {
    const selectedInterns = interns.filter(intern => intern.status === "Selected");
    return selectedInterns
      .map(intern => intern.email)
      .filter(email => email)
      .join("; ");
  };

  const copySelectedEmails = async () => {
    const emails = getSelectedInternsEmails();
    if (!emails) {
      setCopySuccess("No selected interns found to copy emails");
      setTimeout(() => setCopySuccess(""), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(emails);
      setCopySuccess("✅ Emails copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 3000);
    } catch (err) {
      console.error("Failed to copy emails:", err);
      setCopySuccess("❌ Failed to copy emails");
      setTimeout(() => setCopySuccess(""), 3000);
    }
  };

  const openEmailClient = () => {
    const emails = getSelectedInternsEmails();
    if (!emails) {
      setCopySuccess("No selected interns found to email");
      setTimeout(() => setCopySuccess(""), 3000);
      return;
    }
    window.location.href = `mailto:${emails}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Selected": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Applied": return "bg-blue-100 text-blue-800";
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "Excellent": return "bg-purple-100 text-purple-800";
      case "Good": return "bg-green-100 text-green-800";
      case "Average": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredInterns = showSelectedOnly
    ? interns.filter(intern => intern.status === "Selected")
    : interns;

  const selectedCount = interns.filter(intern => intern.status === "Selected").length;

  // Render Department Incharges Table
  const renderInchargesTable = () => {
    const startIndex = (inchargesCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedIncharges = departmentIncharges.slice(startIndex, endIndex);
    const totalPages = Math.ceil(departmentIncharges.length / itemsPerPage);

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">Name</th>
              <th className="p-4 text-left font-semibold">Email</th>
              <th className="p-4 text-left font-semibold">Departments</th>
              <th className="p-4 text-left font-semibold">Mobile</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedIncharges.map((incharge) => (
              <tr key={incharge._id} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="p-4">
                  <div className="font-semibold text-gray-800">{incharge.fullName}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-700">{incharge.email}</div>
                </td>
                <td className="p-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                    {incharge.departments?.join(" || ") || "Not specified"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-gray-700">📞 {incharge.mobile || "Not provided"}</div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${incharge.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                    }`}>
                    {incharge.status || "Active"}
                  </span>
                </td>
                <td className="p-4 no-print">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/Admin-Dashboard/incharge/${incharge._id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(`incharge-${incharge._id}`)}
                      disabled={updating === incharge._id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
            <div className="text-xs sm:text-sm text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-700">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(endIndex, departmentIncharges.length)}
              </span>{" "}
              of <span className="font-semibold text-gray-700">{departmentIncharges.length}</span> entries
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setInchargesCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={inchargesCurrentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                &larr; Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - inchargesCurrentPage) <= 1)
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
                    )}
                    <button
                      onClick={() => setInchargesCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                        inchargesCurrentPage === page
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-200"
                          : "text-gray-600 bg-white hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => setInchargesCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={inchargesCurrentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render HR Managers Table
  const renderHRTable = () => {
    const startIndex = (hrCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHR = hrManagers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(hrManagers.length / itemsPerPage);

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">HR Manager Details</th>
              <th className="p-4 text-left font-semibold">Contact Info</th>
              <th className="p-4 text-left font-semibold">Department</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedHR.map((hr) => (
              <tr key={hr._id} className="hover:bg-pink-50 transition-colors duration-150">
                <td className="p-4">
                  <div>
                    <div className="font-semibold text-gray-800">{hr.fullName}</div>
                    <div className="text-sm text-gray-600">{hr.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-gray-700">📞 {hr.mobile || "Not provided"}</div>
                </td>
                <td className="p-4">
                  <span className="inline-block bg-pink-100 text-pink-800 text-sm px-2 py-1 rounded-full">
                    {hr.department || "HR"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="print-only">
                    <span className={`status-badge status-${hr.status}`}>
                      {hr.status}
                    </span>
                  </div>
                  <select
                    value={hr.status}
                    onChange={(e) => handleHRStatusUpdate(hr._id, e.target.value)}
                    disabled={updating === hr._id}
                    className={`${getStatusColor(hr.status)} px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-pink-500 cursor-pointer no-print`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td> 
                <td className="p-4 no-print">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(`hr-${hr._id}`)}
                      disabled={updating === hr._id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
            <div className="text-xs sm:text-sm text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-700">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(endIndex, hrManagers.length)}
              </span>{" "}
              of <span className="font-semibold text-gray-700">{hrManagers.length}</span> entries
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setHrCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={hrCurrentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                &larr; Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - hrCurrentPage) <= 1)
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
                    )}
                    <button
                      onClick={() => setHrCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                        hrCurrentPage === page
                          ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-200"
                          : "text-gray-600 bg-white hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => setHrCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={hrCurrentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Settings Tab
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Settings</h2>
        <p className="text-gray-600 mb-6">Control the application submission status and other system settings.</p>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Internship Applications
              </h3>
              <p className="text-gray-600 text-sm">
                {applicationSettings.isApplicationOpen
                  ? "Applications are currently OPEN for submissions"
                  : "Applications are currently CLOSED for submissions"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${applicationSettings.isApplicationOpen
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
                }`}>
                {applicationSettings.isApplicationOpen ? "OPEN" : "CLOSED"}
              </span>
              <button
                onClick={handleToggleApplication}
                disabled={updatingSettings}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${applicationSettings.isApplicationOpen
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
                  } disabled:opacity-50`}
              >
                {updatingSettings ? "Updating..." : applicationSettings.isApplicationOpen ? "Close Applications" : "Open Applications"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-gray-700 mb-2">Current Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interns:</span>
                <span className="font-medium">{interns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department Incharges:</span>
                <span className="font-medium">{departmentIncharges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HR Managers:</span>
                <span className="font-medium">{hrManagers.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-gray-700 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={exportInternsToExcel}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Export All Data to Excel
              </button>
              <button
                onClick={() => {
                  setActiveTab("interns");
                  setShowSelectedOnly(true);
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                View Selected Interns
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/90 sticky top-4 z-[100] rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 p-4 select-none transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left Brand and Title Block */}
            <div className="flex items-center gap-4">
              <img src={Graphura} alt="Graphura" className="h-9 w-auto object-contain hover:scale-105 transition-transform" />
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <h1 className="text-xs font-black text-slate-800 tracking-wider leading-none uppercase">ADMINISTRATION PANEL</h1>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                  Graphura India Private Limited
                </p>
              </div>
            </div>

            {/* Middle Quick Links Roster/Credentials Navigation */}
            <div className="flex flex-wrap items-center gap-6 lg:gap-8">
              {/* Navigation Menu Links */}
              <button
                onClick={() => navigate('/Admin-Dashboard/attendance')}
                className="text-xs font-semibold text-slate-650 hover:text-amber-600 transition-colors cursor-pointer relative py-2 flex items-center gap-1.5 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 transition-transform group-hover:scale-125 duration-150"></span>
                Check attendance
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
              </button>
              <button
                onClick={() => navigate('/Admin-Dashboard/leaves')}
                className="text-xs font-semibold text-slate-650 hover:text-blue-600 transition-colors cursor-pointer relative py-2 flex items-center gap-1.5 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 transition-transform group-hover:scale-125 duration-150"></span>
                Manage leaves
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
              </button>
              <button
                onClick={() => navigate('/admin/daily-tasks')}
                className="text-xs font-semibold text-slate-650 hover:text-purple-600 transition-colors cursor-pointer relative py-2 flex items-center gap-1.5 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/80 transition-transform group-hover:scale-125 duration-150"></span>
                Manage Intern task
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
              </button>
              <button
                onClick={() => navigate('/admin/manage-resignations')}
                className="text-xs font-semibold text-slate-650 hover:text-rose-600 transition-colors cursor-pointer relative py-2 flex items-center gap-1.5 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80 transition-transform group-hover:scale-125 duration-150"></span>
                Manage resignation
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
              </button>

              {/* Admin Tools Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowAdminToolsDropdown(!showAdminToolsDropdown)}
                  className="text-xs font-semibold text-slate-650 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5 py-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 transition-transform group-hover:scale-125 duration-150"></span>
                  Admin tools
                  <ChevronDown size={12} className={`text-slate-400 group-hover:text-emerald-500 transition-transform duration-200 ${showAdminToolsDropdown ? 'rotate-180 text-emerald-500' : ''}`} />
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 transition-transform duration-200 origin-left ${showAdminToolsDropdown ? 'scale-x-100' : 'scale-x-0'}`}></span>
                </button>

                {showAdminToolsDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl border border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] py-1.5 z-[200]">
                    <button
                      onClick={() => {
                        navigate('/Admin-Dashboard/generate-lor');
                        setShowAdminToolsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Generate LOR
                    </button>
                    <button
                      onClick={() => {
                        navigate('/Admin-Dashboard/generate-offer-letter');
                        setShowAdminToolsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Generate offer letter
                    </button>
                    <button
                      onClick={() => {
                        navigate('/Admin-Dashboard/generate-letterhead');
                        setShowAdminToolsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-650 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                      Type on letterhead
                    </button>
                    <button
                      onClick={() => {
                        navigate('/Admin-Dashboard/attendance-override');
                        setShowAdminToolsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1 pt-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Attendance override
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Profile Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-bold text-slate-700 leading-none">{storedUser?.fullName || "System Admin"}</p>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black mt-1">Super Admin</p>
              </div>
              <button
                onClick={handlePrint}
                className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all no-print cursor-pointer"
                title="Print Report"
              >
                <Printer size={14} />
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all duration-150 no-print cursor-pointer shadow-sm"
              >
                Logout
              </button>
            </div>

          </div>
        </div>

        {/* Email Copy Success Message */}
        {copySuccess && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative animate-fade-in">
            <span className="block sm:inline">{copySuccess}</span>
          </div>
        )}


        {/* Delete All Rejected Confirmation Modal */}
        {showDeleteRejectedConfirm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delete All Rejected Interns
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete all <strong>{interns.filter(intern => intern.status === 'Rejected').length}</strong> rejected interns?
                <span className="text-red-600 font-semibold block mt-2">This action cannot be undone!</span>
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Warning:</h4>
                <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                  <li>All rejected intern records will be permanently deleted</li>
                  <li>This action cannot be reversed</li>
                  <li>Associated data will be lost forever</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteRejectedConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllRejected}
                  disabled={deletingRejected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingRejected ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete All Rejected"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Offer Letter Modal */}
        {showBulkOfferModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Generate Offer Letters
              </h3>

              {console.log(bulkJoiningDate)}

              {/* Show current joining date */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">Joining Date:</span>
                  <span className="text-blue-600">{bulkJoiningDate || "Not set"}</span>
                </div>
                {!bulkJoiningDate && (
                  <p className="text-red-600 text-sm mt-2">
                    Please set joining date first using the "Set Joining Date" button
                  </p>
                )}
              </div>

              <p className="text-gray-600 mb-4">
                This will generate and send offer letters to all <strong>{selectedCount}</strong> selected interns.
                Unique IDs will be automatically generated and saved to database.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBulkOfferModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateBulkOfferLetters}
                  disabled={generatingOffers || !bulkJoiningDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {generatingOffers ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    "Generate Offer Letters"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Joining Date Modal */}
        {showBulkJoiningDateModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Set Joining Date for Selected Interns
              </h3>
              <p className="text-gray-600 mb-4">
                This will update the joining date for all <strong>{selectedCount}</strong> selected interns.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={bulkJoiningDate}
                  onChange={(e) => setBulkJoiningDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowBulkJoiningDateModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkJoiningDateUpdate}
                  disabled={updatingBulkJoining || !bulkJoiningDate}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {updatingBulkJoining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Joining Date"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}




        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this {
                  showDeleteConfirm.includes('incharge-') ? 'department incharge' :
                    showDeleteConfirm.includes('hr-') ? 'HR manager' : 'intern'
                }? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm.includes('incharge-')) {
                      handleDeleteIncharge(showDeleteConfirm.replace('incharge-', ''));
                    } else if (showDeleteConfirm.includes('hr-')) {
                      handleDeleteHR(showDeleteConfirm.replace('hr-', ''));
                    } else {
                      handleDeleteIntern(showDeleteConfirm);
                    }
                  }}
                  disabled={updating === showDeleteConfirm.replace(/^(incharge-|hr-)/, '')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {updating === showDeleteConfirm.replace(/^(incharge-|hr-)/, '') ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Confirm Application {applicationSettings.isApplicationOpen ? 'Closure' : 'Opening'}
              </h3>
              <p className="text-gray-600 mb-4">
                You are about to {applicationSettings.isApplicationOpen ? 'close' : 'open'} internship applications.
                Please enter your admin password to continue.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                    setPasswordError("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleApplication}
                  disabled={updatingSettings}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {updatingSettings ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-xl rounded-2xl p-6" ref={printRef}>
          {/* Tab Navigation */}
          <div className="mb-6 no-print">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("interns")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "interns"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                👥 Intern Management
              </button>
              <button
                onClick={() => setActiveTab("incharges")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "incharges"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                🏢 Department Incharges
              </button>
              <button
                onClick={() => setActiveTab("hr")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "hr"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                👨‍💼 HR Management
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "settings"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => setActiveTab("loginLogs")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "loginLogs"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                🔐 Login Logs
              </button>
              <button
                onClick={() => setActiveTab("warningLogs")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "warningLogs"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                ⚠️ Warning Logs
              </button>
              <button
                onClick={() => setActiveTab("terminationAppeals")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === "terminationAppeals"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                🚫 Termination Appeals
                {interns.filter(i => i.terminationAppeal).length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {interns.filter(i => i.terminationAppeal).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Interns Tab Content */}
          {activeTab === "interns" && (
            <>
              {/* Filters Section for Interns */}
              <div className="mb-8 no-print">
                {interns.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-8 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{interns.length}</div>
                      <div className="text-sm text-purple-800">Total Interns</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedCount}</div>
                      <div className="text-sm text-green-800">Selected</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {interns.filter(i => i.performance === 'Excellent').length}
                      </div>
                      <div className="text-sm text-purple-800">Excellent</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {interns.filter(i => i.performance === 'Good').length}
                      </div>
                      <div className="text-sm text-orange-800">Good</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {interns.filter(i => i.status === 'Active').length}
                      </div>
                      <div className="text-sm text-green-800">Active</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {interns.filter(i => i.status === 'Completed').length}
                      </div>
                      <div className="text-sm text-red-800">Completed</div>
                    </div>
                    <div
                      className="bg-indigo-50 rounded-lg p-4 flex flex-col text-center items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors border-2 border-indigo-200"
                      onClick={() => setShowEmailCopy(!showEmailCopy)}
                    >
                      <div className="text-2xl font-bold text-indigo-600"><Wrench /></div>
                      <div className="text-sm text-indigo-800">Selected Intern Tools</div>
                    </div>
                    <div
                      className="bg-green-50 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-100 transition-colors border-2 border-green-200"
                      onClick={exportInternsToExcel}
                    >
                      <div className="text-2xl font-bold text-green-600"><FileSpreadsheet /></div>
                      <div className="text-sm text-green-800">Export Excel</div>
                    </div>
                  </div>
                )}
                {/* Simple One-Click Delete Rejected Button */}
                {interns.filter(intern => intern.status === 'Rejected').length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowDeleteRejectedConfirm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg no-print flex items-center gap-2"
                    >
                      {deletingRejected ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Deleting... ({interns.filter(intern => intern.status === 'Rejected').length})
                        </>
                      ) : (
                        <>
                          🗑️ Delete All Rejected ({interns.filter(intern => intern.status === 'Rejected').length})
                        </>
                      )}
                    </button>
                  </div>
                )}
                {/* Email Tools Panel */}
                {showEmailCopy && selectedCount > 0 && (
                  <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                      📧 Email Selected Interns ({selectedCount})
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">

                      <button
                        onClick={copySelectedEmails}
                        className="px-4 py-2 bg-white text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors font-medium flex items-center gap-2"
                      >
                        <Copy /> Copy All Emails
                      </button>
                      <button
                        onClick={() => setShowBulkJoiningDateModal(true)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <Calendar />  Set Joining Date
                      </button>
                      <button
                        onClick={() => setShowBulkOfferModal(true)}
                        disabled={selectedCount === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle /> Generate
                      </button>
                      <button
                        onClick={openEmailClient}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <Mail /> Email Client
                      </button>
                      <div className="flex-1 bg-white rounded-lg px-3 py-2 border overflow-x-auto border-indigo-200 text-sm text-gray-600 flex items-center">
                        <span className="truncate">{getSelectedInternsEmails()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <h2 className="text-xl mt-4 font-semibold text-gray-800 mb-4">Filters & Search</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="🔍 Search by name, email, domain, college, course, etc..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <select
                    value={performance}
                    onChange={(e) => setPerformance(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Performance</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Poor">Poor</option>
                  </select>

                  <button
                    onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                    className={`border rounded-xl px-4 py-3 font-medium transition-all duration-200 ${showSelectedOnly
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    {showSelectedOnly ? '✅ Showing Selected' : '👥 Show All'}
                  </button>

                  {/* Add this in the email tools panel after the existing buttons */}

                </div>

                {/* Selected Only Notice */}
                {showSelectedOnly && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-800 font-medium">
                        Showing only selected interns ({filteredInterns.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSelectedOnly(false)}
                      className="text-green-600 hover:text-green-800 font-medium text-sm"
                    >
                      Show All
                    </button>
                  </div>
                )}
              </div>

              {/* Intern Table */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchInterns}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 no-print"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredInterns.length > 0 ? (() => {
                const startIndex = (internsCurrentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedInterns = filteredInterns.slice(startIndex, endIndex);
                const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);
                return (
                  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                    <table className="min-w-full text-sm text-gray-700">
                      <thead className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                        <tr>
                          <th className="p-3 text-center font-semibold whitespace-nowrap">Intern Details</th>
                          <th className="p-3 text-center font-semibold whitespace-nowrap">Contact / Applied</th>
                          <th className="p-3 text-center font-semibold whitespace-nowrap">Domain & Duration</th>
                          <th className="p-3 text-center font-semibold whitespace-nowrap">College Info</th>
                          <th className="p-3 text-center font-semibold whitespace-nowrap">Status</th>
                          <th className="p-3 text-center font-semibold whitespace-nowrap">Performance</th>
                          <th className="p-3 text-center font-semibold whitespace-nowrap">Domain</th>
                          <th className="p-3 text-center font-semibold no-print whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedInterns.map((intern) => (
                          <tr
                            key={intern._id}
                            className="hover:bg-purple-50 transition-colors duration-150"
                          >
                            {/* INTERN DETAILS */}
                             <td className="p-3">
                              <div className="font-semibold text-gray-800">{intern.fullName}</div>
                              <div className="text-xs text-gray-600 break-words">{intern.email}</div>
                              <div className="text-xs font-bold text-gray-600">{intern.uniqueId}</div>
                            </td>

                            {/* CONTACT INFO */}
                            <td className="p-3">
                              <div className="text-gray-700">📞 {intern.mobile || "Not provided"}</div>
                              <p className="text-xs font-bold text-gray-500 mt-1">
                                Applied:{" "}
                                {intern.updatedAt
                                  ? new Date(intern.updatedAt).toLocaleDateString()
                                  : "Not provided"}
                              </p>
                            </td>

                            {/* DOMAIN + DURATION */}
                            <td className="p-3">
                              <span className="inline-block bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full mb-1">
                                {intern.domain || "Not specified"}
                              </span>
                              <div className="text-sm text-gray-600">
                                ⏱️ {intern.duration || "Not specified"}
                              </div>
                              {intern.extendedDays > 0 && intern.status === "Active" && (
                                <div className="text-xs text-green-600 font-semibold mt-1">
                                  +{intern.extendedDays} days extended
                                </div>
                              )}
                            </td>

                            {/* COLLEGE */}
                            <td className="p-3 ">
                              <span
                                className={`text-xs md:text-sm ${intern.college
                                  ? "text-gray-700"
                                  : "text-gray-400 italic"
                                  }`}
                              >
                                {intern.college || "—"}
                              </span>
                            </td>

                            {/* STATUS */}
                            <td className="p-3">
                              <select
                                value={intern.status}
                                onChange={(e) => handleStatusUpdate(intern._id, e.target.value)}
                                disabled={intern.status === "Active"}
                                className={`${getStatusColor(
                                  intern.status
                                )} px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-purple-500 cursor-pointer no-print`}
                              >
                                <option value="Applied">Applied</option>
                                <option value="Selected">Selected</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>

                            {/* PERFORMANCE */}
                            <td className="p-3 text-center">
                              <select
                                value={intern.performance}
                                onChange={(e) =>
                                  handlePerformanceUpdate(intern._id, e.target.value)
                                }
                                disabled={updating === intern._id}
                                className={`${getPerformanceColor(
                                  intern.performance
                                )} px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-purple-500 cursor-pointer no-print mx-auto block`}
                              >
                                <option value="Good">Good</option>
                                <option value="Poor">Poor</option>
                                <option value="Excellent">Excellent</option>
                              </select>
                              {intern.warningCount > 0 && (
                                <div className="mt-1.5 flex items-center justify-center gap-1 bg-red-50 border border-red-200 text-red-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-black w-fit mx-auto shadow-sm">
                                  <span>⚠️ Warnings: {intern.warningCount}</span>
                                </div>
                              )}
                            </td>

                            {/* DOMAIN CHANGE */}
                            <td className="p-3">
                              <select
                                value={intern.domain}
                                onChange={(e) =>
                                  handleDomainUpdate(intern._id, e.target.value)
                                }
                                disabled={updating === intern._id}
                                className="px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-purple-500 cursor-pointer no-print"
                              >
                                <option>Sales & Marketing</option>
                                <option>Data & AI Intelligence</option>
                                <option>Data Science & Analytics</option>
                                <option>Human Resources</option>
                                <option>Social Media Management</option>
                                <option>Graphic Design</option>
                                <option>Digital Marketing</option>
                                <option>Video Editing</option>
                                <option>Full Stack Development</option>
                                <option>MERN Stack Development</option>
                                <option>Email and Outreaching</option>
                                <option>Content Writing</option>
                                <option>Content Creator</option>
                                <option>UI/UX Designing</option>
                                <option>Front-end Developer</option>
                                <option>Back-end Developer</option>
                              </select>
                            </td>

                            {/* ACTIONS */}
                            <td className="p-3 no-print">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() =>
                                    navigate(`/Admin-Dashboard/intern/${intern._id}`)
                                  }
                                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(intern._id)}
                                  disabled={updating === intern._id}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Premium Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          Showing <span className="font-semibold text-gray-700">{startIndex + 1}</span> to{" "}
                          <span className="font-semibold text-gray-700">
                            {Math.min(endIndex, filteredInterns.length)}
                          </span>{" "}
                          of <span className="font-semibold text-gray-700">{filteredInterns.length}</span> entries
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setInternsCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={internsCurrentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            &larr; Prev
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - internsCurrentPage) <= 1)
                            .map((page, index, array) => (
                              <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
                                )}
                                <button
                                  onClick={() => setInternsCurrentPage(page)}
                                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    internsCurrentPage === page
                                      ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-200"
                                      : "text-gray-600 bg-white hover:bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            ))}

                          <button
                            onClick={() => setInternsCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={internsCurrentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Next &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
              : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">
                    {showSelectedOnly ? "✅" : "👥"}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {showSelectedOnly
                      ? "No selected interns found"
                      : "No interns found"}
                  </h3>
                  <p className="text-gray-500">
                    {showSelectedOnly
                      ? "There are no interns with 'Selected' status"
                      : "Try adjusting your search or filters"}
                  </p>
                  {showSelectedOnly && (
                    <button
                      onClick={() => setShowSelectedOnly(false)}
                      className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Show All Interns
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Department Incharges Tab Content */}
          {activeTab === "incharges" && (
            <>
              {/* Stats for Department Incharges */}
              {departmentIncharges.length > 0 && (
                <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4 no-print">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{departmentIncharges.length}</div>
                    <div className="text-sm text-blue-800">Total Incharges</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {departmentIncharges.filter(i => i.status === 'Active').length}
                    </div>
                    <div className="text-sm text-green-800">Active</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {[...new Set(departmentIncharges.flatMap(i => i.departments))].length}
                    </div>
                    <div className="text-sm text-purple-800">Departments</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {departmentIncharges.filter(i => !i.status || i.status === 'Inactive').length}
                    </div>
                    <div className="text-sm text-orange-800">Inactive</div>
                  </div>
                  <div
                    className="bg-green-50 rounded-lg p-4 text-center cursor-pointer hover:bg-green-100 transition-colors border-2 border-green-200"
                    onClick={exportInchargesToExcel}
                  >
                    <div className="text-2xl font-bold text-green-600">📊</div>
                    <div className="text-sm text-green-800">Export Excel</div>
                  </div>
                </div>
              )}

              {/* Department Incharges Table */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchDepartmentIncharges}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 no-print"
                  >
                    Retry
                  </button>
                </div>
              ) : departmentIncharges.length > 0 ? (
                renderInchargesTable()
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏢</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Department Incharges Found</h3>
                  <p className="text-gray-500 mb-4">There are no department incharges registered yet.</p>
                </div>
              )}
            </>
          )}

          {/* HR Tab Content */}
          {activeTab === "hr" && (
            <>
              {/* Stats for HR */}
              {hrManagers.length > 0 && (
                <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4 no-print">
                  <div className="bg-pink-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-pink-600">{hrManagers.length}</div>
                    <div className="text-sm text-pink-800">Total HR</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {hrManagers.filter(hr => hr.status === 'Active').length}
                    </div>
                    <div className="text-sm text-green-800">Active</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {hrManagers.filter(hr => hr.status === 'Inactive').length}
                    </div>
                    <div className="text-sm text-gray-800">Inactive</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {[...new Set(hrManagers.map(hr => hr.department))].length}
                    </div>
                    <div className="text-sm text-blue-800">Departments</div>
                  </div>
                  <div
                    className="bg-green-50 rounded-lg p-4 text-center cursor-pointer hover:bg-green-100 transition-colors border-2 border-green-200"
                    onClick={exportHRToExcel}
                  >
                    <div className="text-2xl font-bold text-green-600">📊</div>
                    <div className="text-sm text-green-800">Export Excel</div>
                  </div>
                </div>
              )}

              {/* HR Table */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchHRManagers}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 no-print"
                  >
                    Retry
                  </button>
                </div>
              ) : hrManagers.length > 0 ? (
                renderHRTable()
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👨‍💼</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No HR Managers Found</h3>
                  <p className="text-gray-500">There are no HR managers registered yet.</p>
                </div>
              )}
            </>
          )}

          {/* Settings Tab Content */}
          {activeTab === "settings" && renderSettingsTab()}

          {/* Login Logs Tab Content */}
          {activeTab === "loginLogs" && (
            <>
              <div className="mb-6 no-print">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Search username, email, role, IP..."
                    value={loginLogSearch}
                    onChange={(e) => setLoginLogSearch(e.target.value)}
                    className="md:col-span-2 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="date"
                    value={loginLogStartDate}
                    onChange={(e) => setLoginLogStartDate(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={loginLogEndDate}
                    onChange={(e) => setLoginLogEndDate(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      setLoginLogSearch("");
                      setLoginLogStartDate("");
                      setLoginLogEndDate("");
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={exportLoginLogsCsv}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={exportLoginLogsExcel}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Export Excel
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchLoginLogs}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 no-print"
                  >
                    Retry
                  </button>
                </div>
              ) : loginLogs.length > 0 ? (() => {
                const startIndex = (loginLogsCurrentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedLoginLogs = loginLogs.slice(startIndex, endIndex);
                const totalPages = Math.ceil(loginLogs.length / itemsPerPage);
                return (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                        <tr>
                          <th className="p-4 text-left font-semibold">Username</th>
                          <th className="p-4 text-left font-semibold">Role</th>
                          <th className="p-4 text-left font-semibold">Date & Time</th>
                          <th className="p-4 text-left font-semibold">Latitude</th>
                          <th className="p-4 text-left font-semibold">Longitude</th>
                          <th className="p-4 text-left font-semibold">IP Address</th>
                          <th className="p-4 text-left font-semibold">Device</th>
                          <th className="p-4 text-left font-semibold">Browser</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedLoginLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-orange-50 transition-colors duration-150">
                            <td className="p-4">
                              <div className="font-semibold text-gray-800">{log.username}</div>
                              <div className="text-xs text-gray-600">{log.email}</div>
                            </td>
                            <td className="p-4">{log.role}</td>
                            <td className="p-4">{new Date(log.loginAt).toLocaleString()}</td>
                            <td className="p-4">{Number(log.latitude).toFixed(6)}</td>
                            <td className="p-4">{Number(log.longitude).toFixed(6)}</td>
                            <td className="p-4">{log.ipAddress || "Unknown"}</td>
                            <td className="p-4">{log.deviceType || "Unknown"}</td>
                            <td className="p-4">{log.browserDetails || "Unknown"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          Showing <span className="font-semibold text-gray-700">{startIndex + 1}</span> to{" "}
                          <span className="font-semibold text-gray-700">
                            {Math.min(endIndex, loginLogs.length)}
                          </span>{" "}
                          of <span className="font-semibold text-gray-700">{loginLogs.length}</span> entries
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setLoginLogsCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={loginLogsCurrentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            &larr; Prev
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - loginLogsCurrentPage) <= 1)
                            .map((page, index, array) => (
                              <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
                                )}
                                <button
                                  onClick={() => setLoginLogsCurrentPage(page)}
                                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    loginLogsCurrentPage === page
                                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-200"
                                      : "text-gray-600 bg-white hover:bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            ))}

                          <button
                            onClick={() => setLoginLogsCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={loginLogsCurrentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Next &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
              : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔐</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No login logs found</h3>
                  <p className="text-gray-500">Login activity will appear here after successful sign-ins.</p>
                </div>
              )}
            </>
          )}

          {/* Warning Logs Tab Content */}
          {activeTab === "warningLogs" && (() => {
            const warningLogsList = [];
            interns.forEach(intern => {
              const attPercentage = intern.totalMeetings > 0 
                ? ((intern.meetingsAttended / intern.totalMeetings) * 100).toFixed(1) + "%" 
                : "0%";

              if (intern.warningHistory && intern.warningHistory.length > 0) {
                intern.warningHistory.forEach((warn, index) => {
                  warningLogsList.push({
                    id: `${intern._id}-${index}`,
                    internId: intern._id,
                    fullName: intern.fullName,
                    email: intern.email,
                    uniqueId: intern.uniqueId || "N/A",
                    domain: intern.domain,
                    warningNumber: index + 1,
                    date: warn.date,
                    reason: warn.reason || "3 consecutive absences marked",
                    totalMeetings: intern.totalMeetings || 0,
                    meetingsAttended: intern.meetingsAttended || 0,
                    attendancePercentage: attPercentage
                  });
                });
              } else if (intern.warningCount > 0) {
                for (let i = 0; i < intern.warningCount; i++) {
                  warningLogsList.push({
                    id: `${intern._id}-legacy-${i}`,
                    internId: intern._id,
                    fullName: intern.fullName,
                    email: intern.email,
                    uniqueId: intern.uniqueId || "N/A",
                    domain: intern.domain,
                    warningNumber: i + 1,
                    date: intern.updatedAt || intern.createdAt,
                    reason: "Consecutive absences marked",
                    totalMeetings: intern.totalMeetings || 0,
                    meetingsAttended: intern.meetingsAttended || 0,
                    attendancePercentage: attPercentage
                  });
                }
              }
            });

            // Sort warningLogsList by date descending
            warningLogsList.sort((a, b) => new Date(b.date) - new Date(a.date));

            const filteredWarningLogs = warningLogsList.filter(log => {
              if (!search) return true;
              const query = search.toLowerCase();
              return (
                log.fullName.toLowerCase().includes(query) ||
                log.email.toLowerCase().includes(query) ||
                log.uniqueId.toLowerCase().includes(query) ||
                log.domain.toLowerCase().includes(query) ||
                log.reason.toLowerCase().includes(query)
              );
            });

            const startIndex = (warningLogsCurrentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedWarningLogs = filteredWarningLogs.slice(startIndex, endIndex);
            const totalPages = Math.ceil(filteredWarningLogs.length / itemsPerPage);

            return (
              <>
                <div className="mb-6 no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md w-full">
                    <input
                      type="text"
                      placeholder="🔍 Search warning logs by name, email, domain, reason..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="bg-red-50 rounded-lg px-4 py-3 border border-red-200 text-center flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="text-red-800 font-bold">Total Warnings Dispatched: {warningLogsList.length}</span>
                  </div>
                </div>

                {filteredWarningLogs.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm text-gray-700">
                      <thead className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
                        <tr>
                          <th className="p-4 text-left font-semibold">Intern Details</th>
                          <th className="p-4 text-left font-semibold">Department</th>
                          <th className="p-4 text-center font-semibold">Warning Status</th>
                          <th className="p-4 text-center font-semibold">Meetings (Attended / Total)</th>
                          <th className="p-4 text-center font-semibold">Attendance %</th>
                          <th className="p-4 text-left font-semibold">Date & Time</th>
                          <th className="p-4 text-center font-semibold no-print">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedWarningLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-red-50/30 transition-colors duration-150">
                            <td className="p-4">
                              <div className="font-semibold text-gray-800">{log.fullName}</div>
                              <div className="text-xs text-gray-600 break-words">{log.email}</div>
                              <div className="text-xs font-mono font-bold text-gray-500 mt-0.5">{log.uniqueId}</div>
                            </td>
                            <td className="p-4">
                              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                                {log.domain}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                Warning #{log.warningNumber}
                              </span>
                            </td>
                            <td className="p-4 text-center font-semibold text-gray-700">
                              <span className="text-emerald-600 font-bold">{log.meetingsAttended}</span> / {log.totalMeetings}
                            </td>
                            <td className="p-4 text-center font-bold text-gray-800">
                              {log.attendancePercentage}
                            </td>
                            <td className="p-4 text-gray-600 font-semibold">
                              📅 {new Date(log.date).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true
                              })}
                            </td>
                            <td className="p-4 no-print text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() =>
                                    navigate(`/Admin-Dashboard/intern/${log.internId}`)
                                  }
                                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center shadow"
                                  title="View Profile"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(log.internId)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center shadow"
                                  title="Delete Intern"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          Showing <span className="font-semibold text-gray-700">{startIndex + 1}</span> to{" "}
                          <span className="font-semibold text-gray-700">
                            {Math.min(endIndex, filteredWarningLogs.length)}
                          </span>{" "}
                          of <span className="font-semibold text-gray-700">{filteredWarningLogs.length}</span> entries
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setWarningLogsCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={warningLogsCurrentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            &larr; Prev
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - warningLogsCurrentPage) <= 1)
                            .map((page, index, array) => (
                              <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
                                )}
                                <button
                                  onClick={() => setWarningLogsCurrentPage(page)}
                                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    warningLogsCurrentPage === page
                                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-200"
                                      : "text-gray-600 bg-white hover:bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            ))}

                          <button
                            onClick={() => setWarningLogsCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={warningLogsCurrentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Next &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No warning logs found</h3>
                    <p className="text-gray-500">There are no warning letters sent to interns matching your search.</p>
                  </div>
                )}
              </>
            );
          })()}

          {activeTab === "terminationAppeals" && (() => {
            const appealsList = interns.filter(intern => intern.terminationAppeal === true);

            const filteredAppeals = appealsList.filter(log => {
              if (!search) return true;
              const query = search.toLowerCase();
              return (
                log.fullName.toLowerCase().includes(query) ||
                log.email.toLowerCase().includes(query) ||
                (log.uniqueId && log.uniqueId.toLowerCase().includes(query)) ||
                log.domain.toLowerCase().includes(query) ||
                (log.terminationAppealReason && log.terminationAppealReason.toLowerCase().includes(query))
              );
            });

            const startIndex = (terminationAppealsCurrentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedAppeals = filteredAppeals.slice(startIndex, endIndex);
            const totalPages = Math.ceil(filteredAppeals.length / itemsPerPage);

            return (
              <>
                <div className="mb-6 no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md w-full">
                    <input
                      type="text"
                      placeholder="Search appeals by name, email, or reason..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm font-semibold transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-800 font-extrabold text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                      Pending Appeals: {appealsList.length}
                    </span>
                  </div>
                </div>

                {paginatedAppeals.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Intern Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Department & Stats
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Meetings (Attended / Total)
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Appeal Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedAppeals.map((intern) => {
                          const attPercentage = intern.totalMeetings > 0 
                            ? ((intern.meetingsAttended / intern.totalMeetings) * 100).toFixed(1) + "%" 
                            : "0%";

                          return (
                            <tr key={intern._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-gray-900">{intern.fullName}</div>
                                <div className="text-xs text-gray-500 mt-0.5">ID: {intern.uniqueId || "N/A"}</div>
                                <div className="text-xs text-gray-500">{intern.email}</div>
                                <div className="text-xs text-gray-500">📞 {intern.mobile || "N/A"}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-bold">
                                  {intern.domain}
                                </span>
                                <div className="text-xs font-bold text-amber-600 mt-1">
                                  ⚠️ Warnings Count: {intern.warningCount || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-black text-emerald-600">
                                  {intern.meetingsAttended || 0}
                                </span>
                                <span className="text-sm font-semibold text-gray-400">
                                  {" "}
                                  / {intern.totalMeetings || 0}
                                </span>
                                <div className="text-xs font-semibold text-gray-500 mt-0.5">
                                  Rate: {attPercentage}
                                </div>
                              </td>
                              <td className="px-6 py-4 max-w-xs">
                                <div className="text-xs font-semibold text-gray-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed break-words">
                                  {intern.terminationAppealReason || "No reason specified."}
                                </div>
                                {intern.terminationAppealDate && (
                                  <div className="text-[10px] text-gray-400 mt-1">
                                    Date: {new Date(intern.terminationAppealDate).toLocaleString()}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleApproveTermination(intern._id)}
                                    className="px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 text-xs font-bold shadow-md shadow-red-100"
                                  >
                                    Approve Term.
                                  </button>
                                  <button
                                    onClick={() => handleRejectTerminationAppeal(intern._id)}
                                    className="px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-xs font-bold shadow-sm"
                                  >
                                    Reject Appeal
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          Showing <span className="font-semibold text-gray-700">{startIndex + 1}</span> to{" "}
                          <span className="font-semibold text-gray-700">
                            {Math.min(endIndex, filteredAppeals.length)}
                          </span>{" "}
                          of <span className="font-semibold text-gray-700">{filteredAppeals.length}</span> entries
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setTerminationAppealsCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={terminationAppealsCurrentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            &larr; Prev
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setTerminationAppealsCurrentPage(page)}
                              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                                terminationAppealsCurrentPage === page
                                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-200"
                                  : "text-gray-600 bg-white hover:bg-gray-50 border border-gray-200"
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => setTerminationAppealsCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={terminationAppealsCurrentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Next &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-gray-300 text-6xl mb-4">🛡️</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Termination Appeals</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">There are currently no pending appeals for intern termination submitted by any Incharges.</p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
