import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Shield,
  AlertTriangle,
  Smartphone,
  Battery,
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { formatDate, formatTime } from "../../utils/format";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTriggers: 0,
    activeTriggers: 0,
    resolvedTriggers: 0,
  });
  const [device, setDevice] = useState(null);
  const [recentTriggers, setRecentTriggers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's device
      const deviceRes = await api.get("/devices/my-devices");
      if (deviceRes.data.data) {
        setDevice(deviceRes.data.data[0]);
      }

      // Fetch user's triggers
      const triggersRes = await api.get("/triggers/my-triggers");
      const triggers = triggersRes.data.data;
      setRecentTriggers(triggers.slice(0, 5)); // Get last 5 triggers

      // Calculate stats
      setStats({
        totalTriggers: triggers.length,
        activeTriggers: triggers.filter((t) => t.status === "active").length,
        resolvedTriggers: triggers.filter((t) => t.status === "resolved")
          .length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyTrigger = () => {
    navigate("/user/trigger");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: AlertTriangle,
        label: "Active",
      },
      responded: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: Activity,
        label: "Responded",
      },
      resolved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Resolved",
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getBatteryColor = (level) => {
    if (level >= 75) return "text-green-600";
    if (level >= 25) return "text-yellow-600";
    return "text-red-600";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Shield className="mr-3 h-8 w-8 text-purple-600" />
          Welcome, {user?.name}
        </h1>
        <p className="mt-2 text-gray-600">Your safety dashboard</p>
      </div>

      {/* Emergency Button Section */}
      <div className="mb-8">
        <div className="bg-linear-to-r from-red-500 to-pink-500 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-2">Need Help?</h2>
              <p className="text-red-100 text-lg">
                Press the emergency button to alert responders
              </p>
            </div>
            <button
              onClick={handleEmergencyTrigger}
              className="pulse-animation w-48 h-48 bg-white text-red-600 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all transform hover:scale-105 flex flex-col items-center justify-center font-bold text-xl"
            >
              <AlertTriangle className="w-16 h-16 mb-2" />
              EMERGENCY
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalTriggers}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.activeTriggers}
              </p>
            </div>
            <Activity className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.resolvedTriggers}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Status */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-purple-600" />
              My Device
            </h2>
            {device ? (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Device ID</p>
                  <p className="font-mono font-medium text-gray-900">
                    {device.deviceId}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p
                      className={`font-medium ${
                        device.status === "active"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {device.status}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Battery</p>
                    <div className="flex items-center">
                      <Battery
                        className={`w-4 h-4 mr-1 ${getBatteryColor(
                          device.batteryLevel
                        )}`}
                      />
                      <p
                        className={`font-medium ${getBatteryColor(
                          device.batteryLevel
                        )}`}
                      >
                        {device.batteryLevel}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Device Type</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {device.deviceType}
                  </p>
                </div>
                {device.lastPing && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Last Sync</p>
                    <p className="text-sm text-gray-900">
                      {new Date(device.lastPing).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No device assigned</p>
                <p className="text-sm text-gray-400 mt-1">
                  Contact admin to assign a device
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Triggers */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-purple-600" />
                Recent Alerts
              </h2>
              <button
                onClick={() => navigate("/user/history")}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            {recentTriggers.length > 0 ? (
              <div className="space-y-3">
                {recentTriggers.map((trigger) => (
                  <div
                    key={trigger._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusBadge(trigger.status)}
                          {trigger.priority && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                trigger.priority === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : trigger.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {trigger.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium">
                          {trigger.description || "Emergency alert"}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{formatDate(trigger.createdAt)}</p>
                        <p>{formatTime(trigger.createdAt)}</p>
                      </div>
                    </div>
                    {trigger.location && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>
                          {trigger.location.address ||
                            `${trigger.location.coordinates[1].toFixed(
                              4
                            )}, ${trigger.location.coordinates[0].toFixed(4)}`}
                        </span>
                      </div>
                    )}
                    {trigger.respondersNotified &&
                      trigger.respondersNotified.length > 0 && (
                        <div className="mt-2 text-xs text-blue-600">
                          {trigger.respondersNotified.length} responder(s)
                          notified
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No alerts triggered yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your emergency alerts will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/user/trigger")}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-purple-500"
        >
          <AlertTriangle className="w-10 h-10 text-red-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Emergency Trigger</h3>
          <p className="text-sm text-gray-600">
            Activate emergency alert system
          </p>
        </button>
        <button
          onClick={() => navigate("/user/history")}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-purple-500"
        >
          <Clock className="w-10 h-10 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Alert History</h3>
          <p className="text-sm text-gray-600">
            View all your past emergency alerts
          </p>
        </button>
        <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-purple-500">
          <TrendingUp className="w-10 h-10 text-green-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Safety Tips</h3>
          <p className="text-sm text-gray-600">
            Learn how to stay safe and prepared
          </p>
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
