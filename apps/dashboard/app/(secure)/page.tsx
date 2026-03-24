import { Suspense } from "react";
import ClockCard from "@/components/charts/clockCard";
import Container from "@/components/layout/container";

const Page = async () => {
  return (
    <Container>
      <p>Willkommen zurück, Max Mustermann!</p>
      <div className="grid grid-cols-4 gap-4">
        <Suspense>
          <ClockCard timeZone="Europe/Berlin" labelFormat="full" />
        </Suspense>
        <Suspense>
          <ClockCard timeZone="America/Araguaina" labelFormat="city" />
        </Suspense>
      </div>
    </Container>
  );
};

export default Page;
