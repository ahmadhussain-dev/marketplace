
import Link from "next/link";
import RegisterForm from "@/components/auth/register-form";

export default function SellerRegistrationPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">
        Become a Seller
      </h1>

      <p className="mt-2 mb-8 text-slate-600">
        Register your business and start the
        marketplace approval process.
      </p>

      <RegisterForm role="seller" />

      <p className="mt-6 text-sm">
        Already registered?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </main>
  );
}
