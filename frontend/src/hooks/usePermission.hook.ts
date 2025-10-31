import { useAuth } from "@/auth/useAuth";

export function usePermission(permission: string) {
  const { user } = useAuth();

  if (!permission || permission == "") return true;

  return user?.permissions?.includes(permission) ?? false;
}
