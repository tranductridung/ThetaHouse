const Forbidden = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">403</h1>
        <p className="text-2xl font-semibold text-gray-600 mt-4">
          Access Forbidden
        </p>
        <p className="text-gray-500 mt-2 mb-8">
          You don't have permission to access this resource.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
