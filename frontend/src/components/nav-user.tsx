"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState, useRef } from "react";
import UserProfile from "./user-profile";
import { useAuth } from "@/auth/useAuth";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GoogleCalendarDialog from "./modals/google-calendar.modal";
import { BadgeCheck, Calendar, ChevronsUpDown, LogOut } from "lucide-react";

export function NavUser() {
  const { user } = useAuth();
  const { logout } = useAuth();
  const { isMobile } = useSidebar();
  const [isShow, setIsShow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) {
    return null;
  }

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const nameParts = fullName.split(" ");
    return nameParts
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const openUserProfile = () => {
    setIsShow(true);
    setDropdownOpen(false);
  };

  const closeUserProfile = () => {
    setIsShow(false);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <Avatar className="h-9 w-9 rounded-full border border-gray-300 shadow-sm">
                  <AvatarFallback className="rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0 ml-3">
                  <span className="truncate font-semibold text-base leading-tight">
                    {user.fullName}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-5 text-gray-400" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              ref={dropdownRef}
              className="min-w-[220px] max-w-xs rounded-xl shadow-lg p-2"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                  <Avatar className="h-9 w-9 rounded-full border border-gray-300 shadow-sm">
                    <AvatarFallback className="rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-semibold text-base leading-tight">
                      {user.fullName}
                    </span>
                    <span className="truncate text-xs text-gray-500">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-blue-50 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openUserProfile();
                  }}
                >
                  <BadgeCheck className="text-blue-600" />
                  <span className="font-medium">Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-blue-50 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropdownOpen(false);
                    setShowGoogleCalendar(true);
                  }}
                >
                  <Calendar className="text-green-600" />
                  <span className="font-medium">Google Calendar</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-red-50 transition"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logout();
                }}
              >
                <LogOut className="text-red-600" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* User Profile */}
      <Dialog
        open={isShow}
        modal={true}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeUserProfile();
          }
        }}
      >
        <DialogContent
          className="h-[95%] max-w-md w-full overflow-hidden p-0"
          onEscapeKeyDown={closeUserProfile}
          onInteractOutside={(e) => {
            e.preventDefault();
            closeUserProfile();
          }}
        >
          <div className="overflow-y-auto h-full w-full">
            <UserProfile />
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Calendar Dialog */}
      <GoogleCalendarDialog
        isOpen={showGoogleCalendar}
        onOpenChange={setShowGoogleCalendar}
      />
    </>
  );
}
