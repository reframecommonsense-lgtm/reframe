import { SettingsForm } from "@/components/settings/SettingsForm";
import { getCurrentProfileState } from "@/lib/profiles";

export default async function SettingsPage() {
  const initialProfile = await getCurrentProfileState();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-gothic text-2xl font-bold text-(--color-ink)">
        設定
      </h1>
      <SettingsForm initialProfile={initialProfile} />
    </div>
  );
}
