"use client";

import { EllipsisVerticalIcon, TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { deleteMembership } from "@/actions/membership/delete";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
};

const UserEditDropdown = ({ userId }: Props) => {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await deleteMembership(userId);
    if (!result.success) {
      toast.error(`Failed to remove user: ${result.error}`);
    } else {
      toast.success("User removed successfully");
    }
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <EllipsisVerticalIcon />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleDelete}>
            <TrashIcon />
            <span>Remove</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserEditDropdown;
