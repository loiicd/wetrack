import { membership } from "@/lib/clerk/membership";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { auth } from "@clerk/nextjs/server";

const OrganizationSwitch = async () => {
  const { userId, orgId } = await auth();
  if (!userId) return null;

  const memberships = await membership.get(userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {memberships.map((membership) => (
          <DropdownMenuItem key={membership.id}>
            {membership.organization.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSwitch;
