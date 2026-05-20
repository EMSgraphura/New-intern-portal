import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Award, ArrowLeft, Search, FileText, Printer, CheckCircle, RefreshCw, Edit3, Download, Calendar } from "lucide-react";
import GraphuraLogo from "../../../public/GraphuraLogo.jpg";
import GraphuraFavicon from "../../../public/Graphura.jpg";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const AdminOfferLetterPage = () => {
  const navigate = useNavigate();
  const printRef = useRef();

  // Authentication check
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntern, setSelectedIntern] = useState(null);

  // Offer Letter custom parameters state
  const [offerData, setOfferData] = useState({
    salutation: "",
    domain: "",
    duration: "3 Months",
    stipend: "Unpaid / Academic Internship",
    startDate: new Date().toISOString().split("T")[0],
    signatoryName: "Authorized Signatory",
    issueDate: new Date().toISOString().split("T")[0],
  });

  const [signatureType, setSignatureType] = useState("cursive"); // "cursive" | "upload" | "none"
  const [signatureFile, setSignatureFile] = useState("");

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!storedUser) {
      navigate("/login");
      return;
    }
    fetchCompletedInterns();
  }, []);

  const fetchCompletedInterns = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/interns", {
        withCredentials: true,
      });
      // Allow Offer Letter generation for Active, Completed, or even new registered interns
      const list = data.interns || [];
      setInterns(list);
    } catch (err) {
      console.error("Error fetching interns for Offer Letter:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setOfferData({
      salutation: `Dear ${intern.fullName},`,
      domain: intern.domain || "Software Development Intern",
      duration: "3 Months",
      stipend: "Unpaid / Academic Internship",
      startDate: new Date().toISOString().split("T")[0],
      signatoryName: "Authorized Signatory",
      issueDate: new Date().toISOString().split("T")[0],
    });
  };

  const handlePrint = () => {
    if (!selectedIntern) return;
    const content = printRef.current.innerHTML;
    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map(tag => tag.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print Internship Offer Letter</title>
          ${styles}
          <style>
            body {
              background: #faf8f5 !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #print-area {
              width: 210mm !important;
              height: 297mm !important;
              box-sizing: border-box;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0px !important;
              padding: 2.2cm 1.8cm !important;
              background: radial-gradient(circle, rgba(244,240,230,0.45) 0%, rgba(250,248,245,1) 85%) !important;
              background-color: #faf8f5 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #print-area * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: A4 portrait;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div id="print-area">
            ${content}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Give browser time to load assets inside iframe
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 800);
  };

  const handleDownloadPDF = async () => {
    if (!selectedIntern) return;
    try {
      setDownloading(true);
      const element = printRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#faf8f5",
        logging: false,
        imageTimeout: 5000,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Offer_Letter_${selectedIntern.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Error generating Offer Letter PDF, falling back to clean sandbox print:", err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

  const filteredInterns = interns.filter(
    (intern) =>
      intern.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800 font-sans antialiased">
      
      {/* Dynamic Print CSS Override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            border: none !important;
            border-radius: 0px !important;
            padding: 2.2cm 1.8cm !important;
            box-sizing: border-box;
            box-shadow: none !important;
            background: radial-gradient(circle, rgba(244,240,230,0.45) 0%, rgba(250,248,245,1) 85%) !important;
            background-color: #faf8f5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
        input, select, textarea {
          font-family: 'Outfit', sans-serif !important;
        }
      `}</style>

      <div className="max-w-[1500px] mx-auto space-y-6 no-print">
        
        {/* Top Header Navigation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/Admin-Dashboard")}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-slate-600 cursor-pointer"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="text-indigo-600" size={24} />
                Internship Offer Letter Generator
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Official Credential Suite for Issuing Internship Offer Letters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!selectedIntern}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Printer size={16} />
              Print Letter
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={!selectedIntern || downloading}
              className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {downloading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Downloading PDF...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel - Selection & Parameters Configuration (Right 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Intern Selection Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase text-[#1e3a8a] tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <span>🔍 1. Select Candidate</span>
              </h2>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by Name or Unique ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-xs font-bold transition-all bg-slate-50"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-xs font-semibold">
                  <RefreshCw className="animate-spin" size={16} />
                  Loading candidates...
                </div>
              ) : searchTerm.trim() === "" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 select-none">
                  <span className="text-xl mb-1.5">🔍</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Query Candidate</span>
                  <p className="text-[9.5px] font-semibold text-slate-400 max-w-[220px] mt-1 leading-normal">
                    Type candidate's full name or Unique ID in the search bar above to generate their Offer Letter.
                  </p>
                </div>
              ) : filteredInterns.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 py-4 text-center">
                  No interns found matching search.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredInterns.map((intern) => (
                    <button
                      key={intern._id}
                      onClick={() => handleSelectIntern(intern)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedIntern?._id === intern._id
                          ? "bg-blue-50/80 border-blue-300 text-blue-900 font-extrabold"
                          : "bg-white border-slate-200 hover:border-slate-350 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black uppercase">{intern.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{intern.uniqueId || "N/A"}</div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {intern.domain}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Custom Letter Configurations */}
            {selectedIntern && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xs font-black uppercase text-[#1e3a8a] tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Edit3 size={14} />
                  <span>2. Personalize Offer Details</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Salutation Heading</label>
                    <input
                      type="text"
                      value={offerData.salutation}
                      onChange={(e) => setOfferData({ ...offerData, salutation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Internship Domain</label>
                    <input
                      type="text"
                      value={offerData.domain}
                      onChange={(e) => setOfferData({ ...offerData, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Program Duration</label>
                    <select
                      value={offerData.duration}
                      onChange={(e) => setOfferData({ ...offerData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none cursor-pointer"
                    >
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stipend Details</label>
                    <input
                      type="text"
                      value={offerData.stipend}
                      onChange={(e) => setOfferData({ ...offerData, stipend: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Commencement Date</label>
                    <input
                      type="date"
                      value={offerData.startDate}
                      onChange={(e) => setOfferData({ ...offerData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Issue Date</label>
                    <input
                      type="date"
                      value={offerData.issueDate}
                      onChange={(e) => setOfferData({ ...offerData, issueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Signatory Title</label>
                  <input
                    type="text"
                    value={offerData.signatoryName}
                    onChange={(e) => setOfferData({ ...offerData, signatoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>

                {/* 3. Signature Setup Option */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">3. Competent Signatory Signature</label>
                  
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSignatureType("cursive")}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-black uppercase rounded-md transition-all ${signatureType === "cursive"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      🖋️ Cursive Font
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSignatureType("upload")}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-black uppercase rounded-md transition-all ${signatureType === "upload"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      📤 Upload Image
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSignatureType("none")}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-black uppercase rounded-md transition-all ${signatureType === "none"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      ❌ Physical / None
                    </button>
                  </div>

                  {signatureType === "upload" && (
                    <div className="space-y-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <label className="text-[9px] font-black uppercase text-blue-700 block">Upload Stamp / Signature Image (PNG/JPG)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="w-full text-[10px] text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 cursor-pointer outline-none"
                      />
                      {signatureFile && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-bold text-slate-500">Preview:</span>
                          <img src={signatureFile} alt="mini preview" className="h-6 object-contain bg-white border border-slate-200 rounded p-0.5" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right panel - Full executive layout Letterhead Preview (Left 7/12) */}
          <div className="lg:col-span-7">
            {selectedIntern ? (
              <div
                id="print-area"
                ref={printRef}
                className="rounded-2xl shadow-xl p-8 md:p-12 relative mx-auto max-w-[850px] min-h-[1100px] flex flex-col justify-between overflow-hidden border border-slate-350"
                style={{
                  background: "radial-gradient(circle, rgba(244,240,230,0.45) 0%, rgba(250,248,245,1) 85%)",
                  backgroundColor: "#faf8f5",
                  boxShadow: "0 15px 35px -5px rgba(0, 0, 0, 0.07), 0 10px 15px -6px rgba(0, 0, 0, 0.07)",
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact"
                }}
              >

                {/* Classic Ornate Navy Borders */}
                <div className="absolute inset-4 border border-blue-900/10 pointer-events-none rounded-lg z-10"></div>
                <div className="absolute inset-5 border-2 border-double border-blue-950/30 pointer-events-none rounded-lg z-10"></div>

                {/* Guilloche Micro-Mesh Anti-Tamper Background Pattern */}
                <div className="absolute inset-0 pointer-events-none select-none z-0 opacity-[0.12] overflow-hidden">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="antiTamperMesh" width="80" height="80" patternUnits="userSpaceOnUse">
                        {/* Horizontal parallel safety lining effect */}
                        <line x1="0" y1="10" x2="80" y2="10" stroke="rgba(30, 58, 138, 0.08)" strokeWidth="0.4" />
                        <line x1="0" y1="20" x2="80" y2="20" stroke="rgba(30, 58, 138, 0.08)" strokeWidth="0.4" />
                        <line x1="0" y1="30" x2="80" y2="30" stroke="rgba(30, 58, 138, 0.08)" strokeWidth="0.4" />
                        <line x1="0" y1="40" x2="80" y2="40" stroke="rgba(30, 58, 138, 0.08)" strokeWidth="0.4" />
                        <line x1="0" y1="50" x2="80" y2="50" stroke="rgba(30, 58, 138, 0.08)" strokeWidth="0.4" />
                        <line x1="0" y1="60" x2="80" y2="60" stroke="rgba(30, 58, 138, 0.08)" strokeWidth="0.4" />
                        <line x1="0" y1="70" x2="80" y2="70" stroke="rgba(30, 58, 138, 0.08)" strokeWidth="0.4" />
                        <line x1="0" y1="80" x2="80" y2="80" stroke="rgba(30, 58, 138, 0.08)" strokeWidth="0.4" />

                        {/* Wavy guilloche curves */}
                        <path d="M 0 40 Q 20 20 40 40 T 80 40" fill="none" stroke="rgba(30, 58, 138, 0.06)" strokeWidth="0.8" />
                        <path d="M 0 10 Q 20 30 40 10 T 80 10" fill="none" stroke="rgba(30, 58, 138, 0.06)" strokeWidth="0.8" />
                        <path d="M 0 70 Q 20 50 40 70 T 80 70" fill="none" stroke="rgba(30, 58, 138, 0.06)" strokeWidth="0.8" />
                        {/* Diagonal fine grid lines */}
                        <line x1="0" y1="0" x2="80" y2="80" stroke="rgba(30, 58, 138, 0.04)" strokeWidth="0.4" />
                        <line x1="80" y1="0" x2="0" y2="80" stroke="rgba(30, 58, 138, 0.04)" strokeWidth="0.4" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#antiTamperMesh)" />
                  </svg>
                </div>

                {/* Repeating Tiled Security Grid Watermark Loop */}
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-8 gap-y-12 gap-x-8 pointer-events-none select-none z-0 opacity-[0.02] p-10 overflow-hidden">
                  {Array.from({ length: 40 }).map((_, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center gap-1 transform rotate-[-25deg] scale-90">
                      {idx % 2 === 0 ? (
                        <img src={GraphuraLogo} alt="watermark logo" className="w-8 h-8 object-contain rounded-full grayscale" />
                      ) : (
                        <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      )}
                      <span className="text-[5.5px] font-black uppercase tracking-widest text-slate-800">GIP</span>
                    </div>
                  ))}
                </div>

                 {/* Top Letterhead Header */}
                 <div className="relative z-10 space-y-4">
                   <div className="flex flex-col items-center text-center pb-4 border-b-2 border-slate-900 gap-2 select-none">
                     <img
                       src={GraphuraLogo}
                       alt="Company Logo"
                       className="h-14 w-auto object-contain mb-1"
                     />
                     <div className="space-y-0.5">
                       <div className="text-[8px] font-black text-slate-500 uppercase tracking-[2px] leading-none">GRAPHURA INTERNSHIP PROGRAM - 2026</div>
                       <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-blue-950 leading-none">
                         Graphura India Private Limited
                       </h2>
                       <div className="flex items-center justify-center gap-1 text-[8px] font-extrabold text-slate-500 uppercase tracking-wider mt-1">
                         <span>near Anurag Bhawan, Sector 1, Mansarovar, Jaipur, Rajasthan 302020</span>
                       </div>
                     </div>
                   </div>

                   {/* Clean Non-Table Letterhead Metadata Lines */}
                   <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pb-2 border-b border-slate-200 select-none px-4">
                     <div>
                       <strong className="text-slate-800 uppercase font-black tracking-wider">Ref No:</strong> GIP/OL/{selectedIntern.uniqueId || "N/A"}
                     </div>
                     <div>
                       <strong className="text-slate-800 uppercase font-black tracking-wider">Date:</strong> {offerData.issueDate}
                     </div>
                   </div>

                   <div className="text-center my-6 space-y-1">
                     <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest border-b-2 border-slate-950 pb-0.5 inline-block">
                       Internship Offer Letter
                     </h3>
                   </div>

                   {/* Content Body (Strict Government Serif) */}
                   <div 
                     className="space-y-5 text-xs text-slate-900 leading-relaxed text-justify px-4 z-10 relative"
                     style={{
                       fontFamily: "Georgia, 'Times New Roman', serif",
                       textIndent: "1.5rem"
                     }}
                   >
                     <p className="font-sans font-black text-slate-800 text-[11px] mb-2">{offerData.salutation}</p>
                     
                     <p>
                       We are pleased to offer you an internship opportunity at <strong>Graphura India Private Limited</strong>. Based on your academic background, technical skills, and enthusiasm for industry-scale software engineering, you have been selected for the position of <strong>{offerData.domain}</strong>.
                     </p>

                     <p>
                       Your internship is scheduled to commence on <strong>{new Date(offerData.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong> and will run for a continuous duration of <strong>{offerData.duration}</strong>. During this professional engagement, you will work closely with our core engineering teams, participate in project sprints, analyze product specifications, and deliver production-ready software solutions.
                     </p>

                     <p>
                       This is a <strong>{offerData.stipend}</strong> position. In this capacity, you will receive expert mentorship, hands-on experience with modern tech stacks, and regular code reviews to foster your technical capabilities. Please note that you are required to comply with all internal corporate policies, data security guidelines, and intellectual property confidentiality norms of Graphura India.
                     </p>

                     <p>
                       Upon the successful completion of your internship tenure, subject to your performance ratings and compliance with our standards, you will be awarded an official <strong>Internship Completion Certificate</strong> and a corporate <strong>Letter of Recommendation (LOR)</strong> to support your future professional pursuits.
                     </p>

                     <p>
                       Please confirm your acceptance of this offer by signing and returning a copy of this letter within three business days. We look forward to welcoming you to our team and witnessing your valuable contributions to Graphura India Private Limited.
                     </p>
                    </div>
                  </div>

                {/* Bottom Signature & Verification Seal Grid */}
                <div className="relative z-10 space-y-6 select-none">
                  <div className="flex items-end justify-between px-4">
                    
                    {/* QR Code & Seal Layout */}
                    <div className="flex items-center gap-6 select-none">
                      
                      {/* Interactive Barcode */}
                      <div className="flex flex-col items-center gap-1 font-sans">
                        <div className="w-28 h-6 flex items-center justify-between gap-[1.5px] px-1 bg-white border border-slate-350">
                          {Array.from({ length: 32 }).map((_, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900"
                              style={{
                                width: idx % 3 === 0 ? "2.5px" : idx % 5 === 0 ? "1px" : "1.8px",
                                height: "16px"
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[6.5px] font-mono text-slate-500 font-bold tracking-widest">
                          INTERN ID: {selectedIntern.uniqueId || "N/A"}
                        </span>
                      </div>

                      {/* Official Royal Navy/Gold Seal Embellishment */}
                      <div className="relative flex-shrink-0 w-20 h-20 text-blue-900/95 flex items-center justify-center transform rotate-[-6deg] hover:rotate-0 transition-transform duration-300 drop-shadow-sm">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                          <defs>
                            <path
                              id="sealTextPath"
                              d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                            />
                          </defs>
                          
                          {/* Concentric outer rings with detailed dashes */}
                          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3,1" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.2" />
                          <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,2" />
                          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.2" />
                          
                          {/* Curved text wrapped around seal rings */}
                          <text fill="currentColor" className="text-[7.5px] font-black uppercase tracking-widest font-sans">
                            <textPath href="#sealTextPath" startOffset="0%">
                              • GRAPHURA INDIA PVT LTD • OFFICIAL REGISTRY SEAL
                            </textPath>
                          </text>

                          {/* Graphura Favicon G Logo in place of star */}
                          <image
                            href={GraphuraFavicon}
                            x="38"
                            y="38"
                            width="24"
                            height="24"
                            className="rounded-full"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Dynamic Signature Block */}
                    <div className="text-right space-y-1.5 max-w-[180px]">
                      {signatureType === "cursive" && (
                        <div
                          className="text-xl text-blue-800/90 pr-2 select-none"
                          style={{
                            fontFamily: "'Playball', 'Great Vibes', 'Caveat', cursive",
                            letterSpacing: "1px"
                          }}
                        >
                          {offerData.signatoryName}
                        </div>
                      )}

                      {signatureType === "upload" && signatureFile && (
                        <div className="flex justify-end pr-2">
                          <img
                            src={signatureFile}
                            alt="Signatory Signature"
                            className="h-10 object-contain max-w-[140px] select-none"
                          />
                        </div>
                      )}

                      {signatureType === "none" && (
                        <div className="h-10 flex items-center justify-end pr-4 text-[9px] font-mono text-slate-350 italic select-none">
                          Authorized Physical Stamp
                        </div>
                      )}

                      <div className="border-t border-slate-900/60 pt-1 font-sans">
                        <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{offerData.signatoryName}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">Graphura Admin Executive</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-[7.5px] text-slate-500 font-bold uppercase tracking-widest mt-6 border-t border-slate-200/80 pt-3 font-sans">
                    Graphura India Private Limited • 2026 • Graphura Internship Program
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-slate-200 border-dashed rounded-2xl p-16 text-center text-slate-400 space-y-4">
                <FileText size={64} className="mx-auto text-slate-300 animate-pulse" />
                <div>
                  <h3 className="font-bold text-slate-600">No Candidate Selected</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Please search and select an eligible intern from the sidebar search to generate and personalize their Internship Offer Letter!
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminOfferLetterPage;
