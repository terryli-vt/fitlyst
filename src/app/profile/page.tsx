import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { User, Mail, ArrowLeft } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { name, email, image } = session.user;

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 text-sm font-medium mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center mb-8">
            {image ? (
              <Image
                src={image}
                alt={name ?? "User avatar"}
                width={96}
                height={96}
                className="rounded-full ring-4 ring-teal-100 mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-teal-600" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{name ?? "User"}</h1>
          </div>

          {/* Info Fields */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <User className="h-5 w-5 text-teal-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Full Name
                </p>
                <p className="text-gray-800 font-medium">{name ?? "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Mail className="h-5 w-5 text-teal-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Email
                </p>
                <p className="text-gray-800 font-medium">{email ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
