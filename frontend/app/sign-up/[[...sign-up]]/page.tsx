import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F0EB] px-6 py-12">
      <SignUp forceRedirectUrl="/dashboard" />
    </main>
  );
}