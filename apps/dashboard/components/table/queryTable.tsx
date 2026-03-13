import { queryInterface } from "@/lib/database/query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TestQueryButton from "../testQueryButton";
import EmptyTableRow from "../emptyTableRow";
import { FrownIcon } from "lucide-react";

const QueryTable = async () => {
  const queries = await queryInterface.getMany();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Data Source</TableHead>
          <TableHead>JSONPath</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Test</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {queries.map((query) => (
          <TableRow key={query.id}>
            <TableCell>{query.key}</TableCell>
            <TableCell>{query.dataSourceId}</TableCell>
            <TableCell>{query.jsonPath}</TableCell>
            <TableCell>{query.createdAt.toLocaleDateString("de-DE")}</TableCell>
            <TableCell>
              <TestQueryButton id={query.id} />
            </TableCell>
          </TableRow>
        ))}
        {queries.length === 0 && (
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

export default QueryTable;
