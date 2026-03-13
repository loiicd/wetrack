import { ReactNode } from "react";
import { TableCell, TableRow } from "./ui/table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

type Props = {
  colSpan: number;
  icon: ReactNode;
  title: string;
  description: string;
};

const EmptyTableRow = ({ colSpan, icon, title, description }: Props) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">{icon}</EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </TableCell>
    </TableRow>
  );
};

export default EmptyTableRow;
