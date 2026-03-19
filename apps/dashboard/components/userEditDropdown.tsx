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
import DeleteMembershipDialog from "./deleteMembershipModal";
import { useState } from "react";

type Props = {
  userId: string;
};

const UserEditDropdown = ({ userId }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
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
            <DropdownMenuItem
              closeOnClick={false}
              onClick={() => setDialogOpen(true)}
            >
              <TrashIcon />
              <span>Remove</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteMembershipDialog
        userId={userId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default UserEditDropdown;
