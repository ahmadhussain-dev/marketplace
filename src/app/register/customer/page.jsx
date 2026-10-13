
import Link from "next/link";
import RegisterForm from "@/components/auth/register-form";

export default function CustomerRegistrationPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">
        Create Customer Account
      </h1>

      <p className="mt-2 mb-8 text-slate-600">
        Join our international marketplace.
      </p>

      <RegisterForm role="customer" />

      <p className="mt-6 text-sm">
        Already registered?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </main>
  );
}
