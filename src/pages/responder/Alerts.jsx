import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  MapPin,
  User,
  Clock,
  Phone,
  Heart,
  Smartphone,
  X,
  Filter,
  Navigation,
} from "lucide-react";
import { formatRelativeTime, getPriorityColor } from "../../utils/format";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons by priority
const getMarkerIcon = (priority) => {
  const colors = {
    critical: "#DC2626",
    high: "#EA580C",
    medium: "#F59E0B",
    low: "#10B981",
  };

  const color = colors[priority] || "#6B7280";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const ResponderAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // Default map center (you can change this)
  const defaultCenter = [28.6139, 77.209]; // Delhi, India

  useEffect(() => {
    fetchAlerts();
    setupSocketListeners();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("emergency-alert");
        socket.off("trigger-updated");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorityFilter, alerts]);

  const setupSocketListeners = () => {
    const socket = getSocket();
    if (socket) {
      socket.on("emergency-alert", (alert) => {
        toast.error(
          `🚨 NEW EMERGENCY: ${alert.triggeredBy?.name || "Unknown"}`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        fetchAlerts();
      });

      socket.on("trigger-updated", () => {
        fetchAlerts();
      });
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/triggers/active");
      setAlerts(res.data.data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (priorityFilter !== "all") {
      filtered = filtered.filter((alert) => alert.priority === priorityFilter);
    }

    setFilteredAlerts(filtered);
  };

  const handleAcceptAlert = async (triggerId) => {
    setAccepting(true);
    try {
      await api.post("/responses", {
        triggerId: triggerId,
        status: "accepted",
        notes: "Responding to emergency alert",
      });
      toast.success(
        "Alert accepted! You are now responding to this emergency."
      );
      setShowDetailsModal(false);
      fetchAlerts();
    } catch (error) {
      console.error("Failed to accept alert:", error);
      toast.error(error.response?.data?.message || "Failed to accept alert");
    } finally {
      setAccepting(false);
    }
  };

  const openDetailsModal = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  const getPriorityBadge = (priority) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
          priority
        )}`}
      >
        {priority?.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="mr-2 h-7 w-7 text-red-600" />
              Emergency Alerts Map
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAlerts.length} active emergency alert(s)
            </p>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map and Alerts Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {filteredAlerts.length > 0 ? (
            <MapContainer
              center={
                filteredAlerts[0]?.location?.coordinates
                  ? [
                      filteredAlerts[0].location.coordinates[1],
                      filteredAlerts[0].location.coordinates[0],
                    ]
                  : defaultCenter
              }
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredAlerts.map((alert) => {
                if (!alert.location?.coordinates) return null;
                const [lng, lat] = alert.location.coordinates;
                return (
                  <Marker
                    key={alert._id}
                    position={[lat, lng]}
                    icon={getMarkerIcon(alert.priority)}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="font-bold text-gray-900 mb-1">
                          {alert.triggeredBy?.name || "Unknown"}
                        </div>
                        <div className="mb-2">
                          {getPriorityBadge(alert.priority)}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {alert.description || "Emergency alert"}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatRelativeTime(alert.createdAt)}
                        </p>
                        <button
                          onClick={() => openDetailsModal(alert)}
                          className="w-full px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No active emergencies</p>
                <p className="text-sm text-gray-400 mt-1">
                  Map will display when alerts are active
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Alerts Panel */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Active Alerts ({filteredAlerts.length})
            </h2>
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="border-2 border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={() => openDetailsModal(alert)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-bold text-gray-900">
                        {alert.triggeredBy?.name || "Unknown"}
                      </span>
                    </div>
                    {getPriorityBadge(alert.priority)}
                  </div>

                  <p className="text-sm text-gray-700 mb-2">
                    {alert.description || "Emergency alert"}
                  </p>

                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">
                      {alert.location?.address || "Location unavailable"}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-red-600 font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatRelativeTime(alert.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-1000">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
                  Emergency Alert Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Priority Banner */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    {getPriorityBadge(selectedAlert.priority)}
                    <span className="ml-3 text-sm text-gray-600">
                      {formatRelativeTime(selectedAlert.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Victim Information */}
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Victim Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {selectedAlert.triggeredBy?.name || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="text-gray-900">
                      {selectedAlert.triggeredBy?.email || "N/A"}
                    </span>
                  </div>
                  {selectedAlert.triggeredBy?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1 text-gray-500" />
                      <a
                        href={`tel:${selectedAlert.triggeredBy.phone}`}
                        className="text-purple-600 hover:underline"
                      >
                        {selectedAlert.triggeredBy.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Information */}
              {selectedAlert.triggeredBy?.medicalInfo && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-600" />
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedAlert.triggeredBy.medicalInfo.bloodGroup && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-500">Blood Group:</span>{" "}
                        <span className="font-medium text-red-600">
                          {selectedAlert.triggeredBy.medicalInfo.bloodGroup}
                        </span>
                      </div>
                    )}
                    {selectedAlert.triggeredBy.medicalInfo.allergies && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-500">Allergies:</span>{" "}
                        <span className="text-gray-900">
                          {selectedAlert.triggeredBy.medicalInfo.allergies}
                        </span>
                      </div>
                    )}
                    {selectedAlert.triggeredBy.medicalInfo.medications && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-500">Medications:</span>{" "}
                        <span className="text-gray-900">
                          {selectedAlert.triggeredBy.medicalInfo.medications}
                        </span>
                      </div>
                    )}
                    {selectedAlert.triggeredBy.medicalInfo.conditions && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-500">Conditions:</span>{" "}
                        <span className="text-gray-900">
                          {selectedAlert.triggeredBy.medicalInfo.conditions}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              {selectedAlert.triggeredBy?.emergencyContacts?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-yellow-600" />
                    Emergency Contacts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAlert.triggeredBy.emergencyContacts.map(
                      (contact, index) => (
                        <div key={index} className="bg-white rounded p-3">
                          <p className="font-medium text-gray-900">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            {contact.relationship}
                          </p>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-sm text-purple-600 hover:underline"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Device Information */}
              {selectedAlert.device && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Smartphone className="w-5 h-5 mr-2 text-gray-600" />
                    Device Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Device ID:</span>{" "}
                      <span className="font-mono text-gray-900">
                        {selectedAlert.device.deviceId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>{" "}
                      <span className="capitalize text-gray-900">
                        {selectedAlert.device.deviceType}
                      </span>
                    </div>
                    {selectedAlert.batteryLevel && (
                      <div>
                        <span className="text-gray-500">Battery:</span>{" "}
                        <span className="text-gray-900">
                          {selectedAlert.batteryLevel}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedAlert.location && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Location
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      {selectedAlert.location.address}
                    </p>
                    <p className="text-gray-500 font-mono">
                      {selectedAlert.location.coordinates[1].toFixed(6)},{" "}
                      {selectedAlert.location.coordinates[0].toFixed(6)}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`https://www.google.com/maps?q=${selectedAlert.location.coordinates[1]},${selectedAlert.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <MapPin className="w-4 h-4 mr-1.5" />
                        Open in Google Maps
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedAlert.location.coordinates[1]},${selectedAlert.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Navigation className="w-4 h-4 mr-1.5" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedAlert.description && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Alert Description
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {selectedAlert.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => handleAcceptAlert(selectedAlert._id)}
                  disabled={accepting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {accepting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Accept & Respond
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponderAlerts;
