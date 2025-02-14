'use client';

export default function Error() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-500">
          We couldn't load the property details. Please try again later.
        </p>
      </div>
    </div>
  );
} 