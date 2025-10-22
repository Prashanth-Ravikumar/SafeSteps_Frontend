import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Unauthorized Access
        </h1>
        <p className="mt-2 text-gray-600">
          You don't have permission to access this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
