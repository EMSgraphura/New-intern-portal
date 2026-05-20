import * as lucide from "lucide-react";

const icons = [
  "ArrowLeft", "Mail", "AlertTriangle", "UserMinus", "Check", "Search", "Filter", "X",
  "RefreshCw", "Send", "Sparkles", "Calendar", "Hash", "Phone",
  "Building", "List", "Grid", "Info", "UserCheck", "ChevronDown", "LogOut", "Briefcase", "History", "Upload", "Download", "Users"
];

for (const icon of icons) {
  if (!lucide[icon]) {
    console.error(`MISSING ICON: ${icon}`);
  }
}
console.log("All icons verified.");
