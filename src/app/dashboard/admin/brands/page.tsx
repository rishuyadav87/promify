import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

type BrandRow = {
  id: string;
  company_name: string;
  created_at: string;
  users: { email: string } | null;
};

export default async function AdminBrandsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewer } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (viewer?.role !== "admin") redirect("/dashboard");

  const { data: brands, error } = (await supabase
    .from("brands")
    .select("id, company_name, created_at, users ( email )")
    .order("created_at", { ascending: false })) as unknown as {
    data: BrandRow[] | null;
    error: any;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/admin" className="text-sm text-teal underline">
          ← Back to overview
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          All brands
        </h1>
      </div>

      {error && <p className="text-sm text-error">{error.message}</p>}

      <ul className="flex flex-col gap-3">
        {brands?.map((b) => (
          <li key={b.id}>
            <Card className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink">
                  {b.company_name}
                </span>
                <span className="text-xs text-warmgray">
                  {b.users?.email ?? "unknown email"}
                </span>
              </div>
              <span className="text-xs text-warmgray">
                Joined {new Date(b.created_at).toLocaleDateString("en-IN")}
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
