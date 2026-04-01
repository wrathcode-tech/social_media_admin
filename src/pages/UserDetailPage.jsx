import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  adminDeleteUser,
  adminGetUser,
  adminGetUserActivity,
  adminGetUserLoginHistory,
  adminPatchUserBlock,
  adminPatchUserUnblock,
  adminPostUserAdCredit,
} from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { TextField } from '../components/ui/TextField';
import { useToast } from '../context/ToastContext';
import MediaThumb from '../components/ui/MediaThumb';
import { userAvatarUrl } from '../lib/placeholders';

function fmtDate(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

function fmtNum(v) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : String(v);
}

function riskTone(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return 'default';
  if (n >= 70) return 'danger';
  if (n >= 40) return 'warning';
  return 'success';
}

function Row({ label, children }) {
  return (
    <>
      <dt className="text-gray-500 dark:text-zinc-400">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-gray-900 dark:text-zinc-100">{children}</dd>
    </>
  );
}

function DetailSection({ title, description, children }) {
  return (
    <Card className="shadow-lg" padding="p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{title}</h2>
      {description ? <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{description}</p> : null}
      <dl className="mt-4 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-[minmax(9rem,auto)_1fr]">{children}</dl>
    </Card>
  );
}

export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [logins, setLogins] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tab, setTab] = useState('profile');
  const [err, setErr] = useState('');
  const [adCreditOpen, setAdCreditOpen] = useState(false);
  const [adCreditAmount, setAdCreditAmount] = useState('');
  const [adCreditNote, setAdCreditNote] = useState('');
  const [adCreditSaving, setAdCreditSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const u = await adminGetUser(userId);
        setUser(u);
        const [l, a] = await Promise.all([
          adminGetUserLoginHistory(userId, 20),
          adminGetUserActivity(userId, 20),
        ]);
        setLogins(l.data || []);
        setActivity(a.data || []);
        setErr('');
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [userId]);

  const copyId = () => {
    if (!user?._id) return;
    navigator.clipboard.writeText(String(user._id)).then(
      () => toast('User ID copied', 'success'),
      () => toast('Could not copy', 'error')
    );
  };

  const submitAdCredit = async (e) => {
    e.preventDefault();
    if (!userId || user?.status === 'blocked') return;
    setAdCreditSaving(true);
    try {
      const updated = await adminPostUserAdCredit(userId, {
        amount: adCreditAmount,
        note: adCreditNote,
      });
      setUser(updated);
      const a = await adminGetUserActivity(userId, 20);
      setActivity(a.data || []);
      setAdCreditOpen(false);
      setAdCreditAmount('');
      setAdCreditNote('');
      toast('Manual credit added to wallet', 'success');
      setErr('');
    } catch (e2) {
      toast(e2.message || 'Could not add credit', 'error');
    } finally {
      setAdCreditSaving(false);
    }
  };

  const walletCurrency = user?.walletCurrency || 'INR';

  if (!user && !err) {
    return (
      <PageShell>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Loading…</p>
      </PageShell>
    );
  }
  if (err && !user) {
    return (
      <PageShell>
        <p className="text-red-600 dark:text-red-400">{err}</p>
      </PageShell>
    );
  }

  const coverSrc = user.coverUrl || `https://picsum.photos/seed/cover${String(user.username || '').replace(/\W/g, '')}/1200/360`;

  return (
    <PageShell>
      <Link to="/users" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
        ← Users
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative h-36 w-full sm:h-44">
          <img src={coverSrc} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        </div>
        <div className="flex flex-col gap-4 border-t border-gray-200/80 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <MediaThumb
              src={userAvatarUrl(user)}
              className="-mt-14 h-24 w-24 shrink-0 rounded-2xl border-4 border-white shadow-lg dark:border-zinc-900 sm:-mt-16 sm:h-28 sm:w-28"
            />
            <div className="sm:pb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
                {user.displayName || user.username}
              </h1>
              <p className="text-gray-600 dark:text-zinc-400">@{user.username}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-500">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={user.status === 'blocked' ? 'warning' : 'success'} className="capitalize">
                  {user.status}
                </Badge>
                {user.isPrivateAccount ? <Badge tone="info">Private</Badge> : <Badge tone="default">Public</Badge>}
                {user.creatorProgram ? <Badge tone="purple">Creator program</Badge> : null}
                {user.twoFactorEnabled ? <Badge tone="success">2FA on</Badge> : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" type="button" className="text-sm" onClick={copyId}>
              Copy user ID
            </Button>
            {user.status === 'blocked' ? (
              <Button
                variant="primary"
                className="bg-green-600 hover:bg-green-700"
                type="button"
                onClick={async () => {
                  try {
                    const u = await adminPatchUserUnblock(userId);
                    setUser(u);
                    toast('Account unblocked', 'success');
                  } catch (e) {
                    setErr(e.message);
                    toast(e.message, 'error');
                  }
                }}
              >
                Unblock
              </Button>
            ) : (
              <Button
                variant="primary"
                className="bg-amber-600 hover:bg-amber-700"
                type="button"
                onClick={async () => {
                  try {
                    const u = await adminPatchUserBlock(userId);
                    setUser(u);
                    toast('Account blocked', 'success');
                  } catch (e) {
                    setErr(e.message);
                    toast(e.message, 'error');
                  }
                }}
              >
                Block
              </Button>
            )}
            <Button
              variant="danger"
              type="button"
              onClick={async () => {
                if (!window.confirm('Delete this account?')) return;
                try {
                  await adminDeleteUser(userId);
                  toast('Account removed', 'success');
                  navigate('/users');
                } catch (e) {
                  setErr(e.message);
                  toast(e.message, 'error');
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-zinc-800">
        {['profile', 'logins', 'activity'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold capitalize transition-all duration-200 ${tab === t
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-zinc-400'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <DetailSection title="Identity" description="Account identifiers and internal reference.">
            <Row label="User ID">{String(user._id)}</Row>
            <Row label="Username">@{user.username}</Row>
            <Row label="Display name">{user.displayName || '—'}</Row>
            <Row label="Email">{user.email}</Row>
            <Row label="Phone">{user.phone || '—'}</Row>
            <Row label="Referral code">{user.referralCode || '—'}</Row>
          </DetailSection>

          <DetailSection title="Profile & contact" description="Public profile and links.">
            <Row label="Bio">{user.bio || '—'}</Row>
            <Row label="Website">
              {user.website ? (
                <a
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {user.website}
                </a>
              ) : (
                '—'
              )}
            </Row>
            <Row label="City">{user.city || '—'}</Row>
            <Row label="Country">{user.country || user.ipCountry || '—'}</Row>
            <Row label="Language">{user.language || '—'}</Row>
            <Row label="Gender">{user.gender ? <span className="capitalize">{user.gender}</span> : '—'}</Row>
            <Row label="Date of birth">{fmtDate(user.birthDate)}</Row>
          </DetailSection>

          <DetailSection title="Account & security" description="Verification, privacy, and device signals.">
            <Row label="Email verified">{user.emailVerified ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">No</Badge>}</Row>
            <Row label="Phone verified">{user.phoneVerified ? <Badge tone="success">Yes</Badge> : <Badge tone="default">No</Badge>}</Row>
            <Row label="Two-factor auth">{user.twoFactorEnabled ? <Badge tone="success">Enabled</Badge> : <Badge tone="default">Off</Badge>}</Row>
            <Row label="Private account">{user.isPrivateAccount ? 'Yes' : 'No'}</Row>
            <Row label="Signup source">{user.signupSource || '—'}</Row>
            <Row label="Joined">{fmtDate(user.createdAt)}</Row>
            <Row label="Last active">{fmtDate(user.lastActiveAt)}</Row>
            <Row label="Profile updated">{fmtDate(user.updatedAt)}</Row>
            <Row label="Last device / app">{user.deviceLast || '—'}</Row>
          </DetailSection>

          <DetailSection title="Engagement" description="Counts shown to moderators (approximate).">
            <Row label="Followers">{fmtNum(user.followersCount)}</Row>
            <Row label="Following">{fmtNum(user.followingCount)}</Row>
            <Row label="Posts">{fmtNum(user.postsCount)}</Row>
            <Row label="Reels">{fmtNum(user.reelsCount)}</Row>
            <Row label="Stories">{fmtNum(user.storiesCount)}</Row>
            <Row label="Likes received">{fmtNum(user.likesReceivedCount)}</Row>
          </DetailSection>

          <DetailSection title="Trust & safety" description="Risk signals for moderation.">
            <Row label="Reports against user">{fmtNum(user.reportsAgainstCount)}</Row>
            <Row label="Strikes">{fmtNum(user.strikesCount)}</Row>
            <Row label="Risk score">
              {user.riskScore != null ? (
                <Badge tone={riskTone(user.riskScore)} className="tabular-nums">
                  {user.riskScore}
                </Badge>
              ) : (
                '—'
              )}
            </Row>
          </DetailSection>

          <DetailSection title="Monetization" description="Creator wallet (if applicable).">
            <Row label="Creator program">{user.creatorProgram ? <Badge tone="purple">Enrolled</Badge> : <Badge tone="default">Not enrolled</Badge>}</Row>
            <Row label="Wallet balance">
              {user.walletBalance != null && user.walletBalance !== ''
                ? `${fmtNum(user.walletBalance)} ${walletCurrency}`
                : user.creatorProgram
                  ? `0 ${walletCurrency}`
                  : '—'}
            </Row>
          </DetailSection>

          <DetailSection
            title="Promoted ads"
            description={
              <>
                Users normally top up from the app (payment requests are user‑initiated). Review the{' '}
                <Link to="/finance/ad-payments" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  ad payment queue
                </Link>
                . Use manual credit only for promos, refunds, or support — in their wallet currency.
              </>
            }
          >
            <Row label="Currency">{walletCurrency}</Row>
            <Row label="Manual credit">
              <Button
                type="button"
                variant="secondary"
                className="text-sm"
                disabled={user.status === 'blocked'}
                onClick={() => {
                  setAdCreditOpen(true);
                  setAdCreditAmount('');
                  setAdCreditNote('');
                }}
              >
                Add manual credit…
              </Button>
              {user.status === 'blocked' ? (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Unblock the account before adding credit.</p>
              ) : null}
            </Row>
          </DetailSection>

          {user.adminNotes ? (
            <DetailSection title="Admin notes" description="Internal only — not visible to the user.">
              <Row label="Notes">
                <span className="whitespace-pre-wrap font-normal text-gray-800 dark:text-zinc-200">{user.adminNotes}</span>
              </Row>
            </DetailSection>
          ) : null}
        </div>
      )}

      {tab === 'logins' && (
        <ul className="space-y-3">
          {logins.length === 0 ? (
            <Card className="shadow-md" padding="p-6">
              <p className="text-center text-sm text-gray-500 dark:text-zinc-400">No login history.</p>
            </Card>
          ) : (
            logins.map((l) => (
              <li
                key={l._id}
                className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                {l.success ? <Badge tone="success">OK</Badge> : <Badge tone="danger">Fail</Badge>} · {l.ip || '—'} ·{' '}
                {fmtDate(l.createdAt)}
                {l.userAgent ? <span className="mt-1 block text-xs text-gray-500 dark:text-zinc-500">{l.userAgent}</span> : null}
              </li>
            ))
          )}
        </ul>
      )}

      {tab === 'activity' && (
        <ul className="space-y-3">
          {activity.length === 0 ? (
            <Card className="shadow-md" padding="p-6">
              <p className="text-center text-sm text-gray-500 dark:text-zinc-400">No recent activity.</p>
            </Card>
          ) : (
            activity.map((a) => (
              <li
                key={a._id}
                className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <span className="font-medium text-gray-900 dark:text-zinc-100">{a.action}</span>
                <span className="text-gray-500 dark:text-zinc-500"> · {fmtDate(a.createdAt)}</span>
                {a.meta && typeof a.meta === 'object' ? (
                  <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-white/80 p-2 text-xs dark:bg-zinc-950/80">
                    {JSON.stringify(a.meta, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))
          )}
        </ul>
      )}

      <Modal
        open={adCreditOpen}
        onClose={() => !adCreditSaving && setAdCreditOpen(false)}
        title="Manual ad wallet credit"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" disabled={adCreditSaving} onClick={() => setAdCreditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="ad-credit-form" disabled={adCreditSaving}>
              {adCreditSaving ? 'Saving…' : 'Apply credit'}
            </Button>
          </div>
        }
      >
        <form id="ad-credit-form" className="space-y-4" onSubmit={submitAdCredit}>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Regular top‑ups come from the user’s app after they pay. This screen is for an admin‑side adjustment to{' '}
            <span className="font-medium text-gray-900 dark:text-zinc-100">@{user.username}</span>’s wallet (promo, goodwill,
            reconciliation). Follow your finance policy for tax and records.
          </p>
          <TextField
            label={`Amount (${walletCurrency})`}
            name="adCreditAmount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            placeholder="e.g. 5000"
            value={adCreditAmount}
            onChange={(e) => setAdCreditAmount(e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
            Internal note (optional)
            <textarea
              name="adCreditNote"
              rows={2}
              value={adCreditNote}
              onChange={(e) => setAdCreditNote(e.target.value)}
              placeholder="Campaign / reference for your team"
              className="mt-1 w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
        </form>
      </Modal>
    </PageShell>
  );
}
