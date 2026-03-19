"use client";

import { updateRole } from "@/actions/membership/updateRole";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

type Props = {
  userId: string;
  activeRole: string;
  isLastAdmin?: boolean;
};

const RoleSelect = ({ userId, activeRole, isLastAdmin = false }: Props) => {
  const router = useRouter();
  const [optimisticRole, setOptimisticRole] = useOptimistic(activeRole);
  const [, startTransition] = useTransition();

  const roles = [
    { value: "org:admin", label: "Admin" },
    { value: "org:member", label: "Member" },
  ];

  const handleRoleChange = (newRole: string) => {
    startTransition(async () => {
      setOptimisticRole(newRole);
      const result = await updateRole(userId, newRole);
      if (!result.success) {
        toast.error(`Failed to update role: ${result.error}`);
        return;
      } else {
        toast.success("Role updated successfully");
      }
      router.refresh();
    });
  };

  return (
    <Select
      items={roles}
      value={optimisticRole}
      onValueChange={(value) => value && handleRoleChange(value)}
      disabled={isLastAdmin}
    >
      <SelectTrigger
        className="w-45"
        title={isLastAdmin ? "Cannot downgrade the last admin" : undefined}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default RoleSelect;
