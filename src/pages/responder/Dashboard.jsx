import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Activity,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Shield,
  Bell,
  Navigation,
} from "lucide-react";
import { formatRelativeTime, getPriorityColor } from "../../utils/format";

const ResponderDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeAlerts: 0,
    myAccepted: 0,
    completed: 0,
    totalResponses: 0,
  });
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [myActiveResponses, setMyActiveResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    setupSocketListeners();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("emergency-alert");
        socket.off("trigger-accepted");
        socket.off("trigger-updated");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupSocketListeners = () => {
    const socket = getSocket();
    if (socket) {
      // Listen for new emergency alerts
      socket.on("emergency-alert", (alert) => {
        toast.error(
          `🚨 NEW EMERGENCY: ${alert.triggeredBy?.name || "Unknown"}`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        fetchDashboardData();
      });

      // Listen for trigger updates
      socket.on("trigger-updated", () => {
        fetchDashboardData();
      });

      // Listen for accepted triggers
      socket.on("trigger-accepted", () => {
        fetchDashboardData();
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch active triggers
      const alertsRes = await api.get("/triggers/active");
      setActiveAlerts(alertsRes.data.data);

      // Fetch responder's responses
      const responsesRes = await api.get("/responses/my-responses");
      const allResponses = responsesRes.data.data;

      // Filter active responses
      const activeResponses = allResponses.filter(
        (r) => r.status !== "completed"
      );
      setMyActiveResponses(activeResponses);

      // Calculate stats
      setStats({
        activeAlerts: alertsRes.data.data.length,
        myAccepted: activeResponses.length,
        completed: allResponses.filter((r) => r.status === "completed").length,
        totalResponses: allResponses.length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAlert = async (triggerId) => {
    try {
      await api.post("/responses", {
        triggerId: triggerId,
        status: "accepted",
        notes: "Responding to emergency alert",
      });
      toast.success(
        "Alert accepted! You are now responding to this emergency."
      );
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to accept alert:", error);
      toast.error(error.response?.data?.message || "Failed to accept alert");
    }
  };

  const handleUpdateStatus = async (responseId, status) => {
    try {
      const statusMessages = {
        en_route: "On route to location",
        arrived: "Arrived at location",
        completed: "Response completed successfully",
      };

      await api.put(`/responses/${responseId}/status`, {
        status,
        notes: statusMessages[status] || `Status updated to ${status}`,
      });
      toast.success(`Status updated to ${status}`);
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const getPriorityBadge = (priority) => {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
          priority
        )}`}
      >
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      accepted: { bg: "bg-blue-100", text: "text-blue-800", label: "Accepted" },
      en_route: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "On Route",
      },
      arrived: { bg: "bg-green-100", text: "text-green-800", label: "Arrived" },
      completed: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Completed",
      },
    };

    const config = statusConfig[status] || statusConfig.accepted;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
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
          Responder Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Monitor and respond to emergency alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.activeAlerts}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Active</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.myAccepted}
              </p>
            </div>
            <Activity className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.completed}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalResponses}
              </p>
            </div>
            <Clock className="w-12 h-12 text-gray-900" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Emergency Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Bell className="w-6 h-6 mr-2 text-red-600" />
                Active Emergencies
              </h2>
              <button
                onClick={() => navigate("/responder/alerts")}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {activeAlerts.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert._id}
                    className="border-2 border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-bold text-gray-900">
                            {alert.triggeredBy?.name || "Unknown"}
                          </span>
                          {alert.priority && getPriorityBadge(alert.priority)}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {alert.description || "Emergency alert"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">
                        {alert.location?.address ||
                          `${alert.location?.coordinates[1].toFixed(
                            4
                          )}, ${alert.location?.coordinates[0].toFixed(4)}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-600 font-medium flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                      <button
                        onClick={() => handleAcceptAlert(alert._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                      >
                        Accept Alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active emergencies</p>
                <p className="text-sm text-gray-400 mt-1">
                  All clear at the moment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* My Active Responses */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-600" />
                My Active Responses
              </h2>
              <button
                onClick={() => navigate("/responder/history")}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                View History
              </button>
            </div>
          </div>
          <div className="p-6">
            {myActiveResponses.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myActiveResponses.map((response) => (
                  <div
                    key={response._id}
                    className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-bold text-gray-900">
                            {response.trigger?.triggeredBy?.name || "Unknown"}
                          </span>
                          {getStatusBadge(response.status)}
                        </div>
                        <p className="text-sm text-gray-700">
                          {response.trigger?.description || "Emergency alert"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <MapPin className="w-3 h-3 mr-1" />
                      <a
                        href={`https://www.google.com/maps?q=${response.trigger?.location?.coordinates[1]},${response.trigger?.location?.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-purple-600 hover:underline"
                      >
                        {response.trigger?.location?.address || "View Location"}
                      </a>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Clock className="w-3 h-3 mr-1" />
                      Accepted {formatRelativeTime(response.acceptedAt)}
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex gap-2">
                      {response.status === "accepted" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(response._id, "en_route")
                          }
                          className="flex-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-xs font-medium transition-colors flex items-center justify-center"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          On Route
                        </button>
                      )}
                      {response.status === "en_route" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(response._id, "arrived")
                          }
                          className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium transition-colors flex items-center justify-center"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Arrived
                        </button>
                      )}
                      {response.status === "arrived" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(response._id, "completed")
                          }
                          className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium transition-colors flex items-center justify-center"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active responses</p>
                <p className="text-sm text-gray-400 mt-1">
                  Accept an emergency alert to start responding
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/responder/alerts")}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-red-500"
        >
          <AlertTriangle className="w-10 h-10 text-red-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">View All Alerts</h3>
          <p className="text-sm text-gray-600">
            See all active emergencies on map
          </p>
        </button>
        <button
          onClick={() => navigate("/responder/history")}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-purple-500"
        >
          <Clock className="w-10 h-10 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Response History</h3>
          <p className="text-sm text-gray-600">
            View your past responses and performance
          </p>
        </button>
        <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-purple-500">
          <Shield className="w-10 h-10 text-green-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">My Profile</h3>
          <p className="text-sm text-gray-600">
            Update your responder information
          </p>
        </button>
      </div>
    </div>
  );
};

export default ResponderDashboard;
