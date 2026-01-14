import { useRoutes } from "react-router-dom";

import { appRoutes } from "@/routes/index";

const App = () => {
  const element = useRoutes(appRoutes);
  return <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">{element}</div>;
};

export default App;
