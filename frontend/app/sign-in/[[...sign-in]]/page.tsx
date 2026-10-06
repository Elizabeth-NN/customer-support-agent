import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F0EB] px-6 py-12">
      <SignIn forceRedirectUrl="/dashboard" />
    </main>
  );
}