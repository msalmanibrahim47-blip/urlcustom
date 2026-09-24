import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: settings } = await supabase.from('platform_settings').select('*').eq('owner_id', userData.user!.id).maybeSingle();

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Settings</h2>
        <p className="text-sm text-muted">Global white-label branding for the platform itself — not any one customer.</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
