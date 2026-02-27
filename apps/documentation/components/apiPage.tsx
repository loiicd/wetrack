import { openapi } from "@/lib/openapi";
import { createAPIPage } from "fumadocs-openapi/ui";

import client from "./apiPage.client";

export const APIPage = createAPIPage(openapi, {
  client,
});
