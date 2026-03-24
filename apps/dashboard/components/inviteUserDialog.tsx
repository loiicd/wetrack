"use client";

import { UserRoundPlusIcon } from "lucide-react";
import InviteUserForm from "./inviteUserForm";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const InviteUserDialog = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button>
            <UserRoundPlusIcon />
            <span>Invite User</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove the user
            from the organization.
          </DialogDescription>
        </DialogHeader>
        <InviteUserForm />
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;
