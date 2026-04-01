import { UserProfile } from "@clerk/nextjs";
import Container from "@/components/layout/container";

export default async function SecurityPage() {
  return (
    <Container>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sicherheit</h1>
          <p className="text-muted-foreground mt-1">
            Verwalte dein Passwort, Multi-Faktor-Authentifizierung und aktive Sitzungen.
          </p>
        </div>
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none border rounded-xl",
            },
          }}
        />
      </div>
    </Container>
  );
}
