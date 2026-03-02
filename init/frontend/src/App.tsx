import { useRoutes } from "react-router-dom";

import { appRoutes } from "@/routes/index";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const App = () => {
  const element = useRoutes(appRoutes);
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
        {element}
      </div>
    </ErrorBoundary>
  );
};

export default App;
