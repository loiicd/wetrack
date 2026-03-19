"use client";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { SidebarMenuButton } from "./ui/sidebar";
import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

type Organization = {
  id: string;
  name: string;
  imageUrl: string;
};

type Props = {
  organizations: Organization[];
  activeOrganization: Organization;
};

const OrganizationSwitchDropdown = ({
  organizations,
  activeOrganization,
}: Props) => {
  const { setActive } = useOrganizationList();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [displayed, setOptimisticOrg] = useOptimistic(activeOrganization);

  if (!setActive) {
    return null;
  }

  const handleSwitchOrganization = (org: Organization) => {
    startTransition(async () => {
      setOptimisticOrg(org);
      await setActive({ organization: org.id });
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            variant="default"
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Image
                src={displayed.imageUrl}
                alt={displayed.name}
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayed.name}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </SidebarMenuButton>
        }
        className="w-full"
      ></DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              className="flex items-center gap-2 p-2"
              onClick={() => handleSwitchOrganization(org)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <Image
                  src={org.imageUrl}
                  alt={org.name}
                  width={24}
                  height={24}
                  className="rounded-md"
                />
              </div>
              <span>{org.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 p-2">
            <PlusIcon />
            Create organization
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSwitchDropdown;
