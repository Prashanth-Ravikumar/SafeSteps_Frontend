import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <FileQuestion className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          404 - Page Not Found
        </h1>
        <p className="mt-2 text-gray-600">
          The page you're looking for doesn't exist.
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

export default NotFound;
