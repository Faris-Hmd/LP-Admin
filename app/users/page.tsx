import { getUsers } from "@/services/userServices";
import UsersTable from "@/components/users/UsersTable";
import { Users, ShieldCheck } from "lucide-react";

export const revalidate = 0; // Ensure fresh data on every request

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                بوابة الإدارة
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">
                إدارة <span className="text-primary">المستخدمين</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <UsersTable users={users} />
      </main>
    </div>
  );
}
