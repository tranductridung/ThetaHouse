import { AlertCircle } from "lucide-react";

const VerifyEmailFailed = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Verification Failed
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          We couldn't verify your email address. This link may have expired or
          already been used.
        </p>

        {/* Reasons */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-red-900 mb-2">
            Common reasons:
          </p>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• The verification link has expired</li>
            <li>• The link has already been used</li>
            <li>• The link was copied incorrectly</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href="/auth/resend-verify-email"
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            Resend Email
          </a>

          <a
            href="/auth/login"
            className="w-full block text-center text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors duration-200"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailFailed;
