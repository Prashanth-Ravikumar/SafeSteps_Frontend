// Format date
export const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time
export const formatTime = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Format date and time together
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return "N/A";
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

// Format status badge color
export const getStatusColor = (status) => {
  const colors = {
    active: "bg-red-100 text-red-800",
    responded: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    false_alarm: "bg-blue-100 text-blue-800",
    notified: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    en_route: "bg-yellow-100 text-yellow-800",
    arrived: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    unassigned: "bg-gray-100 text-gray-800",
    inactive: "bg-gray-100 text-gray-800",
    maintenance: "bg-orange-100 text-orange-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Format priority badge color
export const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return colors[priority] || "bg-gray-100 text-gray-800";
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone
export const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
};
