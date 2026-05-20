const detectDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua)) return "Mobile";
  if (/ipad|tablet/.test(ua)) return "Tablet";
  return "Desktop";
};

const detectBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Google Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Firefox/")) return "Mozilla Firefox";
  return "Unknown Browser";
};

const getCoordinates = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => reject(new Error("Location access is required for login.")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

const getPublicIpAddress = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) return "Unknown";
    const data = await response.json();
    return data.ip || "Unknown";
  } catch {
    return "Unknown";
  }
};

export const buildLoginMeta = async () => {
  const coordinates = await getCoordinates();
  const ipAddress = await getPublicIpAddress();
  return {
    ...coordinates,
    ipAddress,
    deviceType: detectDeviceType(),
    browserDetails: detectBrowser(),
    userAgent: navigator.userAgent || "Unknown",
  };
};
