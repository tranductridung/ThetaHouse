import { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";

interface GoogleCalendarStatusProps {
  onConnect?: () => void;
}

interface ConnectionStatus {
  success: boolean;
  connected: boolean;
  message: string;
}

export function GoogleCalendarStatus({ onConnect }: GoogleCalendarStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get("/google-calendar/status");
      setStatus(response.data);
    } catch (error) {
      setStatus({
        success: false,
        connected: false,
        message: error?.response?.data?.message || "Failed to check status",
      });

      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectCalendar = async () => {
    try {
      setDisconnecting(true);
      const response = await api.post("/google-calendar/disconnect");
      const data = response.data;

      if (data.success) {
        alert("Google Calendar disconnected successfully");
        checkStatus(); // Refresh status
      } else {
        alert(data.message || "Failed to disconnect");
      }
    } catch (error: any) {
      console.error("Error disconnecting Google Calendar:", error);
      alert(
        error.response?.data?.message || "Failed to disconnect Google Calendar"
      );
    } finally {
      setDisconnecting(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking connection status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Status
        </CardTitle>
        <CardDescription>
          Manage your Google Calendar connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status?.connected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {status?.connected ? "Connected" : "Not Connected"}
            </span>
            <Badge variant={status?.connected ? "default" : "secondary"}>
              {status?.connected ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {status?.message && (
          <p className="text-sm text-muted-foreground">{status.message}</p>
        )}

        <div className="flex gap-2">
          {!status?.connected ? (
            <Button onClick={onConnect} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Connect Google Calendar
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={disconnectCalendar}
              disabled={disconnecting}
              className="flex items-center gap-2"
            >
              {disconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Disconnect
            </Button>
          )}

          <Button
            variant="outline"
            onClick={checkStatus}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
