import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Graphura from "../../../public/GraphuraLogo.jpg";
import { Eye, FileText, Download, Upload, X, Mail, Calendar, Clock, Link as LinkIcon, UserCheck, History, AlertTriangle, UserX, ChevronDown, LogOut, Briefcase, Users, UserMinus } from "lucide-react";
import * as XLSX from "xlsx";

const EXPORTABLE_FIELDS = [
  { id: "fullName", label: "Full Name", default: true },
  { id: "email", label: "Email Address", default: true },
  { id: "mobile", label: "Mobile Number", default: true },
  { id: "domain", label: "Domain", default: true },
  { id: "duration", label: "Duration", default: true },
  { id: "college", label: "College", default: true },
  { id: "status", label: "Application Status", default: true },
  { id: "performance", label: "Performance", default: true },
  { id: "uniqueId", label: "Unique ID", default: true },
  { id: "joiningDate", label: "Joining Date", default: true },
  { id: "createdAt", label: "Applied Date", default: true },
  { id: "resumeUrl", label: "Resume URL", default: false },
  { id: "dob", label: "Date of Birth", default: false },
  { id: "gender", label: "Gender", default: false },
  { id: "state", label: "State", default: false },
  { id: "city", label: "City", default: false },
  { id: "address", label: "Full Address", default: false },
  { id: "pinCode", label: "Pin Code", default: false },
  { id: "course", label: "Course / Branch", default: false },
  { id: "educationLevel", label: "Education Level", default: false },
  { id: "contactMethod", label: "Contact Method", default: false },
  { id: "prevInternship", label: "Previous Internship", default: false },
  { id: "TpoName", label: "TPO Name", default: false },
  { id: "TpoEmail", label: "TPO Email", default: false },
  { id: "TpoNumber", label: "TPO Phone", default: false }
];

