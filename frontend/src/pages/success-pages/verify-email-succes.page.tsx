import { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VerifyEmailSuccess = () => {
  const [countdown, setCountdown] = useState(5);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRedirect(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const navigate = useNavigate();
  useEffect(() => {
    if (redirect) navigate("/auth/login");
  }, [redirect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-green-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 -ml-16 -mb-16"></div>

        {/* Content */}
        <div className="relative">
          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Email Verified!
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-center mb-6">
            Your email address has been successfully verified. You're all set to
            get started!
          </p>

          {/* Success Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-900">
                <p className="font-semibold mb-1">What's next?</p>
                <p className="text-green-800">
                  You can now access all features of your account and start
                  exploring.
                </p>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-600">
              Redirecting to login in{" "}
              <span className="font-bold text-green-600 text-lg">
                {countdown}
              </span>{" "}
              seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href="/auth/login"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group"
            >
              Go to Login
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Welcome aboard! If you have any questions, feel free to reach out
              to our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSuccess;
