"use client";

import {
  BadgeCheck,
  Bell,
  Calendar,
  ChevronsUpDown,
  LogOut,
  Sparkles,
} from "lucide-react";
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
import { toast } from "sonner";
import { useState, useRef } from "react";
import UserProfile from "./user-profile";
import { useAuth } from "@/auth/useAuth";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GoogleCalendarConnectModal } from "./GoogleCalendarConnectModal";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();
  const [isShow, setIsShow] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Early return if user is not available
  if (!user) {
    return null;
  }

  // Function to get initials from fullName
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const nameParts = fullName.split(" ");
    return nameParts
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleConnectGoogleCalendar = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login before connect google calendar!");
      return;
    }

    // Close dropdown and calendar modal before redirecting
    setDropdownOpen(false);
    setShowCalendarModal(false);

    window.location.href = `http://localhost:3000/api/v1/google-calendar?token=${token}`;
  };

  const openCalendarModal = () => {
    setShowCalendarModal(true);
    setDropdownOpen(false); // Close dropdown when opening modal
  };

  const closeCalendarModal = () => {
    setShowCalendarModal(false);
  };

  const openUserProfile = () => {
    setIsShow(true);
    setDropdownOpen(false); // Close dropdown when opening modal
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
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.fullName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              ref={dropdownRef}
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.fullName}
                    </span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openUserProfile();
                  }}
                >
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openCalendarModal();
                  }}
                >
                  <Calendar />
                  Connect Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logout();
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

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
          className="h-[95%] overflow-hidden"
          onEscapeKeyDown={closeUserProfile}
          onInteractOutside={(e) => {
            e.preventDefault();
            closeUserProfile();
          }}
        >
          <div className="overflow-y-auto">
            <UserProfile />
          </div>
        </DialogContent>
      </Dialog>

      <GoogleCalendarConnectModal
        isOpen={showCalendarModal}
        onClose={closeCalendarModal}
        onConnect={handleConnectGoogleCalendar}
        currentEmail={user?.email}
      />
    </>
  );
}