const HRDashboard = () => {
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const basePath = storedUser?.role === "HR Manager" ? "/HR-Manager-Dashboard" : "/HR-Dashboard";
  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [performance, setPerformance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [showEmailCopy, setShowEmailCopy] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [showCustomExportModal, setShowCustomExportModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState(
    EXPORTABLE_FIELDS.filter(f => f.default).map(f => f.id)
  );
  const [customExportFileName, setCustomExportFileName] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, performance, showSelectedOnly]);

  // Listen to remote page actions
  useEffect(() => {
    if (location.state?.triggerImport) {
      setShowImportModal(true);
      window.history.replaceState({}, document.title);
    }
    if (location.state?.triggerExport) {
      exportToExcel();
      window.history.replaceState({}, document.title);
    }
    if (location.state?.triggerCustomExport) {
      setShowCustomExportModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Import functionality states
  const [importLoading, setImportLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [importSummary, setImportSummary] = useState(null);

  // Menu Dropdown States
  const [showRecruitmentDropdown, setShowRecruitmentDropdown] = useState(false);
  const [showInterviewDropdown, setShowInterviewDropdown] = useState(false);
  const [showInternDropdown, setShowInternDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const recruitmentDropdownRef = useRef(null);
  const interviewDropdownRef = useRef(null);
  const internDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (recruitmentDropdownRef.current && !recruitmentDropdownRef.current.contains(event.target)) {
        setShowRecruitmentDropdown(false);
      }
      if (interviewDropdownRef.current && !interviewDropdownRef.current.contains(event.target)) {
        setShowInterviewDropdown(false);
      }
      if (internDropdownRef.current && !internDropdownRef.current.contains(event.target)) {
        setShowInternDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();
  const printRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => fetchInterns(), 500);
    return () => clearTimeout(timer);
  }, [search, status, performance]);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/hr/interns", {
        params: { search, status, performance },
        withCredentials: true,
      });
      setInterns(data.interns || []);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setError("Failed to load interns");
    }
    setLoading(false);
  };

  // Import Functions
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError("Please select a valid Excel file (.xlsx, .xls, .csv)");
      setTimeout(() => setError(""), 5000);
      return;
    }

    setImportFile(file);
    setImportLoading(true);

    try {
      const data = await readExcelFile(file);
      setPreviewData(data);
    } catch (error) {
      setError("Failed to read Excel file: " + error.message);
      setTimeout(() => setError(""), 5000);
      setImportFile(null);
    }
    setImportLoading(false);
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            reject(new Error("No data found in the Excel file"));
            return;
          }

          // Map Excel columns to intern fields
          const mappedData = jsonData.map((row) => ({
            fullName: row['Full Name'] || row['fullName'] || row['Name'] || '',
            email: (row['Email'] || row['email'] || '').toLowerCase().trim(),
            mobile: String(row['Mobile'] || row['mobile'] || row['Phone'] || row['phone'] || '').trim(),
            dob: row['Date of Birth'] || row['dob'] || row['DOB'] || '',
            gender: row['Gender'] || row['gender'] || '',
            state: row['State'] || row['state'] || '',
            city: row['City'] || row['city'] || '',
            address: row['Address'] || row['address'] || '',
            pinCode: String(row['Pin Code'] || row['pinCode'] || row['pincode'] || ''),
            college: row['College'] || row['college'] || '',
            course: row['Course'] || row['course'] || '',
            educationLevel: row['Education Level'] || row['educationLevel'] || row['Education'] || '',
            domain: row['Domain'] || row['domain'] || '',
            contactMethod: row['Contact Method'] || row['contactMethod'] || 'Email',
            resumeUrl: row['Resume URL'] || row['resumeUrl'] || row['Resume'] || '',
            duration: row['Duration'] || row['duration'] || '',
            prevInternship: (row['Previous Internship'] || row['prevInternship'] || 'No').charAt(0).toUpperCase() + (row['Previous Internship'] || row['prevInternship'] || 'No').slice(1).toLowerCase(),
            TpoName: row['TPO Name'] || row['tpoName'] || row['TPO'] || '',
            TpoEmail: (row['TPO Email'] || row['tpoEmail'] || '').toLowerCase().trim(),
            TpoNumber: String(row['TPO Number'] || row['tpoNumber'] || ''),
            // Optional fields
            uniqueId: row['Unique ID'] || row['uniqueId'] || row['UniqueId'] || '',
            joiningDate: row['Joining Date'] || row['joiningDate'] || row['JoiningDate'] || '',
            status: 'Applied',
            performance: 'Average'
          }));

          resolve(mappedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const downloadTemplate = () => {
    const templateData = [{
      'Full Name': 'John Doe',
      'Email': 'john.doe@example.com',
      'Mobile': '1234567890',
      'Date of Birth': '2000-01-01',
      'Gender': 'Male',
      'State': 'California',
      'City': 'Los Angeles',
      'Address': '123 Main St',
      'Pin Code': '90001',
      'College': 'ABC University',
      'Course': 'Computer Science',
      'Education Level': 'Graduate',
      'Domain': 'Front-end Developer',
      'Contact Method': 'Email',
      'Resume URL': 'https://example.com/resume.pdf',
      'Duration': '3 months',
      'Previous Internship': 'No',
      'TPO Name': 'Dr. Smith',
      'TPO Email': 'smith@college.edu',
      'TPO Number': '9876543210',
      'Unique ID': 'OPTIONAL123', // Optional field
      'Joining Date': '2024-01-15' // Optional field
    }];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const colWidths = [
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 10 },
      { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 15 } // Added for Unique ID and Joining Date
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "intern_import_template.xlsx");
  };

  const handleImport = async () => {
    if (!previewData.length) return;

    setImportLoading(true);
    try {
      const { data } = await axios.post(
        "/api/hr/import-interns",
        { interns: previewData },
        { withCredentials: true }
      );

      setImportSummary(data.summary);

      if (data.summary.success > 0) {
        setCopySuccess(`✅ Successfully imported ${data.summary.success} interns! ${data.summary.duplicates > 0 ? `(${data.summary.duplicates} duplicates skipped)` : ''}`);
        setTimeout(() => setCopySuccess(""), 15000);

        // Refresh the interns list
        await fetchInterns();

        // Close modal after successful import
        setTimeout(() => {
          setShowImportModal(false);
          setImportFile(null);
          setPreviewData([]);
          setImportSummary(null);
        }, 3000);
      } else {
        setError(`❌ No interns imported. ${data.summary.duplicates > 0 ? `All ${data.summary.duplicates} records were duplicates.` : 'Please check your data.'}`);
        setTimeout(() => setError(""), 15000);
      }
    } catch (err) {
      console.error("Import error:", err);
      setError("Failed to import interns: " + (err.response?.data?.message || err.message));
      setTimeout(() => setError(""), 15000);
    }
    setImportLoading(false);
  };

  // Export to Excel function using XLSX
  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const dataToExport = filteredInterns.length > 0 ? filteredInterns : interns;

      if (dataToExport.length === 0) {
        setError("No data to export");
        setTimeout(() => setError(""), 3000);
        setExportLoading(false);
        return;
      }

      // Prepare data for Excel
      const excelData = dataToExport.map(intern => ({
        'Full Name': intern.fullName || '',
        'Email': intern.email || '',
        'Mobile': intern.mobile || '',
        'Warnings Sent': intern.warningCount || 0,
        'Domain': intern.domain || '',
        'Duration': intern.duration || '',
        'College': intern.college || '',
        'Status': intern.status || '',
        'Performance': intern.performance || '',
        'Unique ID': intern.uniqueId || '',
        'Joining Date': intern.joiningDate || '',
        'Applied Date': intern.createdAt ? new Date(intern.createdAt).toLocaleDateString() : '',
        'Resume URL': intern.resumeUrl || '',
        'Locked Status': intern.uniqueId ? 'Yes' : 'No',
        'Date of Birth': intern.dob || '',
        'Gender': intern.gender || '',
        'State': intern.state || '',
        'City': intern.city || '',
        'Address': intern.address || '',
        'Pin Code': intern.pinCode || '',
        'Course': intern.course || '',
        'Education Level': intern.educationLevel || '',
        'Contact Method': intern.contactMethod || '',
        'Previous Internship': intern.prevInternship || 'No',
        'TPO Name': intern.TpoName || '-',
        'TPO Email': intern.TpoEmail || '-',
        'TPO Number': intern.TpoNumber || '-',
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
        { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
        { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }, { wch: 5 }, { wch: 15 },
        { wch: 20 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Interns Data");

      // Generate Excel file and download
      const fileName = `interns_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setCopySuccess(`✅ Exported ${dataToExport.length} interns to Excel!`);
      setTimeout(() => setCopySuccess(""), 3000);

    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export data");
      setTimeout(() => setError(""), 3000);
    }
    setExportLoading(false);
  };

  // Export only selected interns
  const exportSelectedToExcel = () => {
    setExportLoading(true);
    try {
      const selectedInterns = interns.filter(intern => intern.status === "Selected");

      if (selectedInterns.length === 0) {
        setError("No selected interns to export");
        setTimeout(() => setError(""), 3000);
        setExportLoading(false);
        return;
      }

      // Prepare data for Excel
      const excelData = selectedInterns.map(intern => ({
        // 🔹 Basic Info
        'Full Name': intern.fullName || '',
        'Email': intern.email || '',
        'Mobile': intern.mobile || '',
        'Date of Birth': intern.dob || '',
        'Gender': intern.gender || '',

        // 🔹 Location Info
        'State': intern.state || '',
        'City': intern.city || '',
        'Address': intern.address || '',
        'Pin Code': intern.pinCode || '',

        // 🔹 Education Details
        'College': intern.college || '',
        'Course': intern.course || '',
        'Education Level': intern.educationLevel || '',

        // 🔹 Internship Details
        'Domain': intern.domain || '',
        'Duration': intern.duration || '',
        'Previous Internship': intern.prevInternship || 'No',

        // 🔹 Status & Performance
        'Status': intern.status || '',
        'Performance': intern.performance || '',
        'Warnings Sent': intern.warningCount || 0,
        'Comment': intern.comment || '',

        // 🔹 Contact / Communication
        'Contact Method': intern.contactMethod || '',
        'Resume URL': intern.resumeUrl || '',

        // 🔹 TPO / College Incharge
        'TPO Name': intern.TpoName || '',
        'TPO Email': intern.TpoEmail || '',
        'TPO Number': intern.TpoNumber || '',

        'Applied Date': intern.createdAt
          ? new Date(intern.createdAt).toLocaleDateString()
          : '',
      }));


      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
        { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 30 }, { wch: 12 }
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Selected Interns");

      // Generate Excel file and download
      const fileName = `selected_interns_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setCopySuccess(`✅ Exported ${selectedInterns.length} selected interns to Excel!`);
      setTimeout(() => setCopySuccess(""), 3000);

    } catch (err) {
      console.error("Error exporting selected data:", err);
      setError("Failed to export selected interns");
      setTimeout(() => setError(""), 3000);
    }
    setExportLoading(false);
  };

  const handleCustomExport = () => {
    if (storedUser?.role !== "HR Manager") {
      setError("Access denied. Only HR Managers can perform custom exports.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (selectedFields.length === 0) {
      setError("Please select at least one field to export.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setExportLoading(true);
    try {
      const dataToExport = filteredInterns.length > 0 ? filteredInterns : interns;

      if (dataToExport.length === 0) {
        setError("No data to export");
        setTimeout(() => setError(""), 3000);
        setExportLoading(false);
        return;
      }

      // Map dynamic row objects based on selected fields
      const excelData = dataToExport.map(intern => {
        const row = {};

        // Define field-to-label mapping
        const fieldMappings = {
          fullName: { label: 'Full Name', value: intern.fullName || '' },
          email: { label: 'Email', value: intern.email || '' },
          mobile: { label: 'Mobile', value: intern.mobile || '' },
          domain: { label: 'Domain', value: intern.domain || '' },
          duration: { label: 'Duration', value: intern.duration || '' },
          college: { label: 'College', value: intern.college || '' },
          status: { label: 'Status', value: intern.status || '' },
          performance: { label: 'Performance', value: intern.performance || '' },
          uniqueId: { label: 'Unique ID', value: intern.uniqueId || '' },
          joiningDate: { label: 'Joining Date', value: intern.joiningDate || '' },
          createdAt: { label: 'Applied Date', value: intern.createdAt ? new Date(intern.createdAt).toLocaleDateString() : '' },
          resumeUrl: { label: 'Resume URL', value: intern.resumeUrl || '' },
          dob: { label: 'Date of Birth', value: intern.dob || '' },
          gender: { label: 'Gender', value: intern.gender || '' },
          state: { label: 'State', value: intern.state || '' },
          city: { label: 'City', value: intern.city || '' },
          address: { label: 'Address', value: intern.address || '' },
          pinCode: { label: 'Pin Code', value: intern.pinCode || '' },
          course: { label: 'Course', value: intern.course || '' },
          educationLevel: { label: 'Education Level', value: intern.educationLevel || '' },
          contactMethod: { label: 'Contact Method', value: intern.contactMethod || '' },
          prevInternship: { label: 'Previous Internship', value: intern.prevInternship || 'No' },
          TpoName: { label: 'TPO Name', value: intern.TpoName || '-' },
          TpoEmail: { label: 'TPO Email', value: intern.TpoEmail || '-' },
          TpoNumber: { label: 'TPO Number', value: intern.TpoNumber || '-' }
        };

        selectedFields.forEach(fieldId => {
          const mapping = fieldMappings[fieldId];
          if (mapping) {
            row[mapping.label] = mapping.value;
          }
        });

        return row;
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set custom column widths dynamically
      const colWidths = selectedFields.map(() => ({ wch: 18 }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Custom Export Data");

      // Generate file name
      const enteredName = customExportFileName.trim();
      const finalFileName = enteredName
        ? (enteredName.endsWith(".xlsx") ? enteredName : `${enteredName}.xlsx`)
        : `custom_interns_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      XLSX.writeFile(wb, finalFileName);

      setCopySuccess(`✅ Custom Excel file exported successfully! (${dataToExport.length} records)`);
      setTimeout(() => setCopySuccess(""), 4000);
      setShowCustomExportModal(false);

    } catch (err) {
      console.error("Error exporting custom data:", err);
      setError("Failed to export custom data");
      setTimeout(() => setError(""), 3000);
    }
    setExportLoading(false);
  };

  const handleStatusUpdate = async (internId, newStatus, currentPerformance) => {
    // ✅ Business Rule 1: can only mark "Selected" if performance is Good or Excellent
    if (newStatus === "Selected" && !(currentPerformance === "Good" || currentPerformance === "Excellent")) {
      setError("⚠️ Cannot mark as Selected. Performance must be Good or Excellent first.");
      setTimeout(() => setError(""), 2000);
      return;
    }

    // ✅ Business Rule 2: can only mark "Rejected" if performance is Poor
    if (newStatus === "Rejected" && currentPerformance !== "Poor") {
      setError("⚠️ Cannot mark as Rejected. Performance must be marked as Poor first.");
      setTimeout(() => setError(""), 2000);
      return;
    }

    setUpdating(internId);
    try {
      await axios.put(
        `/api/hr/interns/${internId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      await fetchInterns(); // Refresh the list
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
    setUpdating(null);
  };

  const handlePerformanceUpdate = async (internId, newPerformance) => {
    setUpdating(internId);
    try {
      await axios.put(
        `/api/hr/interns/${internId}/performance`,
        { performance: newPerformance },
        { withCredentials: true }
      );
      await fetchInterns(); // Refresh the list
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
        `/api/hr/interns/${internId}/domain`,
        { domain: newDomain },
        { withCredentials: true }
      );
      await fetchInterns(); // Refresh the list
    } catch (err) {
      console.error("Error updating domain:", err);
      setError("Failed to update domain");
    }
    setUpdating(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
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
    // Create print-friendly content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HR Dashboard - Interns Report</title>
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
              background-color: #4f46e5;
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
            .status-Applied { background-color: #dbeafe; color: #1e40af; }
            .status-Selected { background-color: #dcfce7; color: #166534; }
            .status-Rejected { background-color: #fee2e2; color: #991b1b; }
            .status-Active { background-color: #d1fae5; color: #065f46; }
            .status-Inactive { background-color: #f1f5f9; color: #475569; }
            .performance-Average { background-color: #fef3c7; color: #92400e; }
            .performance-Good { background-color: #dcfce7; color: #166534; }
            .performance-Excellent { background-color: #e0e7ff; color: #3730a3; }
            .performance-Poor { background-color: #fee2e2; color: #991b1b; }
            .unique-id {
              background-color: #f3e8ff;
              color: #7c3aed;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: bold;
              font-family: monospace;
            }
            .locked-badge {
              background-color: #fef3c7;
              color: #92400e;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              margin-left: 4px;
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
            <h1>Graphura - HR Dashboard Report</h1>
            <p>Intern Applications and Performance Report</p>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          ${printContent.innerHTML}
          
          <div class="print-footer">
            <p>Confidential - For Internal Use Only</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getSelectedInternsEmails = () => {
    const selectedInterns = showSelectedOnly
      ? interns.filter(intern => intern.status === "Selected")
      : interns.filter(intern => intern.status === "Selected");

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
      case "Active": return "bg-emerald-100 text-emerald-800";
      case "Inactive": return "bg-slate-200 text-slate-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "Excellent": return "bg-purple-100 text-purple-800";
      case "Good": return "bg-green-100 text-green-800";
      case "Average": return "bg-yellow-100 text-yellow-800";
      case "Poor": return "bg-red-100 text-red-800"; // Add this line
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredInterns = showSelectedOnly
    ? interns.filter(intern => intern.status === "Selected")
    : interns;

  const selectedCount = interns.filter(intern => intern.status === "Selected").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-['Outfit',sans-serif] text-slate-900 antialiased">
      <div className="max-w-8xl mx-auto">
        {/* ── NAVBAR ── */}
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200/80 px-5 py-3 no-print relative z-40 overflow-visible">
          {/* Rainbow top line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-violet-500 to-rose-500 rounded-t-2xl" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">

            {/* Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="p-1.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shadow-inner">
                <img src={Graphura} alt="Logo" className="h-7 object-contain" />
              </div>
              <div className="hidden lg:block">
                <p className="text-[13px] font-black text-slate-800 tracking-tight leading-none">IMS Portal</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{storedUser?.role || "HR Intern"}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 shrink-0 hidden sm:block" />

            <nav className="flex flex-wrap items-center gap-1 sm:gap-0.5">
              {/* Dashboard */}
              <button
                onClick={() => navigate(basePath)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${location.pathname === basePath
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                Dashboard
              </button>

              {storedUser?.role === "HR Manager" ? (
                <>
                  {/* Intern Action */}
                  <div className="relative" ref={internDropdownRef}>
                    <button
                      onClick={() => { setShowInternDropdown(!showInternDropdown); setShowInterviewDropdown(false); setShowRecruitmentDropdown(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${showInternDropdown || ["/HR-Manager-Dashboard/applications", "/HR-Manager-Dashboard/active-interns", "/HR-Manager-Dashboard/manage-planner", "/HR-Manager-Dashboard/warning-logs", "/HR-Manager-Dashboard/termination-appeals"].includes(location.pathname)
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Intern Action
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showInternDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showInternDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                        <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Intern Management</p>
                        {[
                          { label: "All Applications", path: "/HR-Manager-Dashboard/applications", icon: <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> },
                          { label: "Active Interns", path: "/HR-Manager-Dashboard/active-interns", icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> },
                          { label: "Planner", path: "/HR-Manager-Dashboard/manage-planner", icon: <Calendar className="w-3.5 h-3.5 text-sky-400" /> },
                          { label: "Warning Logs", path: "/HR-Manager-Dashboard/warning-logs", icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> },
                          { label: "Termination Appeals", path: "/HR-Manager-Dashboard/termination-appeals", icon: <UserMinus className="w-3.5 h-3.5 text-rose-500" /> },
                        ].map(({ label, path, icon }) => (
                          <button key={path} onClick={() => { setShowInternDropdown(false); navigate(path); }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${location.pathname === path ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}>
                            {icon}{label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interview Action */}
                  <div className="relative" ref={interviewDropdownRef}>
                    <button
                      onClick={() => { setShowInterviewDropdown(!showInterviewDropdown); setShowInternDropdown(false); setShowRecruitmentDropdown(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${showInterviewDropdown || ["/HR-Manager-Dashboard/interview-invite", "/HR-Manager-Dashboard/interview-history"].includes(location.pathname)
                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Interview Action
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showInterviewDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showInterviewDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                        <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Interview</p>
                        {[
                          { label: "Send Interview Invites", path: "/HR-Manager-Dashboard/interview-invite", icon: <Mail className="w-3.5 h-3.5 text-purple-400" /> },
                          { label: "Schedule Interview", path: "/HR-Manager-Dashboard/interview-history", icon: <History className="w-3.5 h-3.5 text-violet-400" /> },
                        ].map(({ label, path, icon }) => (
                          <button key={path} onClick={() => { setShowInterviewDropdown(false); navigate(path); }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${location.pathname === path ? "bg-purple-50 text-purple-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}>
                            {icon}{label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recruitment Tools */}
                  <div className="relative" ref={recruitmentDropdownRef}>
                    <button
                      onClick={() => { setShowRecruitmentDropdown(!showRecruitmentDropdown); setShowInternDropdown(false); setShowInterviewDropdown(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${showRecruitmentDropdown
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Recruitment Tools
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showRecruitmentDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showRecruitmentDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                        <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Campaign Actions</p>
                        <button onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerImport: true } }); }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-orange-400" />Import Excel Database
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Exports</p>
                        <button onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerExport: true } }); }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors">
                          <Download className="w-3.5 h-3.5 text-emerald-400" />Export Interns Data
                        </button>
                        <button onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerCustomExport: true } }); }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors">
                          <Download className="w-3.5 h-3.5 text-indigo-400" />Custom Excel Export
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Public Planner */}
                  <button
                    onClick={() => navigate("/weekly-planner")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${location.pathname === "/weekly-planner"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Public Planner
                  </button>
                </>
              )}
            </nav>

            {/* Profile */}
            <div className="shrink-0 relative sm:ml-auto" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center uppercase">
                  {storedUser?.fullName?.charAt(0) || "M"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[11px] font-black text-slate-800 truncate max-w-[100px] leading-tight">{storedUser?.fullName || "HR Manager"}</p>
                  <p className="text-[9px] text-indigo-500 font-bold leading-none mt-0.5">{storedUser?.role || "HR Manager"}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[12px] font-black text-slate-800 truncate">{storedUser?.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{storedUser?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[9px] font-black uppercase">{storedUser?.role}</span>
                  </div>
                  <button
                    onClick={() => { setShowProfileDropdown(false); handleLogout(); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-black text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Email Copy Success Message */}
        {copySuccess && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative animate-fade-in">
            <span className="block sm:inline">{copySuccess}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-xl rounded-2xl p-6" ref={printRef}>
          {/* Filters Section */}
          <div className="mb-8 no-print">
            {interns.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{interns.length}</div>
                  <div className="text-sm text-blue-800">Total Interns</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedCount}
                  </div>
                  <div className="text-sm text-green-800">Selected</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {interns.filter(i => i.status === 'Rejected').length}
                  </div>
                  <div className="text-sm text-red-800">Rejected</div>
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
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {interns.filter(i => i.status === 'Applied').length}
                  </div>
                  <div className="text-sm text-yellow-800">Pending</div>
                </div>
                <div
                  className="bg-indigo-50 rounded-lg p-4 text-center cursor-pointer hover:bg-indigo-100 transition-colors border-2 border-indigo-200"
                  onClick={() => setShowEmailCopy(!showEmailCopy)}
                >
                  <div className="text-2xl font-bold text-indigo-600">
                    📧
                  </div>
                  <div className="text-sm text-indigo-800">Email Tools</div>
                </div>
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
                    📋 Copy All Emails
                  </button>
                  <button
                    onClick={openEmailClient}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                  >
                    ✉️ Open Email Client
                  </button>
                  <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-indigo-200 text-sm text-gray-600 flex items-center">
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
                  placeholder="🔍 Search by name, email, or domain..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">All Status</option>
                <option value="Applied">Applied</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">All Performance</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedInterns = filteredInterns.slice(startIndex, endIndex);
            const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);
            return (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold">Intern Details</th>
                      <th className="p-4 text-left font-semibold">Contact Info/apply Date</th>
                      <th className="p-4 text-left font-semibold">Domain & Duration</th>
                      <th className="p-4 text-left font-semibold">College Info</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Performance</th>
                      <th className="p-4 text-left font-semibold">Domain</th>
                      <th className="p-4 text-left font-semibold no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedInterns.map((intern) => {
                      const hasUniqueId = !!intern.uniqueId;
                      const isLocked = hasUniqueId;

                      return (
                        <tr
                          key={intern._id}
                          className={`hover:bg-indigo-50 transition-colors duration-150 ${isLocked ? 'bg-yellow-50/50' : ''
                            }`}
                        >
                          {/* Name & Email */}
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-gray-800 flex items-center gap-2">
                                {intern.fullName}
                                {isLocked && (
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                    🔒 Locked
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">{intern.email}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {intern.warningCount > 0 && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                    ⚠️ Warnings: {intern.warningCount}
                                  </span>
                                )}
                                {intern.interviewCount > 0 ? (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${intern.interviewCount > 1
                                    ? "bg-orange-100 text-orange-600 border-orange-200"
                                    : "bg-green-100 text-green-600 border-green-200"
                                    }`}>
                                    📧 {intern.interviewCount} Invite{intern.interviewCount > 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-gray-400 italic">No invites sent</span>
                                )}
                              </div>
                              {intern.uniqueId && (
                                <div className="text-xs text-purple-600 font-mono mt-1">
                                  ID: {intern.uniqueId}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Mobile Number */}
                          <td className="p-4">
                            <div className="text-gray-700 text-sm">
                              📞 {intern.mobile || "Not provided"}
                              <p className="text-xs font-bold text-gray-500 mt-0.5">Applied : {intern.updatedAt ? new Date(intern.updatedAt).toLocaleDateString() : "Not provided"}</p>
                              {intern.joiningDate && (
                                <p className="text-xs text-green-600 font-bold mt-1">
                                  Joining: {!isNaN(new Date(intern.joiningDate).getTime()) ? new Date(intern.joiningDate).toLocaleDateString() : intern.joiningDate}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Domain & Duration */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                                {intern.domain || "Not specified"}
                              </span>
                              <div className="text-sm text-gray-600">
                                ⏱️ {intern.duration || "Not specified"}
                              </div>
                            </div>
                          </td>

                          <td className="p-2 md:p-3">
                            <div className="min-h-[36px] flex items-center">
                              <div className="truncate-text-2-lines max-w-full">
                                <span className={`
                                   text-xs md:text-sm
                                     ${intern.college ? "text-gray-600" : "text-gray-400 italic"}
                                     transition-colors duration-100
                                   `}>
                                  {intern.college || "—"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status with Update */}
                          <td className="p-4">
                            <div className="print-only">
                              <span className={`status-badge status-${intern.status}`}>
                                {intern.status}
                              </span>
                            </div>
                            <select
                              value={intern.status}
                              onChange={(e) => handleStatusUpdate(intern._id, e.target.value, intern.performance)}
                              disabled={updating === intern._id || isLocked}
                              className={`${getStatusColor(intern.status)} px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer no-print ${isLocked ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            {isLocked && (
                              <div className="text-xs text-yellow-600 mt-1 no-print">
                                🔒 Cannot update
                              </div>
                            )}
                          </td>

                          {/* Performance with Update */}
                          <td className="p-4">
                            <div className="print-only">
                              <span className={`performance-badge performance-${intern.performance}`}>
                                {intern.performance}
                              </span>
                            </div>
                            <select
                              value={intern.performance}
                              onChange={(e) => handlePerformanceUpdate(intern._id, e.target.value, hasUniqueId)}
                              disabled={updating === intern._id || isLocked}
                              className={`${getPerformanceColor(intern.performance)} px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer no-print ${isLocked ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              <option value="Average">Average</option>
                              <option value="Good">Good</option>
                              <option value="Excellent">Excellent</option>
                              <option value="Poor">Poor</option>
                            </select>
                            {isLocked && (
                              <div className="text-xs text-yellow-600 mt-1 no-print">
                                🔒 Cannot update
                              </div>
                            )}
                          </td>

                          {/* Domain Update */}
                          <td className="p-3">
                            <div className="print-only">
                              <span>
                                {intern.domain}
                              </span>
                            </div>
                            <select
                              value={intern.domain}
                              onChange={(e) => handleDomainUpdate(intern._id, e.target.value, hasUniqueId)}
                              disabled={updating === intern._id || isLocked}
                              className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer no-print ${isLocked ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              <option value="Sales & Marketing">Sales & Marketing</option>
                              <option value="Data & AI Intelligence">Data & AI Intelligence</option>
                              <option value="Data Science & Analytics">Data Science & Analytics</option>
                              <option value="Human Resources">Human Resources</option>
                              <option value="Social Media Management">Social Media Management</option>
                              <option value="Graphic Design">Graphic Design</option>
                              <option value="Digital Marketing">Digital Marketing</option>
                              <option value="Video Editing">Video Editing</option>
                              <option value="Full Stack Development">Full Stack Development</option>
                              <option value="MERN Stack Development">MERN Stack Development</option>
                              <option value="Email and Outreaching">Email and Outreaching</option>
                              <option value="Content Writing">Content Writing</option>
                              <option value="Content Creator">Content Creator</option>
                              <option value="UI/UX Designing">UI/UX Designing</option>
                              <option value="Front-end Developer">Front-end Developer</option>
                              <option value="Back-end Developer">Back-end Developer</option>
                            </select>
                            {isLocked && (
                              <div className="text-xs text-yellow-600 mt-1 no-print">
                                🔒 Cannot update
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4 no-print">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/HR-Dashboard/intern/${intern._id}`)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium text-xs flex items-center justify-center"
                              >
                                <Eye size={16} />
                              </button>

                              <a
                                href={intern.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold transition-colors text-xs"
                              >
                                <FileText className="w-4 h-4" />
                                Resume
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        &larr; Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${currentPage === page
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200"
                                : "text-gray-600 bg-white hover:bg-gray-50 border border-gray-200"
                                }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
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
                  {showSelectedOnly ? "No selected interns found" : "No interns found"}
                </h3>
                <p className="text-gray-500">
                  {showSelectedOnly
                    ? "There are no interns with 'Selected' status"
                    : "Try adjusting your search or filters"
                  }
                </p>
                {showSelectedOnly && (
                  <button
                    onClick={() => setShowSelectedOnly(false)}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Show All Interns
                  </button>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Import Interns Modal */}
      {showImportModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Import Interns from Excel</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setPreviewData([]);
                  setImportSummary(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {!importFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Upload Excel File
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Supported formats: .xlsx, .xls, .csv
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Choose File
                  </button>

                  {/* Template Download */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Download Template</h4>
                    <p className="text-sm text-blue-600 mb-3">
                      Use this template to ensure proper formatting. Unique ID and Joining Date are optional fields.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      📥 Download Template
                    </button>
                  </div>
                </div>
              ) : previewData.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Preview Data ({previewData.length} records)
                    </h3>
                    <button
                      onClick={() => {
                        setImportFile(null);
                        setPreviewData([]);
                        setImportSummary(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                    >
                      Change File
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left font-semibold text-gray-700">Full Name</th>
                          <th className="p-3 text-left font-semibold text-gray-700">Email</th>
                          <th className="p-3 text-left font-semibold text-gray-700">Mobile</th>
                          <th className="p-3 text-left font-semibold text-gray-700">Domain</th>
                          <th className="p-3 text-left font-semibold text-gray-700">Unique ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.slice(0, 5).map((intern, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3">{intern.fullName}</td>
                            <td className="p-3">{intern.email}</td>
                            <td className="p-3">{intern.mobile}</td>
                            <td className="p-3">{intern.domain}</td>
                            <td className="p-3">{intern.uniqueId || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 5 && (
                      <div className="p-3 bg-gray-50 text-center text-gray-600">
                        ... and {previewData.length - 5} more records
                      </div>
                    )}
                  </div>

                  {/* Import Summary */}
                  {importSummary && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Import Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total:</span> {importSummary.total}
                        </div>
                        <div>
                          <span className="font-medium">Success:</span> {importSummary.success}
                        </div>
                        <div>
                          <span className="font-medium">Failed:</span> {importSummary.failed}
                        </div>
                        <div>
                          <span className="font-medium">Duplicates:</span> {importSummary.duplicates}
                        </div>
                      </div>
                      {importSummary.errors && importSummary.errors.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-red-700 mb-1">Errors:</h5>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {importSummary.errors.slice(0, 3).map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleImport}
                      disabled={importLoading}
                      className={`flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium transition-colors ${importLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                        }`}
                    >
                      {importLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Importing...
                        </>
                      ) : (
                        `Import ${previewData.length} Interns`
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setPreviewData([]);
                        setImportSummary(null);
                      }}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p>Processing file...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Custom Excel Export Modal */}
      {showCustomExportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in border border-slate-200">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Download className="text-indigo-600" size={20} />
                  Custom Excel Export
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Select the fields you wish to include in your spreadsheet</p>
              </div>
              <button
                onClick={() => setShowCustomExportModal(false)}
                className="p-2 hover:bg-indigo-100/40 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
              {/* File Name Configuration */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Export File Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. customized_intern_roster_2026"
                  value={customExportFileName}
                  onChange={(e) => setCustomExportFileName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                />
              </div>

              {/* Selector Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400">
                  {selectedFields.length} of {EXPORTABLE_FIELDS.length} Columns Selected
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFields(EXPORTABLE_FIELDS.map(f => f.id))}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-750"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFields([])}
                    className="text-xs text-rose-500 font-bold hover:text-rose-650"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Checkbox Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {EXPORTABLE_FIELDS.map((field) => {
                  const isChecked = selectedFields.includes(field.id);
                  return (
                    <label
                      key={field.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 ${isChecked
                        ? "bg-indigo-50/40 border-indigo-200 shadow-sm text-indigo-900"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFields([...selectedFields, field.id]);
                          } else {
                            setSelectedFields(selectedFields.filter(id => id !== field.id));
                          }
                        }}
                        className="w-4.5 h-4.5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 shrink-0"
                      />
                      <span className="text-xs font-bold truncate">{field.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={handleCustomExport}
                disabled={selectedFields.length === 0}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-650 text-white font-bold rounded-xl shadow-md hover:shadow-indigo-150 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Generate Customized Excel Spreadsheet
              </button>
              <button
                type="button"
                onClick={() => setShowCustomExportModal(false)}
                className="py-3 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default HRDashboard;
