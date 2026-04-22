import { Sidebar } from "./Sidebar";
import { DriveConnectButton } from "../shared/DriveConnectButton";
import { useAuth } from "../../hooks/useAuth";

export function AppShell({ children }) {
  const { user } = useAuth();

  return (
    <div className="h-screen flex">
      <aside className="w-sidebar shrink-0 bg-ink text-cream">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-cream border-b border-ice px-6 py-3 flex items-center justify-between">
          <span className="font-body text-sm text-navy">
            Welkom, {user?.email}
          </span>
          <DriveConnectButton />
        </header>

        <section className="flex-1 overflow-auto bg-cream text-navy">
          {children}
        </section>
      </main>
    </div>
  );
}
