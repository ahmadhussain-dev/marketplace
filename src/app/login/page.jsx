import Link from "next/link";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main  className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">
        Welcome Back
      </h1>
      <p className="mt-2 mb-8 text-slate-600">
        Sign in to your marketplace account.
      </p>

      <LoginForm />
      <div className=" mt-6 space-y-2 text-sm">
        <p>
          New Customer?{" "}
          <Link href="/register/customer" className="underline">Create an account</Link>
        </p>
        <p>
          Want to sell?{" "}
          <Link href="/register/seller" className="underline">Register a store</Link>
        </p>

      </div>
      
    </main>
  )
}