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
                    setDropdownOpen(false);
                    setShowGoogleCalendar(true);
                  }}
                >
                  <Calendar />
                  <span>Google Calendar</span>
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

      {/* Google Calendar Dialog */}
      <GoogleCalendarDialog
        isOpen={showGoogleCalendar}
        onOpenChange={setShowGoogleCalendar}
      />
    </>
  );
}
