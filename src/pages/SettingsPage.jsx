import { useEffect, useState } from 'react';
import AuthService from '../api/services/AuthService';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import { MaintenanceFormSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

function isApiError(res) {
  return res && typeof res === 'object' && res.success === false;
}

export default function SettingsPage() {
  const { toast } = useToast();

  const [maintEnabled, setMaintEnabled] = useState(false);
  const [maintMessage, setMaintMessage] = useState('');
  const [maintLoading, setMaintLoading] = useState(true);
  const [maintSaving, setMaintSaving] = useState(false);
  const [maintErr, setMaintErr] = useState('');

  const inputClass =
    'mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100';

  const maintenanceStatus = async () => {
    try {
      const res = await AuthService.adminGetSettingsMaintenance();
      if (isApiError(res)) {
        setMaintErr(res.message || 'Could not load');
      } else {
        const d = res?.data != null && typeof res.data === 'object' ? res.data : res;
        setMaintEnabled(Boolean(d?.enabled ?? d?.isEnabled));
        setMaintMessage(String(d?.message ?? d?.msg ?? ''));
      }
    } catch (e) {
      setMaintErr(e?.message || 'Could not load');
    } finally {
      setMaintLoading(false);
    }
  };

  const saveMaintenance = async (e) => {
    e?.preventDefault();
    setMaintSaving(true);
    setMaintErr('');
    try {
      const res = await AuthService.adminPutSettingsMaintenance(maintEnabled, maintMessage);
      if (isApiError(res)) {
        setMaintErr(res.message || 'Save failed');
        toast(res.message || 'Save failed', 'error');
      } else {
        toast('Maintenance updated', 'success');
      }
    } catch (e2) {
      const msg = e2?.message || 'Save failed';
      setMaintErr(msg);
      toast(msg, 'error');
    } finally {
      setMaintSaving(false);
    }
  };

  useEffect(() => {
    maintenanceStatus();
  }, []);

  return (
    <PageShell>
      <PageHeader title="Settings" description="Maintenance mode for the app." />

      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Maintenance</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Control global maintenance mode and user-facing message.
        </p>

        {maintErr ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            {maintErr}
          </p>
        ) : null}

        {maintLoading ? (
          <MaintenanceFormSkeleton />
        ) : (
          <form className="mt-4 space-y-4" onSubmit={saveMaintenance}>
            <Toggle
              id="maint-api"
              label="Maintenance enabled"
              description="When on, clients will show the maintenance message."
              checked={maintEnabled}
              onChange={setMaintEnabled}
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Message
              <textarea
                value={maintMessage}
                onChange={(e) => setMaintMessage(e.target.value)}
                rows={3}
                placeholder="Under maintenance, back soon!"
                className={`${inputClass} resize-y placeholder:text-gray-400 dark:placeholder:text-zinc-600`}
              />
            </label>
            <Button type="submit" variant="primary" disabled={maintSaving}>
              {maintSaving ? 'Saving…' : 'Save maintenance'}
            </Button>
          </form>
        )}
      </Card>
    </PageShell>
  );
}
