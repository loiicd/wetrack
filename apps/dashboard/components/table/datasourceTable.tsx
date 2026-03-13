import { dataSourceInterface } from "@/lib/database/dataSource";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TestDataSourceButton from "../testDataSourceButton";

const DatasourceTable = async () => {
  const dataSources = await dataSourceInterface.getMany();

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
      </TableBody>
    </Table>
  );
};

export default DatasourceTable;
