import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditBrandProfileForm } from "@/app/dashboard/brand/EditBrandProfileForm";

export default async function BrandProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brand } = await supabase
    .from("brands")
    .select("company_name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Edit profile
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Update your company details.
        </p>
      </div>

      <EditBrandProfileForm companyName={brand?.company_name ?? ""} />
    </div>
  );
}
