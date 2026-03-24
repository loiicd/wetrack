import SettingsNavigation from "@/components/layout/settingsNavigation";
import Container from "@/components/layout/container";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <Container>
      <section className="container mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row">
          <SettingsNavigation />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </section>
    </Container>
  );
};

export default Layout;
