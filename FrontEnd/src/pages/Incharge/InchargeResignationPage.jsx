import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  ChevronDown,
} from "lucide-react";
import ResignationPreviewModal from "../../components/ResignationPreviewModal";

export default function InchargeResignationPage() {
  const [data, setData] = useState([]);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  // FILTER STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchResignations = async () => {
    try {
      const res = await axios.get("/api/incharge/resignations", {
        withCredentials: true,
      });
      setData(res.data.data);
    } catch (err) {
      console.error("Error fetching resignations", err);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredData = data.filter((r) => {
    const matchesSearch =
      r.internId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || r.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      (r.createdAt &&
        new Date(r.createdAt).toISOString().split("T")[0] === dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  /* ================= STATS ================= */
  const total = filteredData.length;
  const Pending = filteredData.filter((d) => d.status === "Pending").length;
  const Approved = filteredData.filter((d) => d.status === "Approved").length;
  const Rejected = filteredData.filter((d) => d.status === "Rejected").length;

  const stats = [
    { title: "TOTAL RESIGNATIONS", value: total, icon: <FileText className="text-blue-600" />, bg: "bg-blue-100" },
    { title: "Pending", value: Pending, icon: <Clock className="text-yellow-600" />, bg: "bg-yellow-100" },
    { title: "Approved", value: Approved, icon: <CheckCircle className="text-green-600" />, bg: "bg-green-100" },
    { title: "Rejected", value: Rejected, icon: <XCircle className="text-red-600" />, bg: "bg-red-100" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Resignation Management
          </h1>
          <p className="text-gray-500">
            Manage all intern resignation requests
          </p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={fetchResignations}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ================= FILTER BAR ================= */}

      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-md text-gray-500 font-semibold mb-2 block">Search</label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search by intern ID or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/50 shadow-sm rounded-xl bg-gray-50 focus:bg-white focus:border-2 focus:border-green-300 focus:outline-none "
              />
            </div>
          </div>

          <div>
            <label className="text-md text-gray-500 font-semibold mb-2 block">Status</label>
            <div className="relative">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/50 shadow-sm rounded-xl bg-gray-50 focus:border-2 focus:border-green-300 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-md text-gray-500 font-semibold mb-2 block">
              Applied Date
            </label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/50 shadow-sm rounded-xl bg-gray-50 focus:border-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= RESIGNATION TABLE ================= */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Intern & Resignation Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Applied Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">

              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No resignation requests found
                  </td>
                </tr>
              ) : (
                filteredData.map((r) => (
                  <React.Fragment key={r._id}>
                    <tr className="hover:bg-gray-50 transition cursor-pointer">
                      {/* INTERN DETAILS */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow">
                            <User size={20} className="text-white" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {r.intern?.fullName || "Intern"}
                            </p>

                            <p className="text-xs text-gray-500">
                              ID: {r.internId}
                            </p>
                            <span className="inline-flex mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                              Resignation
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="px-6 py-5">
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            {r.intern?.email || "Not available"}
                          </p>

                          <p className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            {r.intern?.mobile || "Not available"}
                          </p>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {r.status === "Pending" && <Clock size={16} className="text-yellow-600" />}
                          {r.status === "Approved" && <CheckCircle size={16} className="text-green-600" />}
                          {r.status === "Rejected" && <XCircle size={16} className="text-red-600" />}

                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold
                            ${r.status === "Pending" && "bg-yellow-100 text-yellow-800 border border-yellow-200"}
                            ${r.status === "Approved" && "bg-green-100 text-green-800 border border-green-200"}
                            ${r.status === "Rejected" && "bg-red-100 text-red-800 border border-red-200"}
                          `}
                          >
                            {r.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setSelectedResignation(
                                selectedResignation?._id === r._id ? null : r
                              )
                            }
                            className="p-3 text-amber-700 hover:text-amber-800 bg-amber-100 rounded-lg cursor-pointer"
                          >
                            <ChevronDown
                              size={18}
                              className={`transition ${selectedResignation?._id === r._id ? "" : "rotate-270"
                                }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selectedResignation?._id === r._id && (
                      <tr>
                        <td colSpan="5">
                          <ResignationPreviewModal resignation={selectedResignation} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}