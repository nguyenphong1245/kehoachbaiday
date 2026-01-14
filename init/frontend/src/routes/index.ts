import type { RouteObject } from "react-router-dom";

import { errorRoutes } from "@/routes/errorRoutes";
import { protectedRoutes } from "@/routes/protectedRoutes";
import { publicRoutes } from "@/routes/publicRoutes";

export const appRoutes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  ...errorRoutes,
];

export { publicRoutes, protectedRoutes, errorRoutes };
export { appRoutes as authRoutes };
