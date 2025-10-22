import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  Eye,
  X,
} from "lucide-react";
import { formatDate, formatTime } from "../../utils/format";

const AdminTriggers = () => {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      const response = await api.get("/triggers");
      setTriggers(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch triggers");
    } finally {
      setLoading(false);
    }
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

  const openDetailsModal = async (trigger) => {
    try {
      // Fetch trigger responses
      const response = await api.get(`/responses/trigger/${trigger._id}`);
      setSelectedTrigger({ ...trigger, responses: response.data.data });
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to load trigger details");
    }
  };

  const filterByDate = (trigger) => {
    if (dateFilter === "all") return true;

    const triggerDate = new Date(trigger.createdAt);
    const now = new Date();
    const diffTime = now - triggerDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    switch (dateFilter) {
      case "today":
        return diffDays < 1;
      case "week":
        return diffDays < 7;
      case "month":
        return diffDays < 30;
      default:
        return true;
    }
  };

  const filteredTriggers = triggers.filter((trigger) => {
    const matchesSearch =
      trigger.triggeredBy?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      trigger.triggeredBy?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      trigger.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || trigger.status === statusFilter;

    const matchesDate = filterByDate(trigger);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: triggers.length,
    active: triggers.filter((t) => t.status === "active").length,
    responded: triggers.filter((t) => t.status === "responded").length,
    resolved: triggers.filter((t) => t.status === "resolved").length,
    cancelled: triggers.filter((t) => t.status === "cancelled").length,
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
          <AlertTriangle className="mr-3 h-8 w-8 text-red-600" />
          Emergency Triggers
        </h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage all emergency alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Triggers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-red-600">{stats.active}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Responded</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.responded}
              </p>
            </div>
            <Activity className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        {/* <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div> */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.cancelled}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by user name, email, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="responded">Responded</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Triggers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTriggers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      dateFilter !== "all"
                        ? "No triggers found matching your filters"
                        : "No emergency triggers recorded"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTriggers.map((trigger) => (
                  <tr key={trigger._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {trigger.triggeredBy?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {trigger.triggeredBy?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-red-500 mr-1" />
                        <div>
                          <p>
                            {trigger.location?.coordinates[1].toFixed(4)},{" "}
                            {trigger.location?.coordinates[0].toFixed(4)}
                          </p>
                          {trigger.location?.address && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {trigger.location.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(trigger.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <div>
                          <p>{formatDate(trigger.createdAt)}</p>
                          <p className="text-xs text-gray-500">
                            {formatTime(trigger.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {trigger.respondersNotified?.length || 0} notified
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openDetailsModal(trigger)}
                        className="text-purple-600 hover:text-purple-900 transition-colors flex items-center"
                      >
                        <Eye className="w-5 h-5 mr-1" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Details Modal */}
      {showDetailsModal && selectedTrigger && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Emergency Trigger Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`rounded-lg p-4 ${
                  selectedTrigger.status === "active"
                    ? "bg-red-50 border-2 border-red-200"
                    : selectedTrigger.status === "resolved"
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-blue-50 border-2 border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle
                      className={`w-8 h-8 mr-3 ${
                        selectedTrigger.status === "active"
                          ? "text-red-600"
                          : selectedTrigger.status === "resolved"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        Emergency Alert
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedTrigger.createdAt)} at{" "}
                        {formatTime(selectedTrigger.createdAt)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(selectedTrigger.status)}
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Victim Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedTrigger.triggeredBy?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedTrigger.triggeredBy?.email}
                    </p>
                  </div>
                  {selectedTrigger.triggeredBy?.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">
                        {selectedTrigger.triggeredBy?.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Device & Trigger Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTrigger.device && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Device Used
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mb-1">
                      {selectedTrigger.device.deviceId}
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedTrigger.device.deviceName}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 capitalize">
                      {selectedTrigger.device.deviceType}
                    </span>
                  </div>
                )}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Priority & Type
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedTrigger.priority === "critical"
                            ? "bg-red-100 text-red-800"
                            : selectedTrigger.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : selectedTrigger.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {selectedTrigger.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Type:{" "}
                      <span className="font-medium text-gray-900 capitalize">
                        {selectedTrigger.triggerType}
                      </span>
                    </p>
                    {selectedTrigger.batteryLevel !== undefined && (
                      <p className="text-sm text-gray-600">
                        Battery:{" "}
                        <span className="font-medium text-gray-900">
                          {selectedTrigger.batteryLevel}%
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-600" />
                  Location
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Coordinates</p>
                    <p className="font-medium text-gray-900">
                      Latitude: {selectedTrigger.location?.coordinates[1]},
                      Longitude: {selectedTrigger.location?.coordinates[0]}
                    </p>
                  </div>
                  {selectedTrigger.location?.address && (
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">
                        {selectedTrigger.location.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedTrigger.description && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Emergency Description
                  </h3>
                  <p className="text-gray-700">{selectedTrigger.description}</p>
                </div>
              )}

              {/* Responders Notified */}
              {selectedTrigger.respondersNotified &&
                selectedTrigger.respondersNotified.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Responders Notified (
                      {selectedTrigger.respondersNotified.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedTrigger.respondersNotified.map(
                        (responder, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 flex items-center"
                          >
                            <User className="w-5 h-5 text-blue-600 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {responder.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {responder.email}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Responses */}
              {selectedTrigger.responses &&
                selectedTrigger.responses.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Response History ({selectedTrigger.responses.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedTrigger.responses.map((response) => (
                        <div
                          key={response._id}
                          className="bg-white rounded-lg p-4 border border-green-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <User className="w-5 h-5 text-green-600 mr-2" />
                              <p className="font-medium text-gray-900">
                                {response.responder?.name}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                response.status === "accepted"
                                  ? "bg-blue-100 text-blue-800"
                                  : response.status === "on-route"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : response.status === "arrived"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {response.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Accepted at: {formatDate(response.acceptedAt)}{" "}
                            {formatTime(response.acceptedAt)}
                          </p>
                          {response.arrivedAt && (
                            <p className="text-sm text-gray-600">
                              Arrived at: {formatDate(response.arrivedAt)}{" "}
                              {formatTime(response.arrivedAt)}
                            </p>
                          )}
                          {response.notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">
                              "{response.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTriggers;
