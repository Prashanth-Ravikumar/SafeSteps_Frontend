import { useState, useEffect } from "react";
import { Users, Smartphone, Activity, AlertTriangle } from "lucide-react";
import api from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    activeTriggers: 0,
    totalTriggers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, devices, triggers] = await Promise.all([
        api.get("/users"),
        api.get("/devices"),
        api.get("/triggers"),
      ]);

      setStats({
        totalUsers: users.data.count || 0,
        totalDevices: devices.data.count || 0,
        activeTriggers:
          triggers.data.data?.filter((t) => t.status === "active").length || 0,
        totalTriggers: triggers.data.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatsCard
          title="Total Devices"
          value={stats.totalDevices}
          icon={Smartphone}
          color="bg-green-500"
        />
        <StatsCard
          title="Active Triggers"
          value={stats.activeTriggers}
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <StatsCard
          title="Total Triggers"
          value={stats.totalTriggers}
          icon={Activity}
          color="bg-purple-500"
        />
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-full`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default AdminDashboard;
