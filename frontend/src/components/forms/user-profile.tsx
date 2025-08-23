import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, X, Phone, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import type { User as UserType } from "@/types/user";
import { handleAxiosError } from "@/lib/utils";
import UserProfileForm from "./user-profile.form";

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState<UserType | null>(null);

  const fetchData = async () => {
    try {
      const response = await api.get(`users/me`);

      setProfileData(response.data.user);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    fetchData();
    setIsEditing(false);
  };

  const handleSave = async (formData: Partial<UserType>) => {
    setLoading(true);
    try {
      const updateData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        sex: formData.sex,
        dob: formData.dob,
      };
      await api.put(`/users/me`, updateData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await refreshUser();
      await fetchData();
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "";
    const nameParts = fullName.split(" ");
    return nameParts
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return "N/A";
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Chỉ dùng profileData để hiển thị chi tiết, không dùng user từ context
  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profileData.avatar || undefined}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {getInitials(profileData.fullName || "")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{profileData.fullName}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {profileData.email}
              </CardDescription>
              <div className="mt-3">
                <Badge className={getRoleColor(profileData.role)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {profileData.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {profileData.phoneNumber && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{profileData.phoneNumber}</span>
                  </div>
                )}
                {profileData.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{profileData.address}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2">Sex:</span>
                  <span>{profileData.sex}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2">Date of Birth:</span>
                  <span>{formatDate(profileData.dob)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2">Status:</span>
                  <span>{profileData.status || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form or Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing && profileData ? (
                <UserProfileForm
                  type="edit"
                  userData={profileData}
                  onSubmit={handleSave}
                />
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label>Full Name</Label>
                    <div className="mt-1">{profileData?.fullName}</div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="mt-1">{profileData?.email}</div>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <div className="mt-1">{profileData?.phoneNumber}</div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <div className="mt-1">{profileData?.address}</div>
                  </div>
                  <div>
                    <Label>Sex</Label>
                    <div className="mt-1">{profileData?.sex}</div>
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <div className="mt-1">{formatDate(profileData?.dob)}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{profileData?.status}</div>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <div className="mt-1">{profileData?.role}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
