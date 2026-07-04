import { SettingsForm } from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-gothic text-2xl font-bold text-(--color-ink)">
        設定
      </h1>
      <SettingsForm />
    </div>
  );
}
