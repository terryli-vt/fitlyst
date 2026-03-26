import Image from "next/image";
import { User, Mail } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import type { UserInfo } from "../types";

export default function ProfileHeader({ user }: { user: UserInfo }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-5 flex-1 min-w-0">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Avatar"}
            width={80}
            height={80}
            className="rounded-full ring-4 ring-teal-100 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <User className="h-9 w-9 text-teal-600" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {user.name ?? "User"}
          </h1>
          <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm">
            <Mail className="h-4 w-4 shrink-0" />
            {user.email ?? "—"}
          </p>
        </div>
      </div>
      <div className="shrink-0 self-end sm:self-auto w-full sm:w-auto">
        <SignOutButton />
      </div>
    </div>
  );
}
