import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Users, Globe, Building2, ChevronLeft, Activity, Compass, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

// Lat/Lon geographic coordinates for core tech hubs in India
// Lat/Lon geographic coordinates for core tech hubs in India
const cityCoordinates = {
  // NCR & North
  "New Delhi": { lat: 28.6139, lon: 77.2090, state: "Delhi" },
  "Delhi": { lat: 28.6139, lon: 77.2090, state: "Delhi" },
  "Noida": { lat: 28.5700, lon: 77.3200, state: "Uttar Pradesh" },
  "Gurugram": { lat: 28.4595, lon: 77.0266, state: "Haryana" },
  "Gurgaon": { lat: 28.4595, lon: 77.0266, state: "Haryana" },
  "Ghaziabad": { lat: 28.6692, lon: 77.4538, state: "Uttar Pradesh" },
  "Faridabad": { lat: 28.4089, lon: 77.3178, state: "Haryana" },
  "Chandigarh": { lat: 30.7333, lon: 76.7794, state: "Punjab" },
  "Ludhiana": { lat: 30.9010, lon: 75.8573, state: "Punjab" },
  "Amritsar": { lat: 31.6340, lon: 74.8723, state: "Punjab" },
  "Jalandhar": { lat: 31.3260, lon: 75.5762, state: "Punjab" },
  "Srinagar": { lat: 34.0837, lon: 74.7973, state: "Jammu & Kashmir" },
  "Jammu": { lat: 32.7266, lon: 74.8570, state: "Jammu & Kashmir" },
  "Dehradun": { lat: 30.3165, lon: 78.0322, state: "Uttarakhand" },
  "Haridwar": { lat: 29.9457, lon: 78.1642, state: "Uttarakhand" },
  "Shimla": { lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh" },

  // West & Central
  "Mumbai": { lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
  "Navi Mumbai": { lat: 19.0330, lon: 73.0297, state: "Maharashtra" },
  "Thane": { lat: 19.2183, lon: 72.9781, state: "Maharashtra" },
  "Pune": { lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
  "Nagpur": { lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
  "Nashik": { lat: 19.9975, lon: 73.7898, state: "Maharashtra" },
  "Ahmedabad": { lat: 23.0225, lon: 72.5714, state: "Gujarat" },
  "Surat": { lat: 21.1702, lon: 72.8311, state: "Gujarat" },
  "Vadodara": { lat: 22.3072, lon: 73.1812, state: "Gujarat" },
  "Rajkot": { lat: 22.3039, lon: 70.8022, state: "Gujarat" },
  "Jaipur": { lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
  "Jodhpur": { lat: 26.2389, lon: 73.0243, state: "Rajasthan" },
  "Udaipur": { lat: 24.5854, lon: 73.7125, state: "Rajasthan" },
  "Kota": { lat: 25.2138, lon: 75.8648, state: "Rajasthan" },
  "Bhopal": { lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
  "Indore": { lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
  "Gwalior": { lat: 26.2183, lon: 78.1828, state: "Madhya Pradesh" },
  "Jabalpur": { lat: 23.1815, lon: 79.9864, state: "Madhya Pradesh" },

  // South
  "Bengaluru": { lat: 12.9716, lon: 77.5946, state: "Karnataka" },
  "Bangalore": { lat: 12.9716, lon: 77.5946, state: "Karnataka" },
  "Mysore": { lat: 12.2958, lon: 76.6394, state: "Karnataka" },
  "Mysuru": { lat: 12.2958, lon: 76.6394, state: "Karnataka" },
  "Hubli": { lat: 15.3647, lon: 75.1240, state: "Karnataka" },
  "Chennai": { lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
  "Coimbatore": { lat: 11.0168, lon: 76.9558, state: "Tamil Nadu" },
  "Madurai": { lat: 9.9252, lon: 78.1198, state: "Tamil Nadu" },
  "Hyderabad": { lat: 17.3850, lon: 78.4867, state: "Telangana" },
  "Secunderabad": { lat: 17.4399, lon: 78.4983, state: "Telangana" },
  "Kochi": { lat: 9.9312, lon: 76.2673, state: "Kerala" },
  "Cochin": { lat: 9.9312, lon: 76.2673, state: "Kerala" },
  "Trivandrum": { lat: 8.5241, lon: 76.9366, state: "Kerala" },
  "Thiruvananthapuram": { lat: 8.5241, lon: 76.9366, state: "Kerala" },
  "Visakhapatnam": { lat: 17.6868, lon: 83.2185, state: "Andhra Pradesh" },
  "Vijayawada": { lat: 16.5062, lon: 80.6480, state: "Andhra Pradesh" },

  // East & Northeast
  "Kolkata": { lat: 22.5726, lon: 88.3639, state: "West Bengal" },
  "Howrah": { lat: 22.5958, lon: 88.2636, state: "West Bengal" },
  "Patna": { lat: 25.5941, lon: 85.1376, state: "Bihar" },
  "Lucknow": { lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
  "Kanpur": { lat: 26.4499, lon: 80.3319, state: "Uttar Pradesh" },
  "Agra": { lat: 27.1767, lon: 78.0081, state: "Uttar Pradesh" },
  "Varanasi": { lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh" },
  "Ranchi": { lat: 23.3441, lon: 85.3096, state: "Jharkhand" },
  "Jamshedpur": { lat: 22.8046, lon: 86.2029, state: "Jharkhand" },
  "Bhubaneswar": { lat: 20.2961, lon: 85.8245, state: "Odisha" },
  "Cuttack": { lat: 20.4625, lon: 85.8830, state: "Odisha" },
  "Raipur": { lat: 21.2514, lon: 81.6296, state: "Chhattisgarh" },
  "Guwahati": { lat: 26.1445, lon: 91.7362, state: "Assam" },
  "Shillong": { lat: 25.5788, lon: 91.8831, state: "Meghalaya" }
};

// Preset fallback coordinates if dynamic cities are not in preset coordinates list
const getRandomCoordinates = (cityName) => {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 12.0 + (Math.abs(hash) % 18); // range: 12.0 to 30.0 Lat
  const lon = 72.0 + (Math.abs(hash >> 8) % 15); // range: 72.0 to 87.0 Lon
  return { lat, lon, state: "India Region" };
};

const NetworkPage = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);

  // Geolocation radar variables
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [nearestNode, setNearestNode] = useState(null);

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Fallback realistic seed data if database is empty/fresh
  const defaultSeeds = [
    { fullName: "Aditya Verma", currentCity: "Noida", currentState: "Uttar Pradesh", domain: "MERN Stack Development", status: "Active" },
    { fullName: "Neha Sen", currentCity: "New Delhi", currentState: "Delhi", domain: "UI/UX Designing", status: "Active" },
    { fullName: "Rohit Nair", currentCity: "Bengaluru", currentState: "Karnataka", domain: "Back-end Developer", status: "Selected" },
    { fullName: "Sanya Gupta", currentCity: "Mumbai", currentState: "Maharashtra", domain: "Graphic Design", status: "Active" },
    { fullName: "Tushar Joshi", currentCity: "Pune", currentState: "Maharashtra", domain: "Full Stack Development", status: "Active" },
    { fullName: "Meera Nair", currentCity: "Hyderabad", currentState: "Telangana", domain: "Data & AI Intelligence", status: "Active" },
    { fullName: "Vikram Rathore", currentCity: "Jaipur", currentState: "Rajasthan", domain: "Front-end Developer", status: "Active" },
    { fullName: "Ananya Mishra", currentCity: "Lucknow", currentState: "Uttar Pradesh", domain: "Content Writing", status: "Selected" },
    { fullName: "Kunal Basu", currentCity: "Kolkata", currentState: "West Bengal", domain: "Video Editing", status: "Active" },
    { fullName: "Priya Pillai", currentCity: "Chennai", currentState: "Tamil Nadu", domain: "Digital Marketing", status: "Active" }
  ];

  // 1. Dynamic CDN script loading to load Leaflet cleanly without compile dependency constraints
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }

    // Append Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Append Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletReady(true);
    };
    document.body.appendChild(script);

    return () => {
      // Safe cleanup if required
    };
  }, []);

  // 2. Fetch Network locations
  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/public/intern-cities");
      if (res.data.success && res.data.interns && res.data.interns.length > 0) {
        setInterns(res.data.interns);
      } else {
        setInterns(defaultSeeds);
      }
    } catch (error) {
      console.error("Error loading network database:", error);
      setInterns(defaultSeeds);
    } finally {
      setLoading(false);
    }
  };

  // Capitalize and match clean helpers (splits commas, trims states, matches case-insensitive preset keys)
  const cleanCityName = (city) => {
    if (!city) return "Unknown";
    // 1. Split on comma to strip state info (e.g. "Jaipur, Rajasthan" -> "Jaipur")
    let base = city.split(",")[0].trim();
    // 2. Normalize casing to Title Case
    base = base.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

    // 3. Scan keys for matches or close substrings to completely avoid random fallback offsets
    const knownKeys = Object.keys(cityCoordinates);
    for (const key of knownKeys) {
      if (base.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(base.toLowerCase())) {
        return key; // return the matching coordinate key perfectly!
      }
    }
    return base;
  };

  // Process and Aggregate unique city statistics
  const processedInterns = interns.map(i => ({
    ...i,
    currentCity: cleanCityName(i.currentCity),
    currentState: i.currentState ? i.currentState.trim() : "State"
  }));

  const cityGroups = processedInterns.reduce((acc, intern) => {
    const city = intern.currentCity;
    if (!acc[city]) {
      acc[city] = {
        name: city,
        state: intern.currentState,
        count: 0,
        domains: {},
        internsList: []
      };
    }
    acc[city].count += 1;
    acc[city].domains[intern.domain] = (acc[city].domains[intern.domain] || 0) + 1;
    acc[city].internsList.push(intern);
    return acc;
  }, {});

  const citiesArray = Object.values(cityGroups).sort((a, b) => b.count - a.count);

  const cityNodes = citiesArray.map(c => {
    const coords = cityCoordinates[c.name] || getRandomCoordinates(c.name);
    return {
      ...c,
      lat: coords.lat,
      lon: coords.lon,
      state: coords.state || c.state
    };
  });

  // Initialize and Render Map with real Google Map layer!
  useEffect(() => {
    if (!leafletReady || !window.L || !cityNodes.length) return;

    if (mapRef.current) {
      updateMapMarkers();
      return;
    }

    const L = window.L;

    // Center standard India map beautifully
    const map = L.map("google-map-viewport", {
      zoomControl: false,
      attributionControl: false
    }).setView([21.8, 78.8], 5);

    mapRef.current = map;

    // Load REAL Google Maps Road Imagery Tiles Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    updateMapMarkers();
  }, [leafletReady, interns]);

  // Update real-time markers with gorgeous neon-glowing pulses
  const updateMapMarkers = () => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    const map = mapRef.current;

    // Clear old markers safely
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Render active city hubs on the Google Map
    cityNodes.forEach(node => {
      const isNearest = nearestNode && nearestNode.name === node.name;
      const pulseClass = isNearest ? 'nearest-pulse-glow' : 'standard-pulse-glow';
      const markerColor = isNearest ? 'bg-rose-500 shadow-rose-500/50' : 'bg-indigo-600 shadow-indigo-600/50';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-wrapper',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 select-none group">
            <!-- Pulsing neon outer circle -->
            <span class="absolute inline-flex h-9 w-9 rounded-full opacity-80 border-2 ${pulseClass}"></span>
            <!-- Glowing solid inner core dot with Graduation Cap icon -->
            <span class="relative flex items-center justify-center rounded-full h-7 w-7 ${markerColor} border-2 border-white shadow-xl transition-all duration-300 hover:scale-125">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.42 10.922a1 1 0 00-.019-1.838L12.83 5.18a2 2 0 00-1.66 0L2.6 9.08a1 1 0 000 1.832l8.57 3.908a2 2 0 001.66 0z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
            </span>
            
            <!-- Hover Label floating on top (Reveals on hover) -->
            <div class="absolute -top-7 px-2.5 py-0.5 bg-slate-900/90 backdrop-blur-md text-white font-extrabold text-[9px] rounded-lg shadow-lg border border-indigo-500/30 tracking-wider uppercase whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              ${node.name}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([node.lat, node.lon], { icon: customIcon }).addTo(map);

      // Track hover states for additional react bindings without rendering popup bubbles
      marker.on('mouseover', () => {
        setHoveredCity(node.name);
      });
      marker.on('mouseout', () => {
        setHoveredCity(null);
      });

      markersRef.current.push(marker);
    });
  };

  // Mathematical Haversine Distance calculator
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find Nearest Hub using client geolocation coordinates
  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setLocationError(null);
    setNearestNode(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let minDistance = Infinity;
        let closest = null;

        cityNodes.forEach((node) => {
          const dist = getDistance(latitude, longitude, node.lat, node.lon);
          if (dist < minDistance) {
            minDistance = dist;
            closest = {
              ...node,
              distance: Math.round(dist)
            };
          }
        });

        if (closest) {
          setNearestNode(closest);

          // Pan and Zoom beautifully to the nearest coordinates
          if (mapRef.current) {
            mapRef.current.setView([closest.lat, closest.lon], 9, {
              animate: true,
              duration: 1.8
            });

            // Re-render markers with highlight
            setTimeout(() => {
              updateMapMarkers();
            }, 600);
          }
        } else {
          setLocationError("No nearby intern hubs found.");
        }
        setLocating(false);
      },
      (error) => {
        console.error("Geolocation lookup error:", error);
        setLocationError("Permission denied or location scanning failed.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Floating controls click actions
  const zoomInMap = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const zoomOutMap = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const resetMapZoom = () => {
    if (mapRef.current) {
      mapRef.current.setView([21.8, 78.8], 5);
      setNearestNode(null);
      setTimeout(() => updateMapMarkers(), 400);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#f1f3f6] font-['Outfit',sans-serif] text-slate-900 antialiased flex items-center justify-center">

      {/* Dynamic Style Injection for Leaflet Map popups and glowing pulses */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Reset default Leaflet icon styles to avoid displacement shift */
        .custom-leaflet-marker-wrapper {
          background: transparent !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Pulsing glows */
        .standard-pulse-glow {
          border-color: rgba(139, 92, 246, 0.7);
          background-color: rgba(139, 92, 246, 0.25);
          animation: markerPulse 2.4s infinite ease-in-out;
        }
        .nearest-pulse-glow {
          border-color: rgba(244, 63, 94, 0.7);
          background-color: rgba(244, 63, 94, 0.25);
          animation: markerPulse 1.8s infinite ease-in-out;
        }
        @keyframes markerPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          60% { transform: scale(1.6); opacity: 0.18; }
          100% { transform: scale(0.6); opacity: 0.9; }
        }

        /* Glassmorphism popups styles */
        .custom-leaflet-glass-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.92) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(139, 92, 246, 0.2) !important;
          border-radius: 20px !important;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15) !important;
        }
        .custom-leaflet-glass-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.92) !important;
          border: 1px solid rgba(139, 92, 246, 0.05) !important;
        }
      `}} />

      {/* ── IMMERSIVE FLOATING BACK ACTION CONTROL ── */}
      <div className="absolute top-6 left-6 z-[1000] flex items-center gap-4 bg-white/80 backdrop-blur-xl p-3 rounded-2xl border border-purple-100/60 shadow-lg">
        <Link to="/" className="p-2 hover:bg-purple-50 rounded-xl transition text-purple-600">
          <ChevronLeft size={20} />
        </Link>
        <div className="h-6 w-[1px] bg-purple-100" />
        <div>
          <p className="font-extrabold text-slate-800 text-xs sm:text-sm leading-none tracking-wide">GRAPHURA INDIA PRIVATE LIMITED</p>
          <p className="text-[10px] text-purple-500 font-semibold tracking-wide mt-0.5 uppercase">Interns Network Map</p>
        </div>
      </div>

      {/* ── IMMERSIVE FLOATING LIVE METADATA ── */}
      <div className="absolute top-6 right-6 z-[1000] hidden sm:flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-purple-100/60 shadow-lg">
        <span className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <Users size={14} className="text-purple-500" /> Active Talent Network
        </span>
        <div className="h-4 w-[1px] bg-purple-100" />
        <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
          <Globe size={14} className="text-purple-500 animate-spin-slow" />Powered by Google Maps
        </span>
      </div>

      {/* ── REAL GOOGLE MAP VIEWPORT ── */}
      <div className="w-full h-full relative">
        <div
          id="google-map-viewport"
          className="w-full h-full bg-[#e5e9f0] z-10"
        />

        {/* Loading placeholder spinner */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-[2000] flex flex-col items-center justify-center gap-3">
            <RefreshCw size={36} className="text-purple-600 animate-spin" />
            <p className="text-sm font-extrabold text-slate-700 tracking-wide">Syncing Real Google Map Engine...</p>
          </div>
        )}
      </div>

      {/* ── ZOOM & PAN DYNAMIC GOOGLE CONTROLS ── */}
      <div className="absolute bottom-24 left-6 z-[1000] flex flex-col gap-2 bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-purple-100/60 shadow-lg">
        <button
          onClick={zoomInMap}
          className="w-10 h-10 flex items-center justify-center bg-white hover:bg-purple-50 text-purple-600 rounded-xl border border-purple-100 font-extrabold text-lg transition-all shadow-sm"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={zoomOutMap}
          className="w-10 h-10 flex items-center justify-center bg-white hover:bg-purple-50 text-purple-600 rounded-xl border border-purple-100 font-extrabold text-lg transition-all shadow-sm"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={resetMapZoom}
          className="px-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[9px] uppercase tracking-wider rounded-lg text-center transition-all border border-purple-100"
          title="Reset Zoom & Pan"
        >
          Reset
        </button>
      </div>

      {/* ── IMMERSIVE FLOATING LEGEND ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-6 bg-white/80 backdrop-blur-xl px-6 py-3.5 rounded-2xl border border-purple-100/60 shadow-lg text-[10px] font-bold text-slate-600 whitespace-nowrap">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500/20 border border-purple-500 inline-block" /> Hub Areas</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block" /> Active Interns</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 animate-ping inline-block" /> Real-time Sync</span>
      </div>

      {/* ── IMMERSIVE FLOATING FAB FIND NEAREST RADAR ── */}
      <div className="absolute bottom-24 right-6 z-[1000]">
        <button
          onClick={handleFindNearest}
          disabled={locating}
          className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-70 group"
        >
          <Activity size={16} className={`text-white ${locating ? "animate-pulse" : "group-hover:rotate-45 transition-transform"}`} />
          {locating ? "Scanning Interns..." : "Find Nearest Intern"}
        </button>
      </div>

      {/* ── IMMERSIVE FLOATING DRAWER FOR NEAREST INTERN ── */}
      <AnimatePresence>
        {nearestNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-xl border-2 border-purple-200 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-3 w-80 text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 animate-bounce">
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wider">Closest Intern Located</p>
              <h4 className="text-base font-black text-slate-800 mt-0.5">{nearestNode.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{nearestNode.state}</p>
              <div className="mt-3 bg-purple-50 rounded-2xl px-4 py-2 border border-purple-100/60 inline-block">
                <span className="text-sm font-extrabold text-purple-700">{nearestNode.distance} km away</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">
                Active interns are currently working in this hub region!
              </p>
            </div>
            <button
              onClick={() => {
                setNearestNode(null);
                setHoveredCity(null);
                resetMapZoom();
              }}
              className="mt-2 w-full py-2 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-500 font-bold text-xs rounded-xl transition duration-300"
            >
              Reset Map View
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LOCATION EXCEPTION BANNER ── */}
      <AnimatePresence>
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-6 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2"
          >
            <span>⚠️ {locationError}</span>
            <button onClick={() => setLocationError(null)} className="text-red-400 hover:text-red-700 font-black ml-2">×</button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default NetworkPage;
