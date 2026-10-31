import axios from "axios";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Mail, Calendar, ArrowRight } from "lucide-react";

export default function EmailMismatch() {
  const handleConnectGoogleCalendar = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const responses = await axios.post(
        `${backendUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const accessToken = responses.data.accessToken;
      localStorage.setItem("accessToken", accessToken);

      if (!accessToken) {
        toast.error("You need to login to connect Google Calendar");
        return;
      }

      const connectUrl = `${backendUrl}/google-calendar/connect?accessToken=${encodeURIComponent(
        accessToken
      )}`;
      window.location.href = connectUrl;
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const accountEmail = params.get("accountEmail");
  const googleCalendarEmail = params.get("googleCalendarEmail");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 rounded-full p-4">
              <AlertCircle className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-3">
            Email Mismatch Detected
          </h1>

          {/* Description */}
          <p className="text-slate-600 text-center mb-8">
            The email address associated with your account doesn't match the
            email used to connect with Google Calendar.
          </p>

          {/* Email Comparison */}
          <div className="space-y-4 mb-8">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">
                  Account Email
                </span>
              </div>
              <p className="text-slate-900 font-medium ml-8">{accountEmail}</p>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  Google Calendar Email
                </span>
              </div>
              <p className="text-blue-900 font-medium ml-8">
                {googleCalendarEmail}
              </p>
            </div>
          </div>

          {/* What this means */}
          <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2 text-sm">
              What this means:
            </h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Calendar events may not sync correctly</li>
              <li>• You might not receive calendar notifications</li>
              <li>• Some features may be limited</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => handleConnectGoogleCalendar()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Reconnect with Correct Email
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-lg border border-slate-300 transition-colors duration-200"
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
