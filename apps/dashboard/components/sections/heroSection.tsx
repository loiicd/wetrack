import { userInterface } from "@/lib/clerk/user";

type Props = {
  userId: string;
};

const HeroSection = async ({ userId }: Props) => {
  const user = await userInterface.get(userId);

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome back, {user.firstName}</h1>
    </div>
  );
};

export default HeroSection;
