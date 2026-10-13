import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent,CardTitle,CardHeader } from "@/components/ui/card";
const roles = [
  {
    title: "Customer",
    description: "Explore and purchase products worldwide.",
  },
  {
    title: "Seller",
    description: "Create a store and manage your products.",
  },
  {
    title: "Administratorr",
    description: "Manage and monitor the marketplace.",
  }
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between p-6">
          <h1 className="text-2xl font-bold">
            Marketplece
          </h1>
          <Button>
            <Link href="/api/health">
              Check API
            </Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold">
          Your Global Marketplace
        </h2>
        <p className=" mt-4 text-slate-600">
            Discover products, manage stores, and connect
          buyers with sellers worldwide.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {
            roles.map((role) => (
              <Card key={role.title}>
                <CardHeader>
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-slate-600">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </main>
  );
}
