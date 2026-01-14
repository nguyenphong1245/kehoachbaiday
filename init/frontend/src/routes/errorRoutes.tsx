import type { RouteObject } from "react-router-dom";

import NotFoundPage from "@/pages/error/NotFoundPage";

export const errorRoutes: RouteObject[] = [
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export default errorRoutes;
