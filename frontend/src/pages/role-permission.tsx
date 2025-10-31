import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import type {
  PermissionType,
  PermissionFormType,
} from "@/components/schemas/permission.schema";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import { Input } from "@/components/ui/input";
import { handleAxiosError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import RoleModal from "@/components/modals/role.modal";
import { useLoading } from "@/components/contexts/loading.context";
import PermissionModal from "@/components/modals/permission.modal";
import { useCombineFormManager } from "@/hooks/use-custom-manager";
import { RequirePermission } from "@/components/commons/require-permission";
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import type { RoleFormType, RoleType } from "@/components/schemas/role.schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Role = () => {
  const { setLoading } = useLoading();
  const { fetchPermissions } = useAuth();
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [tab, setTab] = useState<"roles" | "permissions">("roles");
  const [permissions, setPermissions] = useState<PermissionType[]>([]); // Valid permisison
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [expandedResources, setExpandedResources] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(
    new Set()
  );

  const {
    formManager: roleFormManager,
    setFormManager: setRoleFormManager,
    onAdd: onAddRole,
    onEdit: onEditRole,
    onClose: onCloseRole,
  } = useCombineFormManager<RoleType>();
  const {
    formManager: permissionFormManager,
    setFormManager: setPermissionFormManager,
    onAdd: onAddPermission,
    onEdit: onEditPermission,
    onClose: onClosePermission,
  } = useCombineFormManager<PermissionType>();

  const usePermissionMap = (permissions: PermissionType[]) => {
    return useMemo(() => {
      const map = new Map<string, number>();
      for (const p of permissions) {
        map.set(`${p.resource}:${p.action}`, p.id);
      }
      return map;
    }, [permissions]);
  };

  // Valid permisison map
  const permissionMap = usePermissionMap(permissions);

  // ------------------------ FETCH DATA ------------------------
  const fetchData = async () => {
    try {
      let response = await api.get("/authorization/roles");
      setRoles(response.data);

      response = await api.get("/authorization/permissions");
      setPermissions(response.data);

      response = await api.get("/authorization/permissions/meta");
      setActions(response.data.actions);
      setResources(response.data.resources);
    } catch (error) {
      console.log(error);
      handleAxiosError(error);
    }
  };

  const onSelectRole = async (role: RoleType) => {
    try {
      setSelectedRole(role);
      const response = await api.get(
        `/authorization/roles/${role.id}/permissions`
      );
      const updatedRolePermission = new Set<number>(
        response.data.permissions.map((rp: PermissionType) => rp.id)
      );

      setRolePermissions(updatedRolePermission);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  // ------------------------ HANDLE ------------------------
  const groupPermissionsByResource = (permissions: PermissionType[]) => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, PermissionType[]>);
  };

  const toggleResource = (resource: string) => {
    setExpandedResources((prev) =>
      prev.includes(resource)
        ? prev.filter((r) => r !== resource)
        : [...prev, resource]
    );
  };

  const handleSubmitRole = async (formData: RoleFormType) => {
    try {
      setLoading(true);
      if (roleFormManager.type === "add") {
        await api.post("/authorization/roles", formData);
        toast.success("Add role success!");
      } else if (roleFormManager.type === "edit" && roleFormManager.data?.id) {
        await api.patch(
          `/authorization/roles/${roleFormManager.data.id}`,
          formData
        );
        toast.success("Edit role success!");
      }

      fetchData();
      setRoleFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPermission = async (formData: PermissionFormType) => {
    try {
      setLoading(true);
      if (permissionFormManager.type === "add") {
        await api.post("/authorization/permissions", formData);
        toast.success("Add permission success!");
      } else if (
        permissionFormManager.type === "edit" &&
        permissionFormManager.data?.id
      ) {
        await api.patch(
          `/authorization/permissions/${permissionFormManager.data.id}`,
          formData
        );
        toast.success("Edit permission success!");
      }

      fetchData();
      setPermissionFormManager({
        isShow: false,
        type: "add",
        data: null,
      });
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.delete(`/authorization/${tab}/${id}`);
      console.log(response);
      toast.success(
        `${tab.charAt(0).toUpperCase() + tab.slice(1)} is deleted!`
      );
      fetchData();
    } catch (error) {
      console.log(error);
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if permission is valid in system
  const validPermission = (resource: string, action: string) => {
    return permissionMap.get(`${resource}:${action}`);
  };

  // Check role has permission or not
  const hasPermission = (resource: string, action: string): boolean => {
    if (!selectedRole) return false;

    const permissionId = permissionMap.get(`${resource}:${action}`);
    if (!permissionId) return false;

    return rolePermissions.has(permissionId);
  };

  const handleToggle = (resource: string, action: string) => {
    const id = permissionMap.get(`${resource}:${action}`);
    if (!id) return;

    setRolePermissions((prev) => {
      const newSet: Set<number> = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);

      return newSet;
    });
  };

  const handleCheckAllPermissionByResource = (resource: string) => {
    const newSet: Set<number> = new Set(rolePermissions);

    permissions.forEach((p) => {
      if (p.resource !== resource) return;
      const id = permissionMap.get(`${resource}:${p.action}`);
      if (!id) return;
      newSet.add(id);
    });

    setRolePermissions(newSet);
  };

  const handleRemoveAllPermissionByResource = (resource: string) => {
    const newSet: Set<number> = new Set(rolePermissions);

    permissions.forEach((p) => {
      if (p.resource !== resource) return;
      const id = permissionMap.get(`${resource}:${p.action}`);
      if (!id) return;
      newSet.delete(id);
    });

    setRolePermissions(newSet);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchPermissions(["authorization"]);
        await fetchData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleSaveRolePermission = async () => {
    try {
      setLoading(true);
      await api.patch(`/authorization/roles/${selectedRole?.id}/permissions`, {
        permissionIds: Array.from(rolePermissions),
      });

      onSelectRole(selectedRole!);
      toast.success("Update permission for role success!");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequirePermission permission="authorization:read">
      <div className="container mx-auto py-4 md:py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Role List Section */}
          <div className="lg:col-span-4 bg-white rounded-lg shadow">
            <Tabs value={tab} className="w-full">
              <div className="p-3 md:p-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger
                      value="roles"
                      onClick={() => setTab("roles")}
                      className="flex-1 sm:flex-none"
                    >
                      Roles
                    </TabsTrigger>
                    <TabsTrigger
                      value="permissions"
                      onClick={() => setTab("permissions")}
                      className="flex-1 sm:flex-none"
                    >
                      Permissions
                    </TabsTrigger>
                  </TabsList>
                  <RequirePermission
                    permission="authorization:create"
                    mode="disable"
                  >
                    <Button
                      size="sm"
                      onClick={tab === "roles" ? onAddRole : onAddPermission}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New{" "}
                      {tab[0].toUpperCase() + tab.slice(1, -1).toLowerCase()}
                    </Button>
                  </RequirePermission>
                </div>
              </div>

              {/* Role Tabs Content */}
              <TabsContent value="roles" className="p-3 md:p-4 space-y-2">
                {roles?.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => onSelectRole(role)}
                    className={`p-3 md:p-4 rounded-lg cursor-pointer transition-all ${
                      selectedRole?.id === role.id
                        ? "bg-blue-50 border-blue-500 border-2"
                        : "hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg capitalize truncate">
                          {role.name}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {role.description}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRole(role);
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(role.id);
                          }}
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Permission Tabs Content */}
              <TabsContent value="permissions" className="p-3 md:p-4 space-y-2">
                {Object.entries(groupPermissionsByResource(permissions)).map(
                  ([resource, resourcePermissions]) => (
                    <div key={resource}>
                      <div
                        onClick={() => toggleResource(resource)}
                        className="p-3 md:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {expandedResources.includes(resource) ? (
                              <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            )}
                            <h3 className="font-medium capitalize truncate">
                              {resource}
                            </h3>
                          </div>
                          <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                            {resourcePermissions.length} permissions
                          </span>
                        </div>
                      </div>

                      {expandedResources.includes(resource) && (
                        <div className="ml-2 md:ml-4 mt-2 space-y-2">
                          {resourcePermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="p-2.5 md:p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span className="capitalize text-sm flex-1 min-w-0 truncate">
                                  {permission.action}
                                </span>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditPermission(permission);
                                    }}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(permission.id);
                                    }}
                                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Permissions Matrix Section */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow">
            <div className="p-3 md:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold truncate">
                {selectedRole
                  ? `Permissions - ${selectedRole.name}`
                  : "Permissions"}
              </h2>
              {selectedRole && (
                <RequirePermission permission="authorization:update">
                  <Button
                    onClick={handleSaveRolePermission}
                    className="w-full sm:w-auto"
                  >
                    Save Changes
                  </Button>
                </RequirePermission>
              )}
            </div>

            {selectedRole ? (
              <div className="p-3 md:p-4">
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-4">
                  {resources?.map((resource) => (
                    <div
                      key={resource}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="font-semibold capitalize">
                          {resource.charAt(0).toUpperCase() + resource.slice(1)}
                        </h3>
                        {selectedRole.name.toLowerCase() !== "superadmin" && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleCheckAllPermissionByResource(resource)
                              }
                              className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
                              title="Grant all permissions"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveAllPermissionByResource(resource)
                              }
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Revoke all permissions"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {actions?.map((action) => {
                          if (
                            selectedRole.name.toLowerCase() === "superadmin" ||
                            !validPermission(resource, action)
                          )
                            return null;

                          return (
                            <label
                              key={`${resource}:${action}`}
                              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <div className="flex justify-center">
                                <Input
                                  disabled={
                                    selectedRole.name.toLowerCase() ===
                                      "superadmin" ||
                                    !validPermission(resource, action)
                                  }
                                  type="checkbox"
                                  checked={hasPermission(resource, action)}
                                  onChange={() =>
                                    handleToggle(resource, action)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                                />
                              </div>
                              <span className="text-sm capitalize">
                                {action}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Resource</TableHead>
                        {actions?.map((action) => (
                          <TableHead key={action} className="text-center">
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </TableHead>
                        ))}
                        {selectedRole.name.toLowerCase() !== "superadmin" && (
                          <TableHead className="text-center">Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {resources?.map((resource) => (
                        <TableRow key={resource}>
                          <TableCell className="font-medium">
                            {resource.charAt(0).toUpperCase() +
                              resource.slice(1)}
                          </TableCell>
                          {actions?.map((action) => (
                            <TableCell
                              key={`${resource}:${action}`}
                              className="text-center"
                            >
                              <div className="flex justify-center">
                                <Input
                                  disabled={
                                    selectedRole.name.toLowerCase() ===
                                      "superadmin" ||
                                    !validPermission(resource, action)
                                  }
                                  type="checkbox"
                                  checked={hasPermission(resource, action)}
                                  onChange={() =>
                                    handleToggle(resource, action)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                                />
                              </div>
                            </TableCell>
                          ))}

                          {selectedRole.name.toLowerCase() !== "superadmin" && (
                            <TableCell>
                              <div className="flex gap-1 justify-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleCheckAllPermissionByResource(resource)
                                  }
                                  className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
                                  title="Grant all permissions"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleRemoveAllPermissionByResource(
                                      resource
                                    )
                                  }
                                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
                                  title="Revoke all permissions"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm md:text-base">
                  Select a role to manage permissions
                </p>
              </div>
            )}
          </div>
        </div>

        <RoleModal
          formManager={roleFormManager}
          handleSubmit={handleSubmitRole}
          onClose={onCloseRole}
        ></RoleModal>

        <PermissionModal
          formManager={permissionFormManager}
          handleSubmit={handleSubmitPermission}
          onClose={onClosePermission}
        ></PermissionModal>
      </div>
    </RequirePermission>
  );
};

export default Role;
