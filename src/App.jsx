import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import AIResumeOptimizer from "./pages/AIResumeOptimizer.jsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <Routes>
        {navItems.map(({ to, page }) => (
          <Route key={to} path={to} element={page} />
        ))}
        <Route path="/ai-resume" element={<AIResumeOptimizer />} />
      </Routes>
    </HashRouter>
  </QueryClientProvider>
);

export default App;
