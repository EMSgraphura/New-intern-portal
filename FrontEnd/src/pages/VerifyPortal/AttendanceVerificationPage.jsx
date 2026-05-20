import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import graphura from '../../../public/Graphura.jpg';

const AttendanceVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [internData, setInternData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    // Dynamic loading of Outfit & Inter fonts for high-quality corporate typography
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const verifyAndFetchAttendance = async () => {
      if (!token) {
        setError('Access Denied: Secure verification token is missing or invalid.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post('/api/intern/verify-attendance-token', {
          token
        });
        setInternData(response.data.responseData);
      } catch (err) {
        setError(err.response?.data?.message || 'Access Denied: Verification session has expired or is invalid.');
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchAttendance();

    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {
        // Safe catch
      }
    };
  }, [token]);

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-black text-slate-700 uppercase tracking-widest animate-pulse">
          Verifying Registry Parameters & Fetching Assembly Logs...
        </p>
      </div>
    );
  }

  if (error || !internData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <div className="max-w-md bg-white border-2 border-red-200 rounded-xl p-8 shadow-lg">
          <svg className="w-16 h-16 text-rose-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-black text-slate-950 uppercase tracking-wider">Attendance Access Denied</h2>
          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
            {error || 'Unable to retrieve performance registry statement. Please check your verification parameters.'}
          </p>
          <button
            onClick={() => window.close()}
            className="mt-6 px-6 py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const attendanceRecords = internData.attendanceRecords || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 md:py-16 px-4 md:px-8 relative antialiased" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            background-color: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            border: 4px double #0f172a !important;
            box-shadow: none !important;
            transform-origin: top left;
          }
          #print-area h1 {
            font-size: 14px !important;
            margin-bottom: 2px !important;
          }
          #print-area h4 {
            font-size: 10px !important;
            margin-bottom: 4px !important;
            padding-bottom: 2px !important;
          }
          #print-area p, #print-area span {
            font-size: 9px !important;
            line-height: 1.2 !important;
          }
          #print-area .overflow-x-auto {
            overflow: visible !important;
            width: 100% !important;
          }
          #print-area table {
            width: 100% !important;
            min-width: 100% !important;
            table-layout: auto !important;
            margin-top: 4px !important;
          }
          #print-area th, #print-area td {
            padding: 4px 2px !important;
            font-size: 7.5px !important;
            line-height: 1.1 !important;
          }
          #print-area .mt-8 {
            margin-top: 8px !important;
          }
          #print-area .mt-6 {
            margin-top: 6px !important;
          }
          #print-area .mt-4 {
            margin-top: 4px !important;
          }
          #print-area .pt-3 {
            padding-top: 2px !important;
          }
          #print-area .pb-6 {
            padding-bottom: 4px !important;
          }
          #print-area .gap-6 {
            gap: 8px !important;
          }
          #print-area .gap-4 {
            gap: 6px !important;
          }
          #print-area .p-4 {
            padding: 8px !important;
          }
          #print-area .p-8 {
            padding: 12px !important;
          }
          #print-area .space-y-8 > * + * {
            margin-top: 8px !important;
          }
          #print-area .space-y-4 > * + * {
            margin-top: 4px !important;
          }
          #print-area .space-y-2 > * + * {
            margin-top: 2px !important;
          }
          #print-area tr, #print-area .grid, #print-area section {
            page-break-inside: avoid !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @page {
          size: A4;
          margin: 6mm 8mm 6mm 8mm;
        }
      `}} />
      {/* Decorative top stripe */}
      <div className="absolute top-0 left-0 w-full h-[6px] bg-slate-900"></div>

      <div className="max-w-[96%] lg:max-w-[1350px] mx-auto space-y-8 transition-all duration-500">

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Verification Successfully • Department Meeting Attendance Report
            </span>
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-350 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close Window</span>
            </button>
            <button
              onClick={printReport}
              className="px-4.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Attendance Report</span>
            </button>
          </div>
        </div>

        {/* Marksheet Container */}
        <div id="print-area" className="bg-white border-4 border-double border-slate-900 p-4 md:p-8 shadow-xl relative overflow-hidden">

          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900 space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center p-1.5 bg-slate-50">
                <img src={graphura} alt="Emblem" className="w-full h-full object-contain rounded-full" />
              </div>
            </div>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
              Graphura India Private Limited
            </h1>
            <p className="text-[10px] md:text-xs font-black text-slate-655 uppercase tracking-widest">
              Graphura Internship Programme - 2026
            </p>
            <div className="inline-block bg-slate-900 text-white text-[10px] md:text-xs font-black px-4 py-1 uppercase tracking-widest rounded-sm">
              Department Meetings Attendance Report (Attendance Logs)
            </div>
            <p className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">
              GIP SECURE INTERNSHIP ID: {internData.uniqueId.replace(/\//g, '')} • System Cryptographic Log Verification
            </p>
          </div>

          {/* Bio Grid */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              I. Intern Details & Attendance Performance Score
            </h3>
            <div className="border border-slate-900 overflow-x-auto">
              <table className="w-full text-xs text-slate-850 border-collapse min-w-[650px]">
                <tbody>
                  <tr className="border-b border-slate-900">
                    <td className="w-1/4 bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Intern ID / Unique ID</td>
                    <td className="w-1/4 p-2.5 font-black text-slate-900 border-r border-slate-900 font-mono text-[13px]">{internData.uniqueId}</td>
                    <td className="w-1/4 bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Intern Full Name</td>
                    <td className="w-1/4 p-2.5 font-black text-slate-900 uppercase">{internData.fullName}</td>
                  </tr>
                  <tr className="border-b border-slate-900">
                    <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Domain / Department Name</td>
                    <td className="p-2.5 font-extrabold text-blue-800 border-r border-slate-900 uppercase">{internData.domain}</td>
                    <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Institution Name</td>
                    <td className="p-2.5 font-semibold text-slate-900">{internData.college}</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Meetings Scheduled</td>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-900 font-mono">{internData.totalMeetings || 0} Meeting</td>
                    <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Meetings Attendance Ratio</td>
                    <td className="p-2.5 font-black text-blue-850 font-mono text-[13px]">
                      {internData.meetingsAttended} / {internData.totalMeetings} Attended ({internData.totalMeetings > 0
                        ? ((internData.meetingsAttended / internData.totalMeetings) * 100).toFixed(1) + "%"
                        : "100.0%"})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Table */}
          <div className="mt-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              II. Day-wise Meeting Attendance Details
            </h3>
            <div className="border border-slate-900 overflow-x-auto">
              <table className="w-full text-xs text-slate-850 border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                    <th className="py-2.5 px-2 border-r border-slate-900 w-16">Day No.</th>
                    <th className="py-2.5 px-3 border-r border-slate-900 text-left">Meeting Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-900">Day of Week</th>
                    <th className="py-2.5 px-3 border-r border-slate-900">Status</th>
                    <th className="py-2.5 px-3 text-left">Supervisor Remarks / Log Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record, idx) => {
                      const meetingDateObj = new Date(record.meetingDate);
                      const formattedDate = isNaN(meetingDateObj.getTime())
                        ? 'N/A'
                        : meetingDateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
                      const dayOfWeek = isNaN(meetingDateObj.getTime())
                        ? 'N/A'
                        : meetingDateObj.toLocaleDateString("en-US", { weekday: 'long' });

                      let statusBadgeStyle = "";
                      let statusText = record.status || "Absent";

                      if (statusText === "Present") {
                        statusBadgeStyle = "text-emerald-700 bg-emerald-50 border border-emerald-300";
                      } else if (statusText === "Absent") {
                        statusBadgeStyle = "text-rose-700 bg-rose-50 border border-rose-300";
                      } else if (statusText === "Leave") {
                        statusBadgeStyle = "text-amber-700 bg-amber-50 border border-amber-300";
                        statusText = "Leave (Excused)";
                      }

                      return (
                        <tr key={idx} className="border-b border-slate-900 text-center hover:bg-slate-50/50">
                          <td className="py-2 border-r border-slate-900 font-mono font-bold">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-slate-900 text-left font-semibold">{formattedDate}</td>
                          <td className="py-2 px-3 border-r border-slate-900 font-medium">{dayOfWeek}</td>
                          <td className="py-2 px-3 border-r border-slate-900">
                            <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${statusBadgeStyle}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-left font-medium text-slate-600">
                            {record.remarks || (statusText === "Present" ? "Department Meeting" : "No notes recorded")}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-500 italic font-bold">
                        No daily logs registered in system database ledger for this roll number.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8 border-t border-slate-900 pt-4 space-y-2 text-[9px] md:text-[10px] text-slate-655 leading-relaxed font-medium">
            <p className="font-bold text-slate-900 uppercase tracking-wider mb-1">
              Registry Notes & Disclaimers:
            </p>
            <p>
              1. This computer-generated logs displays department meeting attendance records and internship participation statuses securely synchronized from the official Graphura Internship Program (GIP-2026) server database.
            </p>
            <p>
              2. Status indicators: <span className="font-bold">Present</span> (Candidate successfully attended the department meeting), <span className="font-bold">Absent</span> (Unexcused absence from the scheduled meeting), and <span className="font-bold">Leave</span> (Approved absence under official academic, medical, or organizational leave policy).
            </p>
          </div>

          {/* Barcode & Date */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex space-x-[1px] h-6 items-center bg-white px-2 py-0.5 border border-slate-300">
                <div className="w-[1px] h-4 bg-slate-950"></div>
                <div className="w-[2px] h-4 bg-slate-950"></div>
                <div className="w-[1px] h-4 bg-slate-950"></div>
                <div className="w-[3px] h-4 bg-slate-950"></div>
                <div className="w-[1px] h-4 bg-slate-950"></div>
                <div className="w-[2px] h-4 bg-slate-950"></div>
                <div className="w-[1px] h-4 bg-slate-950"></div>
                <div className="w-[1px] h-4 bg-slate-950"></div>
                <div className="w-[4px] h-4 bg-slate-950"></div>
                <div className="w-[2px] h-4 bg-slate-950"></div>
                <div className="w-[1px] h-4 bg-slate-950"></div>
                <div className="w-[3px] h-4 bg-slate-950"></div>
                <div className="w-[1px] h-4 bg-slate-950"></div>
              </div>
              <span className="text-[8px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">
                GIP SECURE INTERNSHIP ID: {internData.uniqueId.replace(/\//g, '')}
              </span>
            </div>

            <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider font-mono">
              GENERATION DATE: {new Date().toLocaleString()}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AttendanceVerificationPage;
