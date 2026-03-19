import UserDropdownClient from "./userDropdownClient";
import { userInterface } from "@/lib/clerk/user";
import { testAuth } from "@/lib/auth/testAuth";

const UserDropdown = async () => {
  const { userId } = await testAuth();
  const user = await userInterface.get(userId);

  return (
    <UserDropdownClient
      fullname={`${user.firstName} ${user.lastName}`}
      imageUrl={user.imageUrl}
    />
  );
};

export default UserDropdown;
