import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Award, ArrowLeft, Search, FileText, Printer, CheckCircle, RefreshCw, Edit3, Download } from "lucide-react";
import GraphuraLogo from "../../../public/GraphuraLogo.jpg";
import GraphuraFavicon from "../../../public/Graphura.jpg";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const StartupIndiaLogoSVG = () => (
  <svg width="60" height="32" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
    <path d="M10 45 C30 25, 70 25, 90 45" fill="none" stroke="#FF9933" strokeWidth="4" strokeLinecap="round" />
    <path d="M15 49 C35 31, 65 31, 85 49" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 53 C40 37, 60 37, 80 53" fill="none" stroke="#138808" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="30" r="6" fill="#000080" />
    <circle cx="50" cy="30" r="9" fill="none" stroke="#000080" strokeWidth="1" strokeDasharray="2,2" />
    <text x="10" y="20" fill="#0a192f" fontSize="10" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">startup</text>
    <text x="56" y="20" fill="#FF9933" fontSize="11" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">india</text>
  </svg>
);

const MsmeLogoSVG = () => (
  <svg width="60" height="32" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" className="opacity-95">
    <circle cx="28" cy="30" r="16" fill="none" stroke="#005B94" strokeWidth="2.5" />
    {Array.from({ length: 8 }).map((_, i) => (
      <line
        key={i}
        x1="28"
        y1="30"
        x2={28 + 14 * Math.cos((i * Math.PI) / 4)}
        y2={30 + 14 * Math.sin((i * Math.PI) / 4)}
        stroke="#FF9933"
        strokeWidth="1.5"
      />
    ))}
    <circle cx="28" cy="30" r="5" fill="#138808" />
    <text x="50" y="24" fill="#0a192f" fontSize="12" fontWeight="900" fontFamily="sans-serif">M S M E</text>
    <text x="50" y="34" fill="#6b7280" fontSize="7" fontWeight="bold" fontFamily="sans-serif">GOVT. OF INDIA</text>
    <text x="50" y="42" fill="#138808" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">सूक्ष्म, लघु उद्यम</text>
  </svg>
);

