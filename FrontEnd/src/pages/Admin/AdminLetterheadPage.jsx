import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ArrowLeft,
  Printer,
  Download,
  Search,
  FileText,
  RefreshCw,
  User,
  PlusCircle,
} from "lucide-react";
import GraphuraLogo from "../../../public/GraphuraLogo.jpg";
import GraphuraFavicon from "../../../public/Graphura.jpg";

const AdminLetterheadPage = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Candidates list state
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntern, setSelectedIntern] = useState(null);

  // Document custom parameters state
  const [downloading, setDownloading] = useState(false);
  const [letterData, setLetterData] = useState({
    refNo: "GIP/LH/" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString().split("T")[0],
    recipientName: "TO WHOM IT MAY CONCERN",
    recipientDesignation: "Recipient Designation / Org",
    subject: "GENERAL ADMINISTRATIVE CORRESPONDENCE",
    bodyText: "This is a general-purpose official letterhead issued by Graphura India Private Limited. You can fully customize this body text, subject line, recipient information, and the reference coordinates from the configuration panel on the left.\n\nThis letterhead is designed for various administrative matters, vendor communications, official declarations, and authorized notifications. Please ensure proper verification records are maintained for this reference.",
    signatoryName: "Authorized Signatory",
    docId: "REF-" + Math.floor(1000 + Math.random() * 9000),
  });

  const [signatureType, setSignatureType] = useState("cursive"); // "cursive" | "upload" | "none"
  const [signatureFile, setSignatureFile] = useState("");

  // Authentication check
  useEffect(() => {
    if (!storedUser) {
      navigate("/login");
      return;
    }
    fetchCompletedInterns();
  }, []);

  // Fetch interns for optional metadata linking
  const fetchCompletedInterns = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/interns", {
        withCredentials: true,
      });
      const list = data.interns || [];
      setInterns(list);
    } catch (err) {
      console.error("Error fetching interns for Letterhead:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setLetterData((prev) => ({
      ...prev,
      refNo: `GIP/LH/${intern.uniqueId || "N/A"}`,
      recipientName: intern.fullName || "",
      recipientDesignation: intern.domain ? `${intern.domain} Intern` : "Intern",
      docId: intern.uniqueId || "N/A",
    }));
  };

  const handleClearSelectedIntern = () => {
    setSelectedIntern(null);
    setLetterData((prev) => ({
      ...prev,
      refNo: "GIP/LH/" + Math.floor(100000 + Math.random() * 900000),
      recipientName: "RECIPIENT NAME",
      recipientDesignation: "DESIGNATION / COMPANY",
      docId: "GEN-" + Math.floor(1000 + Math.random() * 9000),
    }));
    setSearchTerm("");
  };

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

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    // Get all style sheets to preserve dynamic CSS layout inside sandboxed print window
    let styles = "";
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        for (let j = 0; j < sheet.cssRules.length; j++) {
          styles += sheet.cssRules[j].cssText;
        }
      } catch (e) {
        // Skip cross-origin stylesheets that prevent raw read access
      }
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print Letterhead Document</title>
          <style>${styles}</style>
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
            ${printContent}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Give browser time to load assets inside iframe
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 800);
  };

  const handleDownloadPDF = async () => {
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
      pdf.save(`Letterhead_${letterData.recipientName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Error generating Letterhead PDF, falling back to clean sandbox print:", err);
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
            padding: 2cm !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #faf8f5 !important;
          }
        }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Playball&family=Great+Vibes&family=Caveat&display=swap');
        .font-sans {
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
                <FileText className="text-blue-600" size={24} />
                Universal Letterhead Generator
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Official Credential Suite for Issuing Customized General & Candidate Correspondence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow cursor-pointer"
            >
              <Printer size={16} />
              Print Correspondence
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          
          {/* Left panel - Selection & Custom Details Configuration (Right 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Linking & Candidate Selection Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                  <span>🔍 1. Link Candidate (Optional)</span>
                </h2>
                {selectedIntern && (
                  <button
                    onClick={handleClearSelectedIntern}
                    className="text-[9px] font-black uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-all"
                  >
                    Clear / Go General
                  </button>
                )}
              </div>

              {!selectedIntern ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Autofill from active/completed interns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-xs font-bold transition-all bg-slate-50"
                    />
                  </div>

                  {searchTerm.trim() !== "" && (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                      {filteredInterns.length === 0 ? (
                        <p className="text-[10px] font-bold text-slate-400 py-4 text-center">
                          No interns found matching search.
                        </p>
                      ) : (
                        filteredInterns.map((intern) => (
                          <button
                            key={intern._id}
                            type="button"
                            onClick={() => handleSelectIntern(intern)}
                            className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all cursor-pointer bg-white"
                          >
                            <div>
                              <div className="text-xs font-black uppercase text-slate-800">{intern.fullName}</div>
                              <div className="text-[9px] text-slate-500 font-mono">{intern.uniqueId || "N/A"}</div>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {intern.domain}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {searchTerm.trim() === "" && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 select-none">
                      <PlusCircle className="text-blue-600 flex-shrink-0" size={18} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wide leading-tight">
                        General Mode Active: Fill recipient details below manually!
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 text-green-900 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="text-green-600" size={18} />
                    <div>
                      <div className="text-xs font-black uppercase leading-none">{selectedIntern.fullName}</div>
                      <div className="text-[9px] text-green-700 font-mono mt-0.5">Linked ID: {selectedIntern.uniqueId}</div>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-wider bg-green-200/60 px-2.5 py-1 rounded">
                    Linked Candidate
                  </span>
                </div>
              )}
            </div>

            {/* 2. Custom Letter Details Config Panel */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase text-blue-800 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <span>🖋️ 2. Customize Letter Content</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 block">Reference No.</label>
                  <input
                    type="text"
                    value={letterData.refNo}
                    onChange={(e) => setLetterData({ ...letterData, refNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 block">Issue Date</label>
                  <input
                    type="date"
                    value={letterData.date}
                    onChange={(e) => setLetterData({ ...letterData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 block">Recipient Name / Company</label>
                  <input
                    type="text"
                    value={letterData.recipientName}
                    onChange={(e) => setLetterData({ ...letterData, recipientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 block">Designation / Department</label>
                  <input
                    type="text"
                    value={letterData.recipientDesignation}
                    onChange={(e) => setLetterData({ ...letterData, recipientDesignation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 block">Reference ID (For barcode/footer)</label>
                  <input
                    type="text"
                    value={letterData.docId}
                    onChange={(e) => setLetterData({ ...letterData, docId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Subject Line</label>
                <input
                  type="text"
                  value={letterData.subject}
                  onChange={(e) => setLetterData({ ...letterData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Letter Body Paragraph(s)</label>
                <textarea
                  rows={7}
                  value={letterData.bodyText}
                  onChange={(e) => setLetterData({ ...letterData, bodyText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-y leading-relaxed"
                  placeholder="Write custom body paragraph here..."
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
                    <label className="text-[9px] font-black uppercase text-blue-700 block">Upload Signature Image (PNG/JPG)</label>
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

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 block">Signatory Name</label>
                  <input
                    type="text"
                    value={letterData.signatoryName}
                    onChange={(e) => setLetterData({ ...letterData, signatoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Right panel - Full executive layout Letterhead Preview (Left 7/12) */}
          <div className="lg:col-span-7">
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                      </svg>
                    )}
                    <span className="text-[5.5px] font-black uppercase tracking-widest text-slate-800">GIP</span>
                  </div>
                ))}
              </div>

              {/* Top Letterhead Header */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 gap-6 select-none px-4">
                  {/* Left Side: Logo */}
                  <img
                    src={GraphuraLogo}
                    alt="Company Logo"
                    className="h-16 w-auto object-contain"
                  />
                  
                  {/* Right Side: Header Text (Right Aligned) */}
                  <div className="text-right space-y-0.5">
                    <div className="text-[8.5px] font-black text-slate-500 uppercase tracking-[2.5px] leading-none">GRAPHURA INTERNSHIP PROGRAM - 2026</div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-blue-950 leading-none mt-1">
                      Graphura India Private Limited
                    </h2>
                    <div className="text-[8.5px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                      near Anurag Bhawan, Sector 1, Mansarovar, Jaipur, Rajasthan 302020
                    </div>
                  </div>
                </div>

                {/* Clean Non-Table Letterhead Metadata Lines */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pb-2 border-b border-slate-200 select-none px-4">
                  <div>
                    <strong className="text-slate-800 uppercase font-black tracking-wider">Ref No:</strong> {letterData.refNo || "N/A"}
                  </div>
                  <div>
                    <strong className="text-slate-800 uppercase font-black tracking-wider">Date:</strong> {new Date(letterData.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>

                {/* Recipient Coordinates */}
                {letterData.recipientName && (
                  <div className="space-y-0.5 text-xs text-slate-900 font-sans z-10 relative pt-2 px-4 select-none">
                    <p className="font-semibold text-slate-700">To,</p>
                    <p className="font-black text-[12px] text-slate-950 uppercase">{letterData.recipientName}</p>
                    {letterData.recipientDesignation && <p className="font-bold text-[10.5px] text-slate-700">{letterData.recipientDesignation}</p>}
                  </div>
                )}

                {letterData.subject && (
                  <div className="pt-2 px-4">
                    <p className="text-xs font-black text-slate-950 underline select-none uppercase tracking-wide">
                      Subject: {letterData.subject}
                    </p>
                  </div>
                )}

                {/* Content Body (Strict Government Serif) */}
                <div 
                  className="space-y-5 text-xs text-slate-900 leading-relaxed text-justify px-4 z-10 relative mt-4"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    textIndent: "1.5rem",
                    fontSize: "12.5px"
                  }}
                >
                  {letterData.bodyText.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Bottom Signature & Verification Seal Grid */}
              <div className="relative z-10 space-y-6 select-none mt-6">
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
                      <span className="text-[6.5px] font-mono text-slate-500 font-bold tracking-widest uppercase">
                        REF ID: {letterData.docId || "N/A"}
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
                        {letterData.signatoryName}
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
                      <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{letterData.signatoryName}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">Graphura Admin Executive</p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[7.5px] text-slate-500 font-bold uppercase tracking-widest mt-6 border-t border-slate-200/80 pt-3 font-sans">
                  Graphura India Private Limited • 2026 • Graphura Internship Program
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminLetterheadPage;
