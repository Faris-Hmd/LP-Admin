"use client";

import { UserData } from "@/types/userTypes";
import { Users, Search, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function UsersTable({ users }: { users: UserData[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      (user.name || "").toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.shippingInfo?.phone || "").includes(search)
    );
  });

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground uppercase tracking-tight">
              قائمة المستخدمين
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              إدارة حسابات العملاء المسجلين
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-background border border-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all h-9"
          />
        </div>
      </div>

      {/* List View */}
      <div className="flex flex-col gap-3 p-3 bg-muted/5">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.email}
              className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-background border border-border rounded-xl shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
            >
              {/* User Info Column */}
              <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                  <Image
                    src={user.image || "/placeholder-user.jpg"}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">
                    {user.name || "مستخدم غير معرف"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Contact Info Column */}
              <div className="flex flex-col gap-1 sm:w-1/4">
                {user.shippingInfo?.phone ? (
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                    <Phone size={12} className="text-primary opacity-70" />
                    <span dir="ltr">{user.shippingInfo.phone}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground opacity-50 flex items-center gap-1.5">
                    <Phone size={10} /> -
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                  <Mail size={10} />
                  <span className="truncate max-w-[150px]">{user.email}</span>
                </div>
              </div>

              {/* Address Column */}
              <div className="flex flex-col gap-1 sm:w-1/4">
                {user.shippingInfo?.city || user.shippingInfo?.address ? (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                      <MapPin size={12} className="text-primary opacity-70" />
                      <span>{user.shippingInfo.city || "غير محدد"}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {user.shippingInfo.address}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground opacity-50 flex items-center gap-1.5">
                    <MapPin size={10} /> لم يحدد عنوان
                  </span>
                )}
              </div>

              {/* Status/Date Column (Right-aligned / End) */}
              <div className="sm:ml-auto flex items-center justify-end sm:w-auto mt-2 sm:mt-0">
                <span className="px-2 py-1 rounded bg-muted/50 text-[10px] font-bold text-muted-foreground/60 border border-border/50">
                  نشط
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Users size={32} className="opacity-20" />
              <p className="text-xs font-bold uppercase tracking-wider opacity-50">
                لا يوجد مستخدمين مطابقين
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-muted/10 p-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground">
          العدد الكلي: {users.length}
        </span>
      </div>
    </div>
  );
}
