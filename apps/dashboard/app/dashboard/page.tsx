"use cache";

import { cacheLife } from "next/cache";

const Page = async () => {
  cacheLife("weeks");

  return <div></div>;
};

export default Page;
