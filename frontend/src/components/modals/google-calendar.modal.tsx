import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Link,
  Link2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import api from "@/api/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { handleAxiosError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface GoogleCalendarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const GoogleCalendarDialog = ({
  isOpen,
  onOpenChange,
}: GoogleCalendarDialogProps) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const checkConnectionStatus = async () => {
    try {
      console.log("11111111111111111111");
      setIsLoading(true);
      console.log("22222222222222");
      const response = await api.get("google-calendar/status");
      console.log("Google Calendar status response:", response);
      setIsConnected(response.data.connected);
      console.log("33333333333333");
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConnectionStatus();
    }
  }, [isOpen]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleConnect = async () => {
    setIsConnecting(true);
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
        setIsConnecting(false);
        return;
      }

      const connectUrl = `${backendUrl}/google-calendar/connect?accessToken=${encodeURIComponent(
        accessToken
      )}`;
      console.log(connectUrl);
      window.location.href = connectUrl;
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await api.post("google-calendar/disconnect");
      toast.success("Disconnected Google Calendar success!");
      setIsConnected(false);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }

    if (isConnected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Checking...";
    if (isConnected) return "Connected";
    return "Not Connected";
  };

  const getStatusBadge = () => {
    if (isLoading) return "bg-blue-100 text-blue-800 border-blue-200";
    if (isConnected) return "bg-green-100 text-green-800 border-green-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusDescription = () => {
    if (isLoading) return "Checking Google Calendar connection status...";
    if (isConnected)
      return "Your Google Calendar account has been successfully connected. You can create and manage events.";
    return "Your Google Calendar account is not connected. Connect to create and manage events.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Google Calendar Settings
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            Manage your Google Calendar connection and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Google Calendar Status Card */}
          {isLoading ? (
            <Card className="bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg">
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-gray-600">
                    Checking Google Calendar status...
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Google Calendar
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Manage connection with Google Calendar
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={`${getStatusBadge()} border-2 px-3 py-1 text-xs font-medium`}
                  >
                    {getStatusIcon()}
                    <span className="ml-2">{getStatusText()}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      Connection Status
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {getStatusDescription()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {!isConnected ? (
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Link className="h-4 w-4 mr-2" />
                      )}
                      {isConnecting
                        ? "Connecting..."
                        : "Connect Google Calendar"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      variant="outline"
                      className="flex-1 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700 font-medium py-2.5 transition-all duration-200"
                    >
                      {isDisconnecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  )}

                  <Button
                    onClick={checkConnectionStatus}
                    variant="ghost"
                    className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 transition-all duration-200"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {isConnected && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-800 mb-1">
                          Successfully Connected!
                        </h4>
                        <p className="text-sm text-green-700">
                          You can now create and manage events in your Google
                          Calendar. Events will be automatically synchronized.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isConnected && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">
                          Not Connected
                        </h4>
                        <p className="text-sm text-blue-700">
                          Connect Google Calendar to create and manage events.
                          The connection process will open a Google OAuth window
                          for you to authenticate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Connect Google Calendar:
                </h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Click the "Connect Google Calendar" button</li>
                  <li>Authenticate via Google OAuth</li>
                  <li>Select your Google account</li>
                  <li>Allow Calendar access permissions</li>
                  <li>Return to the app to check status</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Key Features:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check connection status</li>
                  <li>• Connect/disconnect Google Calendar</li>
                  <li>• Automatic event synchronization</li>
                  <li>• Manage access permissions</li>
                  <li>• Refresh connection status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleCalendarDialog;
