import { History, XCircle } from "lucide-react";
import Link from "next/link";
import OrderListClient from "@/components/dashboard/OrderListClient";

export default function ManageOrdersPage() {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card border-b border-border ">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black text-foreground tracking-tight">
                إدارة <span className="text-primary">الطلبات</span>
              </h1>
              <span className="h-4 w-px bg-border hidden md:block" />
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider hidden md:block">
                الخدمات اللوجستية والتنفيذ
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={
                  `/manageOrder/shipped/${new Date().toISOString().slice(0, 7)}` as any
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded text-sm font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
              >
                <History size={16} />
                <span className="hidden md:inline">السجلات</span>
              </Link>
              <Link
                href={`/manageOrder/cancelled` as any}
                className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive rounded text-sm font-black uppercase tracking-widest hover:bg-destructive/20 transition-all border border-destructive/20"
              >
                <XCircle size={16} />
                <span className="hidden md:inline">الملغية</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-2 py-8">
        <OrderListClient firebaseConfig={firebaseConfig} />
      </div>
    </div>
  );
}