const AdminLorPage = () => {
  const navigate = useNavigate();
  const printRef = useRef();

  // Authentication check
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntern, setSelectedIntern] = useState(null);

  // LOR custom parameters state
  const [lorData, setLorData] = useState({
    salutation: "To Whom It May Concern",
    keyStrengths: "Technical Competence, Team Collaboration, Problem Solving",
    signatoryName: "Managing Director",
    issueDate: new Date().toISOString().split("T")[0],
    customText: "",
    rating: "Excellent"
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

  const handleDownloadPDF = async () => {
    if (!selectedIntern) return;
    try {
      setDownloading(true);
      const element = printRef.current;

      const canvas = await html2canvas(element, {
        scale: 2.2, // Extremely stable high-resolution scale
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#faf8f5",
        logging: false,
        imageTimeout: 5000, // Timeout local file asset loaders
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

      const fileName = `LOR_${selectedIntern.fullName.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Error generating LOR PDF, falling back to clean sandbox print:", err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

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
      // We can allow LOR for Active or Completed interns, let's load all active/completed interns
      const list = data.interns || [];
      const eligible = list.filter(
        (intern) => intern.status === "Active" || intern.status === "Completed"
      );
      setInterns(eligible);
      // Removed auto-selection to allow clean search-based loading
      // if (eligible.length > 0) {
      //   handleSelectIntern(eligible[0]);
      // }
    } catch (err) {
      console.error("Error fetching interns for LOR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    // Auto-generate sophisticated LOR body text
    const defaultText = `During the tenure of their internship, ${intern.fullName} demonstrated an outstanding level of dedication, technical prowess, and an eagerness to learn. They were actively involved in analyzing project specifications, drafting implementation plans, and delivering key components of our ongoing solutions. Their performance was exemplary, and they consistently went above and beyond to assist the team.`;

    setLorData({
      salutation: "To Whom It May Concern",
      keyStrengths: intern.domain === "Web Development"
        ? "Frontend Architectures, API Integrations, Team Collaboration"
        : intern.domain === "UI/UX Design"
          ? "User Research, Interactive Prototyping, Sleek Visual Styling"
          : "Professional Communication, Technical Execution, Critical Analysis",
      signatoryName: "Authorized Signatory",
      issueDate: new Date().toISOString().split("T")[0],
      customText: defaultText,
      rating: intern.performance || "Excellent"
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
          <title>Print Recommendation Letter</title>
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
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-slate-600"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="text-blue-600" size={24} />
                Letter of Recommendation (LOR) Generator
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Official Credential Suite for High-Performing Intern Graduates
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

          {/* Left panel - Selection & Parameters Configuration (Right 5/12) */}
          <div className="lg:col-span-5 space-y-6">

            {/* 1. Intern Selection Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase text-[#1e3a8a] tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <span>🔍 1. Select Intern Candidate</span>
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
                  Loading eligible candidates...
                </div>
              ) : searchTerm.trim() === "" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 select-none">
                  <span className="text-xl mb-1.5">🔍</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Query Candidate</span>
                  <p className="text-[9.5px] font-semibold text-slate-400 max-w-[220px] mt-1 leading-normal">
                    Type candidate's full name or Unique ID in the search bar above to generate their LOR.
                  </p>
                </div>
              ) : filteredInterns.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 py-4 text-center">
                  No active or completed interns found matching search.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredInterns.map((intern) => (
                    <button
                      key={intern._id}
                      onClick={() => handleSelectIntern(intern)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedIntern?._id === intern._id
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
                  <span>2. Personalize Letter Details</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Salutation Heading</label>
                    <input
                      type="text"
                      value={lorData.salutation}
                      onChange={(e) => setLorData({ ...lorData, salutation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Evaluation Grade</label>
                    <select
                      value={lorData.rating}
                      onChange={(e) => setLorData({ ...lorData, rating: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none cursor-pointer"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Outstanding">Outstanding</option>
                      <option value="Highly Satisfactory">Highly Satisfactory</option>
                      <option value="Good">Good</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Issue Date</label>
                    <input
                      type="date"
                      value={lorData.issueDate}
                      onChange={(e) => setLorData({ ...lorData, issueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Signatory Title</label>
                    <input
                      type="text"
                      value={lorData.signatoryName}
                      onChange={(e) => setLorData({ ...lorData, signatoryName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Strengths & Skills</label>
                  <input
                    type="text"
                    value={lorData.keyStrengths}
                    onChange={(e) => setLorData({ ...lorData, keyStrengths: e.target.value })}
                    placeholder="E.g. Full-Stack Development, Architecture, Team Leadership"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Performance Assessment Summary</label>
                  <textarea
                    rows="4"
                    value={lorData.customText}
                    onChange={(e) => setLorData({ ...lorData, customText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none resize-none leading-relaxed"
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
                        <path d="M 0 40 Q 20 20 40 40 T 80 40" fill="none" stroke="rgba(194, 65, 12, 0.15)" strokeWidth="0.8" />
                        <path d="M 0 10 Q 20 30 40 10 T 80 10" fill="none" stroke="rgba(30, 58, 138, 0.12)" strokeWidth="0.8" />
                        <path d="M 0 70 Q 20 50 40 70 T 80 70" fill="none" stroke="rgba(30, 58, 138, 0.12)" strokeWidth="0.8" />
                        {/* Diagonal fine grid lines */}
                        <line x1="0" y1="0" x2="80" y2="80" stroke="rgba(194, 65, 12, 0.05)" strokeWidth="0.4" />
                        <line x1="80" y1="0" x2="0" y2="80" stroke="rgba(30, 58, 138, 0.05)" strokeWidth="0.4" />
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

                  {/* Gazetted Metadata Table Frame (Authentic Government Style) */}
                  <div className="grid grid-cols-4 border border-slate-900/60 text-[9.5px] font-mono bg-amber-50/10 rounded overflow-hidden select-none">
                    <div className="border-r border-b border-slate-900/60 p-1.5 bg-slate-100/50 font-bold text-slate-700">SERIAL NO:</div>
                    <div className="border-b border-slate-900/60 p-1.5 font-bold text-slate-900">GIP/LOR/{selectedIntern.uniqueId || "N/A"}</div>
                    <div className="border-l border-r border-b border-slate-900/60 p-1.5 bg-slate-100/50 font-bold text-slate-700">ISSUE DATE:</div>
                    <div className="border-b border-slate-900/60 p-1.5 font-bold text-slate-900">{lorData.issueDate}</div>

                    <div className="border-r border-slate-900/60 p-1.5 bg-slate-100/50 font-bold text-slate-700">PROGRAM NAME:</div>
                    <div className="p-1.5 font-bold text-slate-900">GRAPHURA INTERNSHIP PROGRAM</div>
                    <div className="border-l border-r border-slate-900/60 p-1.5 bg-slate-100/50 font-bold text-slate-700">GRADE:</div>
                    <div className="p-1.5 font-black text-green-800">{lorData.rating}</div>
                  </div>

                  {/* Bilingual Letter Title */}
                  <div className="text-center my-6 space-y-1">
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest border-b-2 border-slate-950 pb-0.5 inline-block">
                      Letter of Recommendation
                    </h3>
                  </div>

                  {/* Content Body (Strict Government Serif) */}
                  <div
                    className="space-y-5 text-xs text-slate-900 leading-relaxed text-justify px-4 z-10 relative"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "12.5px",
                      letterSpacing: "0.15px"
                    }}
                  >
                    <p className="font-extrabold text-slate-955 text-[13px]">{lorData.salutation},</p>

                    <p className="indent-8 text-[12.5px]">
                      It is with high professional evaluation and competence that we release this official recommendation for{" "}
                      <strong className="font-extrabold text-slate-955 uppercase tracking-wide">{selectedIntern.fullName}</strong>, who has
                      successfully completed their scheduled internship tenure under the national ledger registry of Graphura Skill Program. They served
                      competently in our organization as a registered <strong className="font-extrabold text-blue-900 uppercase">{selectedIntern.domain} Intern</strong>.
                    </p>

                    <p className="text-[12.5px]">
                      Throughout their dynamic tenure, <strong className="font-bold text-slate-955">{selectedIntern.fullName}</strong>{" "}
                      displayed exceptional technical command, regular work attendance, and systematic initiative. They successfully resolved critical tasks and demonstrated advanced core engineering deliverables in{" "}
                      <strong className="font-bold text-slate-955">{lorData.keyStrengths}</strong>.
                    </p>

                    <p className="indent-8 text-[12.5px]">
                      {lorData.customText}
                    </p>

                    <p className="text-[12.5px]">
                      Their overall professional execution during the assessment has been recognized and designated with an outstanding rating of{" "}
                      <strong className="font-extrabold text-slate-950 uppercase">{lorData.rating}</strong>. They hold an exemplary character record, and we believe they will prove to be a highly competent addition to any engineering workspace or institution.
                    </p>

                    <p className="text-[12.5px]">
                      We strongly endorse <strong className="font-bold text-slate-955">{selectedIntern.fullName}</strong> for all
                      their future academic, technical, and corporate aspirations, and we wish them tremendous growth and achievements ahead.
                    </p>
                  </div>
                </div>

                {/* Bottom Signatures & Legal */}
                <div className="relative z-10 px-4">
                  <div className="flex items-end justify-between border-t border-slate-900/40 pt-6 mt-8">
                    <div className="space-y-1">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider leading-none">सक्षम प्राधिकारी / COMPETENT SIGNATORY</p>
                      <div className="h-10 flex items-center justify-start">
                        {signatureType === "cursive" && (
                          <span
                            className="italic text-lg text-blue-900/80 font-black tracking-wider opacity-90 select-none"
                            style={{ fontFamily: "'Georgia', cursive, serif" }}
                          >
                            {lorData.signatoryName || "Authorized Sign"}
                          </span>
                        )}
                        {signatureType === "upload" && signatureFile && (
                          <img
                            src={signatureFile}
                            alt="Uploaded Signature"
                            className="max-h-10 max-w-[120px] object-contain select-none mix-blend-multiply"
                          />
                        )}
                        {signatureType === "none" && (
                          <div className="h-10 w-24 border-b border-dashed border-slate-350"></div>
                        )}
                      </div>
                      <p className="text-xs font-black text-slate-955 leading-none">{lorData.signatoryName}</p>
                      <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-sans leading-none">
                        Graphura Evaluation & Certification Board
                      </p>
                    </div>

                    {/* QR Code & Seal Layout */}
                    <div className="flex items-center gap-6 select-none">

                      {/* Interactive Barcode */}
                      <div className="flex flex-col items-center gap-1 font-sans">
                        <div className="w-28 h-6 flex items-center justify-between gap-[1.5px] px-1 bg-white border border-slate-350">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-full bg-slate-900"
                              style={{ width: `${(i % 4 === 0 ? 3 : i % 2 === 0 ? 1 : 1.5)}px` }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-[6.5px] font-mono text-slate-500 font-bold tracking-widest">
                          INTERN ID: {selectedIntern.uniqueId || "N/A"}
                        </span>
                      </div>

                      {/* Official Seal stamp */}
                      <div className="relative flex items-center justify-center font-sans opacity-95 hover:opacity-100 transition-opacity">
                        <svg
                          width="90"
                          height="90"
                          viewBox="0 0 100 100"
                          className="transform rotate-[-8deg] select-none text-blue-900 drop-shadow-sm"
                        >
                          <defs>
                            {/* Circular path for the text to wrap around */}
                            <path
                              id="sealTextPath"
                              d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                            />
                          </defs>

                          {/* Concentric outer rings with detailed dashes */}
                          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3,1" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.2" />
                          <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1" />
                          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1,1" />

                          {/* Curved Text Path */}
                          <text className="font-sans text-[5.6px] font-black tracking-[1.4px] fill-current">
                            <textPath href="#sealTextPath" startOffset="5%">
                              GRAPHURA INDIA PRIVATE LIMITED • OFFICIAL SEAL •
                            </textPath>
                          </text>

                          {/* Inner Graphic Details */}
                          <g transform="translate(50,50) scale(0.85)">
                            <circle cx="0" cy="0" r="16" fill="currentColor" className="opacity-[0.08]" />
                            {/* Concentric micro dots inside */}
                            <circle cx="0" cy="0" r="20" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,2" />
                          </g>

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
                  </div>

                  <div className="text-center text-[7.5px] text-slate-500 font-bold uppercase tracking-widest mt-6 border-t border-slate-200/80 pt-3 font-sans">
                    Graphura India Private Limited • 2026 • Graphura Internship Program
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-slate-200 border-dashed rounded-2xl p-16 text-center text-slate-400 space-y-4">
                <Award size={64} className="mx-auto text-slate-300 animate-pulse" />
                <div>
                  <h3 className="font-bold text-slate-600">No Intern Candidate Selected</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Please select an active or completed intern from the sidebar search to auto-generate their Letter of Recommendation letterhead!
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

export default AdminLorPage;
