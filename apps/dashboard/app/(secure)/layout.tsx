import { ApplicationShell11 } from "@/components/application-shell11";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return <ApplicationShell11>{children}</ApplicationShell11>;
};

export default Layout;
