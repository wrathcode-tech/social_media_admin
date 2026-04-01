import { useEffect, useState } from 'react';
import { adminGetSettingsAdmins, adminGetSettingsApp, adminPutSettingsAppKey } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Toggle from '../components/ui/Toggle';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [admins, setAdmins] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([adminGetSettingsApp(), adminGetSettingsAdmins()]);
        setSettings(s || {});
        setAdmins(a.data || []);
        setErr('');
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  const saveKey = async (key, value) => {
    try {
      await adminPutSettingsAppKey(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <PageShell>
      <PageHeader title="Settings" description="App config and security." />
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}
      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-lg font-semibold dark:text-zinc-50">App</h2>
        <label className="mt-4 block text-sm gap-2 flex flex-row items-center font-medium text-gray-700 dark:text-zinc-300">
          App name
          <input
            defaultValue={settings.appName || ''}
            onBlur={(e) => saveKey('appName', e.target.value)}
            className="mt-1 w-full max-w-md rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Toggle
          id="maint"
          label="Maintenance mode"
          description="Show maintenance to end users."
          checked={!!settings.maintenanceMode}
          onChange={(v) => saveKey('maintenanceMode', v)}
        />
        <Toggle
          id="twofa"
          label="Require 2FA for admins"
          description="Flag for future TOTP enforcement."
          checked={!!settings.twoFactorRequired}
          onChange={(v) => saveKey('twoFactorRequired', v)}
        />
      </div>
      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-lg font-semibold dark:text-zinc-50">Security</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          IP allowlist: server env <code className="rounded-lg bg-gray-100 px-1 dark:bg-zinc-800">ADMIN_IP_WHITELIST</code>
        </p>
      </Card>
      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-lg font-semibold dark:text-zinc-50">Admin account</h2>
        <div className="mt-4 hidden md:block">
          <DataTable className="border-0 shadow-none dark:bg-transparent">
            <THead>
              <tr>
                <Th>Email</Th>
                <Th>Role</Th>
              </tr>
            </THead>
            <TBody>
              {admins.map((a) => (
                <Tr key={a._id}>
                  <Td className="font-medium">{a.email}</Td>
                  <Td>
                    <Badge tone={a.role === 'super_admin' ? 'purple' : 'info'} className="capitalize">
                      {a.role?.replace('_', ' ')}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </DataTable>
        </div>
        <div className="mt-4 space-y-3 md:hidden">
          {admins.map((a) => (
            <Card key={a._id} className="shadow-md" padding="p-4">
              <p className="font-medium text-gray-900 dark:text-zinc-50">{a.email}</p>
              <div className="mt-2">
                <Badge tone={a.role === 'super_admin' ? 'purple' : 'info'} className="capitalize">
                  {a.role?.replace('_', ' ')}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
