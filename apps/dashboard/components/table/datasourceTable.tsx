import { dataSourceInterface } from "@/lib/database/dataSource";
import { auth } from "@clerk/nextjs/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TestDataSourceButton from "../testDataSourceButton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { FrownIcon } from "lucide-react";
import EmptyTableRow from "../emptyTableRow";
import { connection } from "next/server";

const DatasourceTable = async () => {
  await connection();
  const { orgId } = await auth();
  const dataSources = await dataSourceInterface.getMany(orgId ?? undefined);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Stack</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataSources.map((dataSource) => (
          <TableRow key={dataSource.id}>
            <TableCell>{dataSource.key}</TableCell>
            <TableCell>{dataSource.type}</TableCell>
            <TableCell>{dataSource.stackId}</TableCell>
            <TableCell>
              {dataSource.createdAt.toLocaleDateString("de-DE")}
            </TableCell>
            <TableCell>
              <TestDataSourceButton id={dataSource.id} />
            </TableCell>
          </TableRow>
        ))}
        {dataSources.length === 0 && (
          <EmptyTableRow
            colSpan={5}
            icon={<FrownIcon />}
            title="No data"
            description="No data found"
          />
        )}
      </TableBody>
    </Table>
  );
};

export default DatasourceTable;
