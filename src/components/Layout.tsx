import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "./shared";

export function Layout() {
  return (
    <div className="flex print:block h-screen print:h-auto w-screen print:w-auto overflow-hidden print:overflow-visible bg-slate-50 dark:bg-slate-950 print:bg-white transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 print:flex-none overflow-y-auto print:overflow-visible">
        <div className="p-6 print:p-0 max-w-[1600px] print:max-w-none mx-auto print:mx-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
