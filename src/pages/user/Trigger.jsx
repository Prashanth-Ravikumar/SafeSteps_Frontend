import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  MapPin,
  Smartphone,
  Shield,
  CheckCircle,
  Loader,
  X,
  Info,
} from "lucide-react";

const UserTrigger = () => {
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchDevice();
  }, []);

  const fetchDevice = async () => {
    try {
      const res = await api.get("/devices/my-devices");
      setDevice(res.data.data[0]);
    } catch (error) {
      console.error("Failed to fetch device:", error);
      toast.error("Failed to load device information");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Try to get address from reverse geocoding (optional)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
            );
            const data = await response.json();
            resolve({
              ...coords,
              address: data.display_name || "Address not available",
            });
          } catch {
            // If reverse geocoding fails, just return coordinates
            resolve({
              ...coords,
              address: `${coords.latitude.toFixed(
                4
              )}, ${coords.longitude.toFixed(4)}`,
            });
          }
          setGettingLocation(false);
        },
        (error) => {
          setGettingLocation(false);
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred getting location.";
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleEmergencyClick = async () => {
    if (!device) {
      toast.error("No device assigned. Please contact admin.");
      return;
    }

    if (device.status !== "active") {
      toast.error("Your device is not active. Please contact admin.");
      return;
    }

    setLocationError(null);
    try {
      const locationData = await getLocation();
      setLocation(locationData);
      setShowConfirmModal(true);
    } catch (error) {
      setLocationError(error.message);
      toast.error(error.message);
    }
  };

  const handleConfirmTrigger = async () => {
    if (!location) {
      toast.error("Location is required to trigger emergency");
      return;
    }

    setTriggering(true);
    try {
      const triggerData = {
        deviceId: device._id,
        location: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
          address: location.address,
        },
        description: description.trim() || "Emergency alert triggered",
        priority: "critical",
        triggerType: "manual",
        batteryLevel: device.batteryLevel,
      };

      const res = await api.post("/triggers", triggerData);

      // Emit socket event for real-time notification
      const socket = getSocket();
      if (socket) {
        socket.emit("emergency-alert", res.data.data);
      }

      toast.success("Emergency alert sent successfully! Help is on the way.");
      setShowConfirmModal(false);

      // Redirect to history after a short delay
      setTimeout(() => {
        navigate("/user/history");
      }, 2000);
    } catch (error) {
      console.error("Failed to trigger emergency:", error);
      toast.error(
        error.response?.data?.message || "Failed to send emergency alert"
      );
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <AlertTriangle className="mr-3 h-10 w-10 text-red-600" />
          Emergency Trigger
        </h1>
        <p className="text-gray-600 text-lg">
          Press the button below to send an emergency alert to responders
        </p>
      </div>

      {/* Device Status Card */}
      {device ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-purple-600" />
              Your Device Status
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                device.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {device.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Device ID</p>
              <p className="font-mono font-medium text-sm">{device.deviceId}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <p className="font-medium text-sm capitalize">
                {device.deviceType}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Battery</p>
              <p
                className={`font-medium text-sm ${
                  device.batteryLevel >= 75
                    ? "text-green-600"
                    : device.batteryLevel >= 25
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {device.batteryLevel}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Firmware</p>
              <p className="font-medium text-sm">{device.firmwareVersion}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">
                No Device Assigned
              </h3>
              <p className="text-red-700 text-sm">
                You need a device assigned by admin to trigger emergency alerts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Button */}
      <div className="bg-linear-to-r from-red-500 to-pink-500 rounded-2xl shadow-2xl p-12 mb-8">
        <div className="text-center">
          <button
            onClick={handleEmergencyClick}
            disabled={!device || device.status !== "active" || gettingLocation}
            className="pulse-animation w-64 h-64 bg-white text-red-600 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex flex-col items-center justify-center font-bold text-2xl mx-auto"
          >
            {gettingLocation ? (
              <>
                <Loader className="w-20 h-20 mb-4 animate-spin" />
                <span className="text-lg">Getting Location...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-20 h-20 mb-4" />
                EMERGENCY
              </>
            )}
          </button>
          <p className="text-white text-lg mt-6">
            {device && device.status === "active"
              ? "Press to send emergency alert with your current location"
              : "Device must be active to send emergency alerts"}
          </p>
        </div>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900 mb-1">
                Location Access Issue
              </h3>
              <p className="text-yellow-700 text-sm">{locationError}</p>
              <p className="text-yellow-600 text-xs mt-2">
                Location is required to send emergency alerts. Please enable
                location access in your browser settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Safety Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Safety Tips
        </h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
            <span>Make sure your device battery is charged</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
            <span>
              Enable location services for accurate emergency location
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
            <span>Keep your emergency contacts updated in your profile</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
            <span>
              Emergency alerts are sent to all active responders in your area
            </span>
          </li>
        </ul>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
                Confirm Emergency
              </h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={triggering}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-900 font-medium mb-2">
                  You are about to send an emergency alert!
                </p>
                <p className="text-red-700 text-sm">
                  This will notify all active responders in your area with your
                  current location.
                </p>
              </div>

              {location && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Your Location
                      </p>
                      <p className="text-sm text-gray-600">
                        {location.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {location.latitude.toFixed(6)},{" "}
                        {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your situation or any important details..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={triggering}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={triggering}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTrigger}
                disabled={triggering}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {triggering ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Send Alert
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTrigger;
