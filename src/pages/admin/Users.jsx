import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Ban,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import { formatDate } from "../../utils/format";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this user? They won't be able to login."
      )
    ) {
      return;
    }
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deactivated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to deactivate user");
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: Shield,
        label: "Admin",
      },
      responder: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: UserCheck,
        label: "Responder",
      },
      enduser: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: Users,
        label: "End User",
      },
    };

    const config = roleConfig[role] || roleConfig.enduser;
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

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    responders: users.filter((u) => u.role === "responder").length,
    endusers: users.filter((u) => u.role === "enduser").length,
    active: users.filter((u) => u.isActive).length,
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
          <Users className="mr-3 h-8 w-8 text-purple-600" />
          User Management
        </h1>
        <p className="mt-2 text-gray-600">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.admins}
              </p>
            </div>
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Responders</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.responders}
              </p>
            </div>
            <UserCheck className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">End Users</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.endusers}
              </p>
            </div>
            <Users className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
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
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="responder">Responder</option>
              <option value="enduser">End User</option>
            </select>
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
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <UserX className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">
                      {searchTerm ||
                      roleFilter !== "all" ||
                      statusFilter !== "all"
                        ? "No users found matching your filters"
                        : "No users available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.phone ? (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openDetailsModal(user)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDeactivateUser(user._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Deactivate User"
                          >
                            <Ban className="w-5 h-5" />
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

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <UserX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedUser.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.isActive)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Mail className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Phone className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-gray-900">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Emergency Contacts (End Users) */}
              {selectedUser.role === "enduser" &&
                selectedUser.emergencyContacts &&
                selectedUser.emergencyContacts.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Emergency Contacts
                    </h4>
                    <div className="space-y-2">
                      {selectedUser.emergencyContacts.map((contact, index) => (
                        <div
                          key={index}
                          className="bg-red-50 border border-red-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {contact.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {contact.relationship}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.phone}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Medical Info (End Users) */}
              {selectedUser.role === "enduser" && selectedUser.medicalInfo && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Medical Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.medicalInfo.bloodGroup && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Blood Group</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.medicalInfo.bloodGroup}
                        </p>
                      </div>
                    )}
                    {selectedUser.medicalInfo.allergies && (
                      <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Allergies</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.medicalInfo.allergies}
                        </p>
                      </div>
                    )}
                    {selectedUser.medicalInfo.medications && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Medications</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.medicalInfo.medications}
                        </p>
                      </div>
                    )}
                    {selectedUser.medicalInfo.conditions && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          Medical Conditions
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.medicalInfo.conditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Responder Details */}
              {selectedUser.role === "responder" &&
                selectedUser.responderDetails && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Responder Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUser.responderDetails.department && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium text-gray-900">
                            {selectedUser.responderDetails.department}
                          </p>
                        </div>
                      )}
                      {selectedUser.responderDetails.badgeNumber && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Badge Number</p>
                          <p className="font-medium text-gray-900">
                            {selectedUser.responderDetails.badgeNumber}
                          </p>
                        </div>
                      )}
                      {selectedUser.responderDetails.currentLocation && (
                        <div className="bg-green-50 rounded-lg p-4 col-span-2">
                          <p className="text-sm text-gray-600">
                            Current Location
                          </p>
                          <p className="font-medium text-gray-900">
                            Lat:{" "}
                            {
                              selectedUser.responderDetails.currentLocation
                                .coordinates[1]
                            }
                            , Lng:{" "}
                            {
                              selectedUser.responderDetails.currentLocation
                                .coordinates[0]
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Account Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedUser.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
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

export default AdminUsers;
