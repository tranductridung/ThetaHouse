import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import UserProfileForm from "./forms/user-profile.form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  MapPin,
  Shield,
  Edit,
  X,
  Key,
  Calendar,
  User,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { Button } from "./ui/button";
import type {
  changePwdFormType,
  EditUserFormType,
  UserType,
} from "./schemas/user.schema";
import ChangePasswordForm from "./forms/change-password.form";

const UserProfile = () => {
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profileData, setProfileData] = useState<UserType | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`users/me/profile`);
      setProfileData(response.data.user);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
  };

  const handleCancelEdit = () => {
    fetchData();
    setIsEditing(false);
  };

  const onSubmitEdit = async (formData: EditUserFormType) => {
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

  const onSubmitChangePwd = async (formData: changePwdFormType) => {
    setLoading(true);
    try {
      await api.patch(`/users/me/password`, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Update password successfully!");
      setIsChangingPassword(false);
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
        return "bg-red-100 text-red-800 border-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "employee":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Loading Profile</p>
            <p className="text-sm text-gray-500">
              Please wait while we fetch your information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Profile Not Found
            </p>
            <p className="text-sm text-gray-500">
              Unable to load your profile information
            </p>
          </div>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3 px-8 max-w-none overflow-y-auto">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-4">
          <div>
            {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"> */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Profile
            </h1>
            <p className="text-gray-600 mt-1 text-base">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Card */}
        <div className="w-full max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 overflow-hidden w-full">
            {/* Decorative top border */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <CardHeader className="text-center pb-4 pt-6">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <Avatar className="h-28 w-28 ring-4 ring-blue-100 shadow-xl transition-all duration-300 group-hover:ring-blue-200 group-hover:scale-105">
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {getInitials(profileData.fullName || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                {profileData.fullName}
              </CardTitle>
              <CardDescription className="text-gray-600 mb-3 flex items-center justify-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                {profileData.email}
              </CardDescription>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge
                  className={`${getRoleColor(
                    profileData.role
                  )} border-2 px-3 py-1 text-xs font-medium shadow-sm`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {profileData.role}
                </Badge>
                <Badge
                  className={`${getStatusColor(
                    profileData.status
                  )} border-2 px-3 py-1 text-xs font-medium shadow-sm`}
                >
                  {profileData.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 px-4">
              <div className="space-y-2">
                <div className="flex items-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3 flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                      Phone Number
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {profileData.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>

                {profileData.address && (
                  <div className="flex items-start p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-2 bg-green-100 rounded-lg mr-3 mt-0.5 flex-shrink-0">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        Address
                      </p>
                      <p className="text-sm font-semibold text-gray-900 break-words">
                        {profileData.address}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3 flex-shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                      Gender
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profileData.sex || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3 flex-shrink-0">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                      Date of Birth
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(profileData.dob)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-4 px-4 pb-4">
              <Button
                onClick={handleEdit}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-2.5 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Edit className="w-4 h-4 mr-2" />
                )}
                Edit Profile
              </Button>

              <Button
                onClick={handleChangePassword}
                variant="outline"
                className="w-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-semibold py-2.5 transition-all duration-200"
                disabled={loading}
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Profile Form */}
        {isEditing && (
          <div className="w-full max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50">
              <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Edit className="w-5 h-5 text-blue-600" />
                      Edit Profile Information
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      Update your personal information and contact details
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleCancelEdit}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100 rounded-full p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <UserProfileForm
                  onSubmit={onSubmitEdit}
                  userData={profileData}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {isChangingPassword && (
          <div className="w-full max-w-2xl mx-auto">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Key className="w-5 h-5 text-purple-600" />
                      Change Password
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      Update your password to keep your account secure
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setIsChangingPassword(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100 rounded-full p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ChangePasswordForm onSubmit={onSubmitChangePwd} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State when not editing */}
        {!isEditing && (
          <div className="w-full max-w-2xl mx-auto">
            <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/50 to-blue-50/30 hover:border-gray-300 transition-colors duration-200">
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Edit className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Edit Your Profile
                    </h3>
                    <p className="text-gray-500 max-w-md leading-relaxed">
                      Click the "Edit Profile" button to update your personal
                      information, contact details, and preferences. Keep your
                      profile up to date!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State when not changing*/}
        {!isChangingPassword && (
          <div className="w-full max-w-2xl mx-auto">
            <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/50 to-blue-50/30 hover:border-gray-300 transition-colors duration-200">
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Edit className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Change Your Password
                    </h3>
                    <p className="text-gray-500 max-w-md leading-relaxed">
                      Click the "Change Password" button to change your
                      password!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
