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
          <DialogTitle>Benutzer einladen</DialogTitle>
          <DialogDescription>
            Lade ein Teammitglied per E-Mail in deine Organisation ein.
          </DialogDescription>
        </DialogHeader>
        <InviteUserForm />
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;
