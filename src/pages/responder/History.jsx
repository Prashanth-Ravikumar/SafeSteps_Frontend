import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Clock,
  MapPin,
  User,
  CheckCircle,
  Activity,
  Calendar,
  Search,
  Filter,
  X,
  Phone,
  Heart,
  Smartphone,
  Navigation,
  Award,
} from "lucide-react";
import { formatDate, formatTime, formatRelativeTime } from "../../utils/format";

const ResponderHistory = () => {
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchResponses();
  }, []);

  useEffect(() => {
    filterResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, dateFilter, responses]);

  const fetchResponses = async () => {
    try {
      const res = await api.get("/responses/my-responses");
      setResponses(res.data.data);
    } catch (error) {
      console.error("Failed to fetch responses:", error);
      toast.error("Failed to load response history");
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (response) => {
    if (dateFilter === "all") return true;
    const now = new Date();
    const responseDate = new Date(response.createdAt);
    const diffDays = Math.floor((now - responseDate) / (1000 * 60 * 60 * 24));

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

  const filterResponses = () => {
    let filtered = responses;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Date filter
    filtered = filtered.filter(filterByDate);

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.trigger?.triggeredBy?.name?.toLowerCase().includes(search) ||
          r.trigger?.location?.address?.toLowerCase().includes(search) ||
          r.notes?.toLowerCase().includes(search)
      );
    }

    setFilteredResponses(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      accepted: { bg: "bg-blue-100", text: "text-blue-800", label: "Accepted" },
      "on-route": {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "On Route",
      },
      arrived: { bg: "bg-green-100", text: "text-green-800", label: "Arrived" },
      completed: {
        bg: "bg-purple-100",
        text: "text-purple-800",
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

  const calculateDuration = (acceptedAt, arrivedAt) => {
    if (!acceptedAt || !arrivedAt) return "N/A";
    const diff = new Date(arrivedAt) - new Date(acceptedAt);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStats = () => {
    const completed = responses.filter((r) => r.status === "completed");
    const totalResponseTime = completed.reduce((acc, r) => {
      if (r.acceptedAt && r.completedAt) {
        return acc + (new Date(r.completedAt) - new Date(r.acceptedAt));
      }
      return acc;
    }, 0);

    const avgResponseTime = completed.length
      ? Math.floor(totalResponseTime / completed.length / 60000)
      : 0;

    return {
      total: responses.length,
      completed: completed.length,
      inProgress: responses.filter((r) => r.status !== "completed").length,
      avgResponseTime: avgResponseTime,
      completionRate: responses.length
        ? Math.round((completed.length / responses.length) * 100)
        : 0,
    };
  };

  const stats = getStats();

  const openDetailsModal = (response) => {
    setSelectedResponse(response);
    setShowDetailsModal(true);
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
          <Clock className="mr-3 h-8 w-8 text-purple-600" />
          Response History
        </h1>
        <p className="mt-2 text-gray-600">
          View your emergency response performance and history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 text-gray-600 mr-1" />
            <p className="text-sm text-gray-600">Avg Time</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {stats.avgResponseTime}m
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-1">
            <Award className="w-4 h-4 text-gray-600 mr-1" />
            <p className="text-sm text-gray-600">Completion</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.completionRate}%
          </p>
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
              placeholder="Search by victim or location..."
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
              <option value="accepted">Accepted</option>
              <option value="on-route">On Route</option>
              <option value="arrived">Arrived</option>
              <option value="completed">Completed</option>
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

      {/* Response History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredResponses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Victim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accepted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponses.map((response) => (
                  <tr key={response._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {response.trigger?.triggeredBy?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {response.trigger?.triggeredBy?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1 mt-0.5 shrink-0" />
                        <a
                          href={`https://www.google.com/maps?q=${response.trigger?.location?.coordinates[1]},${response.trigger?.location?.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:underline truncate max-w-xs"
                        >
                          {response.trigger?.location?.address ||
                            "View Location"}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(response.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(response.acceptedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(response.acceptedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {calculateDuration(
                          response.acceptedAt,
                          response.completedAt
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openDetailsModal(response)}
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
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No responses found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Your response history will appear here"}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-purple-600" />
                  Response Details
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
              {/* Status Banner */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {getStatusBadge(selectedResponse.status)}
                  <span className="text-sm text-gray-600">
                    Response ID: {selectedResponse._id.slice(-8)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Victim Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Victim Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {selectedResponse.trigger?.triggeredBy?.name ||
                          "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>{" "}
                      <span className="text-gray-900">
                        {selectedResponse.trigger?.triggeredBy?.email || "N/A"}
                      </span>
                    </div>
                    {selectedResponse.trigger?.triggeredBy?.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-gray-500" />
                        <a
                          href={`tel:${selectedResponse.trigger.triggeredBy.phone}`}
                          className="text-purple-600 hover:underline"
                        >
                          {selectedResponse.trigger.triggeredBy.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Response Timeline
                  </h3>
                  <div className="space-y-3">
                    {selectedResponse.acceptedAt && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Alert Accepted
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(selectedResponse.acceptedAt)}{" "}
                            {formatTime(selectedResponse.acceptedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedResponse.arrivedAt && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Arrived at Location
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(selectedResponse.arrivedAt)}{" "}
                            {formatTime(selectedResponse.arrivedAt)}
                          </p>
                          {selectedResponse.acceptedAt && (
                            <p className="text-xs text-purple-600 font-medium">
                              Response time:{" "}
                              {calculateDuration(
                                selectedResponse.acceptedAt,
                                selectedResponse.arrivedAt
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedResponse.status === "completed" && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Response Completed
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(selectedResponse.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              {selectedResponse.trigger?.triggeredBy?.medicalInfo && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-600" />
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedResponse.trigger.triggeredBy.medicalInfo
                      .bloodGroup && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-500">Blood Group:</span>{" "}
                        <span className="font-medium text-red-600">
                          {
                            selectedResponse.trigger.triggeredBy.medicalInfo
                              .bloodGroup
                          }
                        </span>
                      </div>
                    )}
                    {selectedResponse.trigger.triggeredBy.medicalInfo
                      .allergies && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-500">Allergies:</span>{" "}
                        <span className="text-gray-900">
                          {
                            selectedResponse.trigger.triggeredBy.medicalInfo
                              .allergies
                          }
                        </span>
                      </div>
                    )}
                    {selectedResponse.trigger.triggeredBy.medicalInfo
                      .medications && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-500">Medications:</span>{" "}
                        <span className="text-gray-900">
                          {
                            selectedResponse.trigger.triggeredBy.medicalInfo
                              .medications
                          }
                        </span>
                      </div>
                    )}
                    {selectedResponse.trigger.triggeredBy.medicalInfo
                      .conditions && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-500">Conditions:</span>{" "}
                        <span className="text-gray-900">
                          {
                            selectedResponse.trigger.triggeredBy.medicalInfo
                              .conditions
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedResponse.trigger?.location && (
                <div className="bg-green-50 rounded-lg p-4 mt-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Location
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      {selectedResponse.trigger.location.address}
                    </p>
                    <p className="text-gray-500 font-mono">
                      {selectedResponse.trigger.location.coordinates[1].toFixed(
                        6
                      )}
                      ,{" "}
                      {selectedResponse.trigger.location.coordinates[0].toFixed(
                        6
                      )}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`https://www.google.com/maps?q=${selectedResponse.trigger.location.coordinates[1]},${selectedResponse.trigger.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <MapPin className="w-4 h-4 mr-1.5" />
                        View on Map
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedResponse.trigger.location.coordinates[1]},${selectedResponse.trigger.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Navigation className="w-4 h-4 mr-1.5" />
                        Directions
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedResponse.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700 text-sm">
                    {selectedResponse.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponderHistory;
