import { useState, useCallback } from "react";
import api from "@/api/api";

interface ConnectionStatus {
  success: boolean;
  connected: boolean;
  message: string;
}

interface CalendarEvent {
  userId: number;
  summary: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
}

interface CreateEventResponse {
  success: boolean;
  message: string;
  event?: any;
}

export function useGoogleCalendar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Không cần getAuthToken nữa vì axios interceptor sẽ tự động thêm token

  const checkConnectionStatus =
    useCallback(async (): Promise<ConnectionStatus> => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/google-calendar/status");
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Unknown error";
        setError(errorMessage);
        return {
          success: false,
          connected: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    }, []);

  const connectCalendar = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/google-calendar");
      console.log("Response:", response.data);

      if (response.data.success && response.data.redirectUrl) {
        console.log("Redirecting to Google OAuth:", response.data.redirectUrl);
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error(response.data.message || "Failed to get Google OAuth URL");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectCalendar = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/google-calendar/disconnect");
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to disconnect");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(
    async (event: CalendarEvent): Promise<CreateEventResponse> => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post("/google-calendar/create-event", event);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Unknown error";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    checkConnectionStatus,
    connectCalendar,
    disconnectCalendar,
    createEvent,
    clearError,
  };
}
