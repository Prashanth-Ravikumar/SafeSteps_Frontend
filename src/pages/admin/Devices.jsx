import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Smartphone,
  Plus,
  Search,
  User,
  X,
  Clock,
  Battery,
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

const AdminDevices = () => {
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [formData, setFormData] = useState({
    deviceId: "",
    deviceName: "",
    deviceType: "button",
    description: "",
  });
  const [assignUserId, setAssignUserId] = useState("");

  useEffect(() => {
    fetchDevices();
    fetchUsers();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get("/devices");
      setDevices(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      // Filter only end users for device assignment
      const endUsers = response.data.data.filter(
        (user) => user.role === "enduser"
      );
      setUsers(endUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    try {
      await api.post("/devices", formData);
      toast.success("Device created successfully");
      setShowCreateModal(false);
      setFormData({
        deviceId: "",
        deviceName: "",
        deviceType: "button",
        description: "",
      });
      fetchDevices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create device");
    }
  };

  const handleAssignDevice = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/devices/${selectedDevice._id}/assign`, {
        userId: assignUserId,
      });
      toast.success("Device assigned successfully");
      setShowAssignModal(false);
      setSelectedDevice(null);
      setAssignUserId("");
      fetchDevices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign device");
    }
  };

  const handleUnassignDevice = async (deviceId) => {
    if (!window.confirm("Are you sure you want to unassign this device?")) {
      return;
    }
    try {
      await api.put(`/devices/${deviceId}/unassign`);
      toast.success("Device unassigned successfully");
      fetchDevices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unassign device");
    }
  };

  const openAssignModal = (device) => {
    setSelectedDevice(device);
    setShowAssignModal(true);
  };

  const openDetailsModal = (device) => {
    setSelectedDevice(device);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Active",
      },
      inactive: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: Clock,
        label: "Inactive",
      },
      maintenance: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        icon: AlertCircle,
        label: "Maintenance",
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;
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

  const getBatteryBadge = (level) => {
    if (level >= 75) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Battery className="w-3 h-3 mr-1" />
          {level}%
        </span>
      );
    } else if (level >= 25) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Battery className="w-3 h-3 mr-1" />
          {level}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Battery className="w-3 h-3 mr-1" />
          {level}%
        </span>
      );
    }
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.assignedTo?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Smartphone className="mr-3 h-8 w-8 text-purple-600" />
              Device Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage emergency devices and assignments
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Device
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by device ID, name, type, or assigned user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.length}
              </p>
            </div>
            <Smartphone className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {devices.filter((d) => d.status === "active").length}
              </p>
            </div>
            <Activity className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-blue-600">
                {devices.filter((d) => d.assignedTo).length}
              </p>
            </div>
            <User className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Battery</p>
              <p className="text-2xl font-bold text-orange-600">
                {devices.filter((d) => d.batteryLevel < 25).length}
              </p>
            </div>
            <Battery className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">
                      {searchTerm
                        ? "No devices found matching your search"
                        : "No devices available. Create your first device!"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Smartphone className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-mono">
                            ID: {device._id}
                          </p>
                          <p className="font-medium text-gray-900 mt-1">
                            {device.deviceId}
                          </p>
                          <p className="text-sm text-gray-600">
                            {device.deviceName}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 capitalize">
                            {device.deviceType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(device.status)}
                      {device.lastPing && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last ping:{" "}
                          {new Date(device.lastPing).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getBatteryBadge(device.batteryLevel)}
                      {device.firmwareVersion && (
                        <p className="text-xs text-gray-500 mt-1">
                          FW: v{device.firmwareVersion}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {device.assignedTo ? (
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {device.assignedTo.name}
                            </p>
                            <p className="text-gray-500">
                              {device.assignedTo.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openDetailsModal(device)}
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="View Details"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                        {device.assignedTo ? (
                          <button
                            onClick={() => handleUnassignDevice(device._id)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Unassign Device"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openAssignModal(device)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Assign Device"
                          >
                            <User className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Device Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Device
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.deviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., DEV-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.deviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., button"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type *
                </label>
                <select
                  value={formData.deviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="button">Button</option>
                  <option value="wearable">Wearable</option>
                  <option value="mobile">Mobile App</option>
                  <option value="sensor">Sensor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Emergency wearable button"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Create Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Device Modal */}
      {showAssignModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Assign Device
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Device</p>
              <p className="font-medium text-gray-900">
                {selectedDevice.deviceId} - {selectedDevice.model}
              </p>
            </div>
            <form onSubmit={handleAssignDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User (End Users Only) *
                </label>
                <select
                  required
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    No end users available. Create end user accounts first.
                  </p>
                )}
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={users.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device Details Modal */}
      {showDetailsModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Device Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Device ID Banner */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <div className="flex items-start">
                  <Smartphone className="w-12 h-12 text-purple-600 mr-4" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-mono mb-1">
                      Object ID
                    </p>
                    <p className="text-lg font-bold text-gray-900 font-mono break-all">
                      {selectedDevice._id}
                    </p>
                    <div className="mt-3 flex items-center space-x-3">
                      <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">
                        {selectedDevice.deviceId}
                      </span>
                      {getStatusBadge(selectedDevice.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Device Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedDevice.deviceName}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Device Type</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {selectedDevice.deviceType}
                  </p>
                </div>
                {selectedDevice.description && (
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="font-medium text-gray-900">
                      {selectedDevice.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Battery & Firmware */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Battery Level
                      </p>
                      {getBatteryBadge(selectedDevice.batteryLevel)}
                    </div>
                    <Battery className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Firmware Version
                      </p>
                      <p className="font-bold text-blue-900">
                        v{selectedDevice.firmwareVersion}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Assigned User */}
              {selectedDevice.assignedTo && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-3">Assigned To</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">
                        {selectedDevice.assignedTo.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedDevice.assignedTo.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedDevice.assignedTo.email}
                      </p>
                      {selectedDevice.assignedTo.phone && (
                        <p className="text-sm text-gray-600">
                          {selectedDevice.assignedTo.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Last Ping & Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDevice.lastPing && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Last Ping</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(selectedDevice.lastPing).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Created At</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {new Date(selectedDevice.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {new Date(selectedDevice.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
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

export default AdminDevices;
