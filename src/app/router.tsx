// FILE: src/app/router.tsx

import { useRoutes } from "react-router-dom";
import { publicRoutes } from "./routes/publicRoutes";
import { appRoutes } from "./routes/appRoutes";

export default function AppRouter() {
  return useRoutes([...publicRoutes, ...appRoutes]);
}
