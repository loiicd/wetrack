"use client";

import {
  ChevronDownIcon,
  LogOutIcon,
  Settings2Icon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";

type Props = {
  fullname: string;
  imageUrl: string;
};

const UserDropdownClient = ({ fullname, imageUrl }: Props) => {
  const { signOut } = useClerk();

  const initials = fullname
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="lg">
            <Avatar>
              <AvatarImage src={imageUrl} alt="User Avatar" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span>{fullname}</span>
            <ChevronDownIcon className="ml-auto" />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings2Icon />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOutIcon />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownClient;
