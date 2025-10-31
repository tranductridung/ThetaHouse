import {
  User,
  Loader2,
  AlertCircle,
  ChevronLeft,
  UserCircle2,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import api from "@/api/api";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

type CalendarView = "month" | "week" | "day";

interface Appointment {
  id: string;
  category: string;
  customer: { fullName: string };
  healer: { fullName: string };
  startAt: Date;
  endAt: Date;
}

// Date utility functions
const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday = 0 to Monday = 0
};

const formatDate = (date: Date) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isToday = (date: Date) => {
  return isSameDay(date, new Date());
};

const getWeekDates = (date: Date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    dates.push(currentDate);
  }
  return dates;
};

// Event component
function EventCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2 mb-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 font-medium text-blue-800 text-xs">
          <UserCircle2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{appointment.healer.fullName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="truncate">{appointment.customer.fullName}</span>
        </div>
        <div className="text-xs text-gray-500 font-light truncate">
          {appointment.category}
        </div>
        <div className="text-xs text-blue-600 font-medium">
          {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
        </div>
      </div>
    </div>
  );
}

// Month view component
function MonthView({
  currentDate,
  appointments,
}: {
  currentDate: Date;
  appointments: Appointment[];
}) {
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  // const today = new Date();

  const days = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(
      <div key={`empty-${i}`} className="h-24 md:h-32 p-1 bg-gray-50"></div>
    );
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dayAppointments = appointments.filter((apt) =>
      isSameDay(new Date(apt.startAt), date)
    );
    const isCurrentDay = isToday(date);

    days.push(
      <div
        key={day}
        className={`h-24 md:h-32 p-1 border border-gray-100 ${
          isCurrentDay
            ? "bg-blue-50 border-blue-200"
            : "bg-white hover:bg-gray-50"
        } transition-colors`}
      >
        <div
          className={`text-sm font-medium mb-1 ${
            isCurrentDay ? "text-blue-700" : "text-gray-700"
          }`}
        >
          {day}
          {isCurrentDay && (
            <div className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-1"></div>
          )}
        </div>
        <div className="space-y-1 overflow-y-auto max-h-20 md:max-h-24">
          {dayAppointments.slice(0, 2).map((apt) => (
            <div
              key={apt.id}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded truncate"
            >
              {apt.healer.fullName}
            </div>
          ))}
          {dayAppointments.length > 2 && (
            <div className="text-xs text-gray-500">
              +{dayAppointments.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="p-3 text-center font-semibold text-gray-700 text-sm"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">{days}</div>
    </div>
  );
}

// Week view component
function WeekView({
  currentDate,
  appointments,
}: {
  currentDate: Date;
  appointments: Appointment[];
}) {
  const weekDates = getWeekDates(currentDate);

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDates.map((date, index) => {
          const dayAppointments = appointments.filter((apt) =>
            isSameDay(new Date(apt.startAt), date)
          );
          const isCurrentDay = isToday(date);

          return (
            <div
              key={index}
              className={`p-4 text-center border-r border-gray-100 last:border-r-0 ${
                isCurrentDay ? "bg-blue-50" : ""
              }`}
            >
              <div className="text-sm font-medium text-gray-500 mb-1">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={`text-lg font-semibold ${
                  isCurrentDay ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {date.getDate()}
                {isCurrentDay && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {dayAppointments.map((apt) => (
                  <EventCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Day view component
function DayView({
  currentDate,
  appointments,
}: {
  currentDate: Date;
  appointments: Appointment[];
}) {
  const dayAppointments = appointments.filter((apt) =>
    isSameDay(new Date(apt.startAt), currentDate)
  );
  const isCurrentDay = isToday(currentDate);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="text-center mb-6">
        <h3
          className={`text-2xl font-bold ${
            isCurrentDay ? "text-blue-600" : "text-gray-900"
          }`}
        >
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {isCurrentDay && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Today
            </span>
          )}
        </h3>
      </div>

      <div className="space-y-4">
        {dayAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No appointments scheduled for this day</p>
          </div>
        ) : (
          dayAppointments
            .sort(
              (a, b) =>
                new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
            )
            .map((apt) => <EventCard key={apt.id} appointment={apt} />)
        )}
      </div>
    </div>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600 text-sm">Loading appointments...</p>
      </div>
    </div>
  );
}

// Error component
function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Unable to load appointments
          </h3>
          <p className="text-gray-600 text-sm mb-4">{message}</p>
          <Button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyCalendar() {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`appointments/all`);
      const appointments = response.data.appointments.map(
        (apt: Appointment) => ({
          ...apt,
          startAt: new Date(apt.startAt),
          endAt: new Date(apt.endAt),
        })
      );
      setAppointments(appointments);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRetry = () => {
    fetchData();
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    if (view === "month") {
      newDate.setMonth(
        currentDate.getMonth() + (direction === "next" ? 1 : -1)
      );
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Appointment Calendar
                </h1>
              </div>
            </div>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Appointment Calendar
                </h1>
              </div>
            </div>
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                    Appointment Calendar
                  </h1>
                  <p className="text-sm text-gray-500 mt-1 hidden md:block">
                    Manage and view your appointments
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigateDate("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                  {view === "day"
                    ? currentDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : formatDate(currentDate)}
                </h2>

                <Button
                  onClick={() => navigateDate("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Today
                </Button>
              </div>

              {/* View buttons */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {["month", "week", "day"].map((viewType) => (
                  <Button
                    key={viewType}
                    onClick={() => setView(viewType as CalendarView)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      view === viewType
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {viewType}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="p-4 md:p-6">
            {view === "month" && (
              <MonthView
                currentDate={currentDate}
                appointments={appointments}
              />
            )}
            {view === "week" && (
              <WeekView currentDate={currentDate} appointments={appointments} />
            )}
            {view === "day" && (
              <DayView currentDate={currentDate} appointments={appointments} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
