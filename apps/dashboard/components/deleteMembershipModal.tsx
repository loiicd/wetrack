"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { deleteMembership } from "@/actions/membership/delete";
import { toast } from "sonner";
import { Button } from "./ui/button";

type Props = {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DeleteMembershipDialog = ({ userId, open, onOpenChange }: Props) => {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await deleteMembership(userId);
    if (!result.success) {
      toast.error(`Failed to remove user: ${result.error}`);
    } else {
      toast.success("User removed successfully");
    }
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove the user
            from the organization.
          </DialogDescription>
        </DialogHeader>
        <Button variant="destructive" onClick={handleDelete}>
          Yes, delete this user
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMembershipDialog;
