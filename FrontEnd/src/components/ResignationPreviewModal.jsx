import React from "react";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Briefcase,
    Clock,
    CheckCircle,
    Info as InfoIcon,
    Image as ImageIcon,
    Download
} from "lucide-react";

const ResignationPreviewModal = ({ resignation }) => {
    if (!resignation) return null;

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-GB");
    };

    return (
        <div className="w-full">
            <div className="w-full bg-white flex flex-col">
                <div className="px-6 pt-6 pb-4">
                    <h2 className="text-2xl font-bold text-gray-600 flex gap-4">
                        Resignation Review
                        <div>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                ${resignation.status === "Pending" && "bg-amber-100 text-amber-700"}
                ${resignation.status === "Approved" && "bg-emerald-100 text-emerald-700"}
                ${resignation.status === "Rejected" && "bg-rose-100 text-rose-700"}
              `}
                            >
                                {resignation.status}
                            </span>
                        </div>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Intern resignation details
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 text-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(resignation.evidenceUrl);
                                            const blob = await response.blob();

                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement("a");

                                            link.href = url;
                                            link.download = "evidence";
                                            document.body.appendChild(link);
                                            link.click();

                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch (err) {
                                            console.error("Download failed", err);
                                        }
                                    }}
                                    className="p-2.5 text-sm bg-violet-500 hover:bg-violet-600 cursor-pointer flex items-center gap-2 font-semibold text-white rounded-lg shadow"
                                >
                                    Click Here
                                    <Download size={16} />
                                </button>
                                Evidence
                            </p>
                            <a
                                href={resignation.evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                            >
                                <img
                                    src={resignation.evidenceUrl}
                                    alt="Evidence"
                                    className="w-fit max-h-64 object-contain rounded-xl shadow-sm
        bg-white transition-transform duration-200
        group-hover:scale-[1.02] group-hover:shadow-md"
                                />
                            </a>
                        </div>

                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                                <span className="p-3 rounded-xl bg-amber-100">
                                    <InfoIcon size={14} className="text-amber-600" />
                                </span>
                                Reason
                            </p>

                            <div className="bg-gray-50 h-64 border border-gray-100 rounded-xl p-4 text-gray-700 leading-relaxed">
                                {resignation.reason}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Info icon={InfoIcon} label="Intern ID" value={resignation.internId} />
                        <Info icon={User} label="Full Name" value={resignation?.intern?.fullName} />
                        <Info icon={Briefcase} label="Domain" value={resignation.domain} />
                        <Info icon={Clock} label="Resignation Type" value={resignation.resignationType} />
                        <Info icon={Mail} label="Email" value={resignation?.intern?.email} />
                        <Info icon={Phone} label="Phone" value={resignation?.intern?.mobile} />
                        <Info icon={Calendar} label="DOB" value={resignation?.intern?.dob} />
                        <Info icon={User} label="Gender" value={resignation?.intern?.gender} />
                        <Info icon={Clock} label="Duration" value={resignation?.intern?.duration} />
                        <Info icon={MapPin} label="Joining Date" value={formatDate(resignation?.intern?.joiningDate)} />
                        <Info
                            icon={Calendar}
                            label="Last Working Date"
                            value={new Date(resignation.lastWorkingDate).toLocaleDateString()}
                        />
                        <Info
                            icon={CheckCircle}
                            label="Tasks Completed"
                            value={resignation.tasksCompleted ? "Yes" : "No"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Info = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition cursor-pointer hover:scale-104
  border border-gray-100">
        <div className="p-3 rounded-xl bg-violet-100">
            <Icon size={16} className="text-gray-600" />
        </div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-gray-800 font-medium">{value}</p>
        </div>
    </div>
);

export default ResignationPreviewModal;