import { useUser } from "@clerk/nextjs";

const HeroSection = () => {
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Willkommen zurück, {isLoaded && isSignedIn ? user.firstName : "User"}!
      </h1>
    </div>
  );
};

export default HeroSection;
