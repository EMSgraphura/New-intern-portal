import mongoose from "mongoose";

const internSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    alternateMobile: {
        type: String,
    },
    dob: {
        type: String,
        required: true,
    },
    apaarId: {
        type: String,
        required: false,
    },
    aadharNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    currentAddress: {
        type: String,
        required: true,
    },
    currentState: {
        type: String,
        required: true,
    },
    currentCity: {
        type: String,
        required: true,
    },
    currentPinCode: {
        type: String,
        required: true,
    },
    permanentAddress: {
        type: String,
        required: true,
    },
    permanentState: {
        type: String,
        required: true,
    },
    permanentCity: {
        type: String,
        required: true,
    },
    permanentPinCode: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    ipAddress: {
        type: String,
    },
    college: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    educationLevel: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
    contactMethod: {
        type: String,
        required: true,
    },
    resumeUrl: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    prevInternship: {
        type: String,
        required: true,
        enum: ['Yes', 'No'],
        default: 'No'
    },
    prevInternshipDesc: {
        type: String,
        default: ''
    },
    performance: {
        type: String,
        enum: ['Excellent', 'Good', 'Average', 'Poor'],
        default: 'Average'
    },
    status: {
        type: String,
        enum: ["Selected", "Rejected", "Applied", "Active", "Inactive", "Terminated"],
        default: 'Applied'
    },
    TpoName: {
        type: String,
    },
    TpoEmail: {
        type: String
    },
    TpoNumber: {
        type: String
    },
    parentName: {
        type: String,
    },
    parentNumber: {
        type: String,
    },
    parentEmail: {
        type: String,
    },
    parentAltNumber: {
        type: String,
    },
    fingerprintRequestId: {
        type: String,
    },
    uniqueId: {
        type: String,
    },
    comment: {
        type: String
    },
    joiningDate: {
        type: String
    },
    updatedByHR: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // reference to the HR (User collection)
    },
    hrComments: [
        {
            stage: {
                type: String,
                enum: ['Resume Shortlisted', 'Interviewing', 'Telephonic', 'Emailing', 'Selected',],
                required: true
            },
            text: { type: String }, // optional notes
            commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HR user
            date: { type: Date, default: Date.now }
        }
    ],
    updatedByIncharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InternHead", // reference to the HR (User collection)
    },
    comments: [
        {
            text: {
                type: String,
                required: true,
            },
            commentedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "InternHead", // or "HR" / "Admin" / "Intern" depending on your logic
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },

    ],

    extendedDays: {
        type: Number,
        default: 0
    },

    terminationAppeal: {
        type: Boolean,
        default: false
    },
    terminationAppealReason: {
        type: String,
        default: ""
    },
    terminationAppealDate: {
        type: Date
    },
    terminationAppealBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InternHead"
    },

    totalMeetings: { type: Number, default: 0 },
    meetingsAttended: { type: Number, default: 0 },
    leavesTaken: { type: Number, default: 0 },
    warningCount: { type: Number, default: 0 },
    warningHistory: [
        {
            date: { type: Date, default: Date.now },
            reason: { type: String, default: "3 consecutive absences marked" }
        }
    ],

    certificateNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    certificateIssuedAt: {
        type: Date,
    },
    certificateStatus: {
        type: String,
        enum: ["pending", "issued"],
        default: "pending"
    },


}, { timestamps: true });

const Intern = mongoose.model('Intern', internSchema);
export default Intern;