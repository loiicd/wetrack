import { Badge } from "@/components/ui/badge";

type Props = {
  status: string;
};

const InvitationStatusBadge = ({ status }: Props) => {
  const statusColors: Record<string, { background: string; text: string }> = {
    pending: { background: "bg-yellow-500", text: "text-yellow-700" },
    accepted: { background: "bg-green-500", text: "text-green-700" },
    expired: { background: "bg-red-500", text: "text-red-700" },
    revoked: { background: "bg-gray-500", text: "text-gray-700" },
  };

  const label = status.replaceAll("_", " ").toUpperCase();

  return (
    <Badge
      variant="default"
      className={`${statusColors[status].background} ${statusColors[status].text}`}
    >
      {label}
    </Badge>
  );
};

export default InvitationStatusBadge;
