export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-4 bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">404 Page Not Found</h1>
        <p className="text-sm text-gray-600">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
