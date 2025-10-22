import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  User,
  Smartphone,
  Calendar,
  Search,
  Filter,
  X,
} from "lucide-react";
import {
  formatDate,
  formatTime,
  getStatusColor,
  getPriorityColor,
} from "../../utils/format";

const UserHistory = () => {
  const [triggers, setTriggers] = useState([]);
  const [filteredTriggers, setFilteredTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    fetchTriggers();
  }, []);

  useEffect(() => {
    filterTriggers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, dateFilter, triggers]);

  const fetchTriggers = async () => {
    try {
      const res = await api.get("/triggers/my-triggers");
      setTriggers(res.data.data);
    } catch (error) {
      console.error("Failed to fetch triggers:", error);
      toast.error("Failed to load trigger history");
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (trigger) => {
    if (dateFilter === "all") return true;
    const now = new Date();
    const triggerDate = new Date(trigger.createdAt);
    const diffDays = Math.floor((now - triggerDate) / (1000 * 60 * 60 * 24));

    switch (dateFilter) {
      case "today":
        return diffDays === 0;
      case "week":
        return diffDays <= 7;
      case "month":
        return diffDays <= 30;
      default:
        return true;
    }
  };

  const filterTriggers = () => {
    let filtered = triggers;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Date filter
    filtered = filtered.filter(filterByDate);

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(search) ||
          t.location?.address?.toLowerCase().includes(search) ||
          t.triggerType?.toLowerCase().includes(search)
      );
    }

    setFilteredTriggers(filtered);
  };

  const openDetailsModal = async (trigger) => {
    setSelectedTrigger(trigger);
    setShowDetailsModal(true);
    setLoadingResponses(true);

    try {
      const res = await api.get(`/responses/trigger/${trigger._id}`);
      setResponses(res.data.data);
    } catch (error) {
      console.error("Failed to fetch responses:", error);
      toast.error("Failed to load response details");
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleCancelTrigger = async (triggerId) => {
    if (
      !window.confirm("Are you sure you want to cancel this emergency alert?")
    ) {
      return;
    }

    try {
      await api.put(`/triggers/${triggerId}/cancel`);
      toast.success("Emergency alert cancelled");
      fetchTriggers();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Failed to cancel trigger:", error);
      toast.error(error.response?.data?.message || "Failed to cancel alert");
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

  const getStatusStats = () => {
    return {
      total: triggers.length,
      active: triggers.filter((t) => t.status === "active").length,
      responded: triggers.filter((t) => t.status === "responded").length,
      resolved: triggers.filter((t) => t.status === "resolved").length,
      cancelled: triggers.filter((t) => t.status === "cancelled").length,
    };
  };

  const stats = getStatusStats();

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
          <Clock className="mr-3 h-8 w-8 text-purple-600" />
          My Alert History
        </h1>
        <p className="mt-2 text-gray-600">
          View and manage your emergency alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-red-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Responded</p>
          <p className="text-2xl font-bold text-blue-600">{stats.responded}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
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

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Triggers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTriggers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
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
                {filteredTriggers.map((trigger) => (
                  <tr key={trigger._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(trigger.status)}
                        {trigger.priority && (
                          <div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                                trigger.priority
                              )}`}
                            >
                              {trigger.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">
                        {trigger.description || "Emergency alert"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {trigger.triggerType}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1 mt-0.5 shrink-0" />
                        <a
                          href={`https://www.google.com/maps?q=${trigger.location?.coordinates[1]},${trigger.location?.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          {trigger.location?.address ||
                            `${trigger.location?.coordinates[1].toFixed(
                              4
                            )}, ${trigger.location?.coordinates[0].toFixed(4)}`}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(trigger.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(trigger.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {trigger.respondersNotified?.length || 0} notified
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openDetailsModal(trigger)}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No alerts found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Your emergency alerts will appear here"}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTrigger && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full  max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-purple-600" />
                  Alert Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Status Banner */}
              <div
                className={`rounded-lg p-4 mb-6 ${getStatusColor(
                  selectedTrigger.status
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusBadge(selectedTrigger.status)}
                    {selectedTrigger.priority && (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                          selectedTrigger.priority
                        )}`}
                      >
                        {selectedTrigger.priority} priority
                      </span>
                    )}
                  </div>
                  {selectedTrigger.status === "active" && (
                    <button
                      onClick={() => handleCancelTrigger(selectedTrigger._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Cancel Alert
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Device Info */}
                {selectedTrigger.device && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2 text-purple-600" />
                      Device Used
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">ID:</span>{" "}
                        <span className="font-mono">
                          {selectedTrigger.device.deviceId}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>{" "}
                        <span className="capitalize">
                          {selectedTrigger.device.deviceType}
                        </span>
                      </div>
                      {selectedTrigger.batteryLevel && (
                        <div>
                          <span className="text-gray-500">Battery:</span>{" "}
                          <span>{selectedTrigger.batteryLevel}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Trigger Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Trigger Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>{" "}
                      <span className="capitalize">
                        {selectedTrigger.triggerType}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Triggered:</span>{" "}
                      <span>
                        {formatDate(selectedTrigger.createdAt)}{" "}
                        {formatTime(selectedTrigger.createdAt)}
                      </span>
                    </div>
                    {selectedTrigger.updatedAt !==
                      selectedTrigger.createdAt && (
                      <div>
                        <span className="text-gray-500">Last Updated:</span>{" "}
                        <span>
                          {formatDate(selectedTrigger.updatedAt)}{" "}
                          {formatTime(selectedTrigger.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Location */}
              {selectedTrigger.location && (
                <div className="mt-6 bg-purple-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                    Location
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      {selectedTrigger.location.address}
                    </p>
                    <p className="text-gray-500 font-mono">
                      {selectedTrigger.location.coordinates[1].toFixed(6)},{" "}
                      {selectedTrigger.location.coordinates[0].toFixed(6)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${selectedTrigger.location.coordinates[1]},${selectedTrigger.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <MapPin className="w-4 h-4 mr-1.5" />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              )}{" "}
              {/* Description */}
              {selectedTrigger.description && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 text-sm">
                    {selectedTrigger.description}
                  </p>
                </div>
              )}
              {/* Responders Notified */}
              {selectedTrigger.respondersNotified?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-600" />
                    Responders Notified (
                    {selectedTrigger.respondersNotified.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTrigger.respondersNotified.map((responder) => (
                      <div
                        key={responder._id}
                        className="bg-gray-50 rounded-lg p-3"
                      >
                        <p className="font-medium text-gray-900">
                          {responder.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {responder.email}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Response History */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-600" />
                  Response History
                </h3>
                {loadingResponses ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : responses.length > 0 ? (
                  <div className="space-y-3">
                    {responses.map((response) => (
                      <div
                        key={response._id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {response.responder?.name}
                          </p>
                          {getStatusBadge(response.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {response.acceptedAt && (
                            <p>
                              Accepted: {formatDate(response.acceptedAt)}{" "}
                              {formatTime(response.acceptedAt)}
                            </p>
                          )}
                          {response.arrivedAt && (
                            <p>
                              Arrived: {formatDate(response.arrivedAt)}{" "}
                              {formatTime(response.arrivedAt)}
                            </p>
                          )}
                          {response.notes && (
                            <p className="text-gray-700 mt-2">
                              Notes: {response.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No responders have accepted this alert yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHistory;
