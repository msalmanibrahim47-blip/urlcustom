import { createClient } from '@/lib/supabase/server';
import { DomainsManager } from '@/components/DomainsManager';
import type { DomainRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DomainsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: domains } = await supabase
    .from('domains')
    .select('*')
    .eq('owner_id', userData.user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Domains</h2>
        <p className="text-sm text-muted">
          Attach custom domains to your platform or individual projects. Real DNS verification and SSL happen in Netlify — this page tracks what you've configured there.
        </p>
      </div>
      <DomainsManager domains={(domains ?? []) as DomainRecord[]} />
    </div>
  );
}
