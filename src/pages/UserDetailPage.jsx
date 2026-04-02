import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminPostUserAdCredit } from '../services/adminQueries';
import AuthService from '../api/services/AuthService';
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

function parseAdminUserDetailApiResponse(res) {
  if (!res?.data || typeof res.data !== 'object' || Array.isArray(res.data)) return null;
  const d = res.data;
  let userDoc = null;
  if (d.user && typeof d.user === 'object') userDoc = d.user;
  else if (d._id || d.id || d.username != null || d.email != null) userDoc = d;
  else if (d.data && typeof d.data === 'object') userDoc = d.data;
  if (!userDoc) return null;
  const stats = d.stats && typeof d.stats === 'object' ? d.stats : {};
  const adminActions = Array.isArray(d.adminActions) ? d.adminActions : [];
  return { user: userDoc, stats, adminActions };
}

function summarizeDevices(devices) {
  if (!Array.isArray(devices) || devices.length === 0) return '';
  return devices
    .map((dev) => {
      const parts = [dev.platform, dev.deviceId ? String(dev.deviceId).slice(0, 10) : null].filter(Boolean);
      return parts.join(' · ');
    })
    .filter(Boolean)
    .slice(0, 4)
    .join(' | ');
}

function mergeStatsIntoUser(normalizedUser, stats) {
  if (!normalizedUser) return null;
  const s = stats && typeof stats === 'object' ? stats : {};
  return {
    ...normalizedUser,
    postsCount: s.postsCount ?? normalizedUser.postsCount,
    reelsCount: s.reelsCount ?? normalizedUser.reelsCount,
    followersCount: s.followersCount ?? normalizedUser.followersCount,
    followingCount: s.followingCount ?? normalizedUser.followingCount,
  };
}

function readRestrictionFlags(u) {
  if (!u || typeof u !== 'object') {
    return { canPost: true, canMessage: true, canReel: true, canStory: true };
  }
  const nested = u.restrictions && typeof u.restrictions === 'object' ? u.restrictions : null;
  const val = (key) => {
    if (nested && key in nested && nested[key] !== undefined && nested[key] !== null) {
      return Boolean(nested[key]);
    }
    if (key in u && u[key] !== undefined && u[key] !== null) return Boolean(u[key]);
    return true;
  };
  return {
    canPost: val('canPost'),
    canMessage: val('canMessage'),
    canReel: val('canReel'),
    canStory: val('canStory'),
  };
}

function normalizeUserDetailForPage(u) {
  if (!u || typeof u !== 'object') return null;
  const id = u._id ?? u.id;
  let status = u.status;
  if (!status) {
    if (u.isBanned) status = 'blocked';
    else if (u.isActive === false) status = 'inactive';
    else status = 'active';
  }
  return {
    ...u,
    _id: id,
    id,
    status,
    displayName: u.displayName || u.fullName || u.username || '—',
    isPrivateAccount: Boolean(u.isPrivateAccount ?? u.isPrivate),
    emailVerified: Boolean(u.emailVerified ?? u.isVerified),
    phoneVerified: Boolean(u.phoneVerified),
    lastActiveAt: u.lastActiveAt ?? u.lastActive,
    twoFactorEnabled: Boolean(u.twoFactorEnabled),
    creatorProgram: Boolean(u.creatorProgram),
    coverUrl: u.coverUrl || u.coverPhoto || undefined,
    deviceLast: u.deviceLast || summarizeDevices(u.devices) || undefined,
    banReason: u.banReason ?? u.bannedReason ?? u.blockReason ?? null,
  };
}

function statusBadgeTone(status) {
  if (status === 'blocked') return 'warning';
  if (status === 'inactive') return 'default';
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
  const [adminActions, setAdminActions] = useState([]);
  const [tab, setTab] = useState('profile');
  const [err, setErr] = useState('');
  const [adCreditOpen, setAdCreditOpen] = useState(false);
  const [adCreditAmount, setAdCreditAmount] = useState('');
  const [adCreditNote, setAdCreditNote] = useState('');
  const [adCreditSaving, setAdCreditSaving] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('Violated community guidelines');
  const [banSubmitting, setBanSubmitting] = useState(false);
  const [restrictModalOpen, setRestrictModalOpen] = useState(false);
  const [restrictDraft, setRestrictDraft] = useState(() => readRestrictionFlags(null));
  const [restrictSaving, setRestrictSaving] = useState(false);
  const { toast } = useToast();

  const refreshUserFromApi = useCallback(async () => {
    if (!userId) return;
    const res = await AuthService.adminGetUser(userId);
    if (res && typeof res === 'object' && res.success === false) {
      throw new Error(res?.message || 'Failed to refresh user');
    }
    const parsed = parseAdminUserDetailApiResponse(res);
    const normalized = normalizeUserDetailForPage(parsed?.user);
    const merged = mergeStatsIntoUser(normalized, parsed?.stats);
    if (!merged) throw new Error('Could not read user from API response');
    setUser(merged);
    setAdminActions(parsed?.adminActions ?? []);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoadingUser(false);
      return;
    }
    let cancelled = false;
    setLoadingUser(true);
    setUser(null);
    setErr('');
    setAdminActions([]);
    (async () => {
      try {
        const res = await AuthService.adminGetUser(userId);
        if (cancelled) return;
        if (res && typeof res === 'object' && res.success === false) {
          setUser(null);
          setErr(res?.message || 'Failed to load user');
          return;
        }
        const parsed = parseAdminUserDetailApiResponse(res);
        const normalized = normalizeUserDetailForPage(parsed?.user);
        const merged = mergeStatsIntoUser(normalized, parsed?.stats);
        if (!merged) {
          setUser(null);
          setErr('Could not read user from API response');
          return;
        }
        setUser(merged);
        if (!cancelled) setAdminActions(parsed?.adminActions ?? []);
      } catch (e) {
        if (!cancelled) {
          setUser(null);
          setErr(e?.message || 'Failed to load user');
        }
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const copyId = () => {
    if (!user?._id) return;
    navigator.clipboard.writeText(String(user._id)).then(
      () => toast('User ID copied', 'success'),
      () => toast('Could not copy', 'error')
    );
  };

  const submitRestrict = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setRestrictSaving(true);
    try {
      const res = await AuthService.adminPutUserRestrict(userId, restrictDraft);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res?.message || 'Could not update restrictions');
      }
      await refreshUserFromApi();
      setRestrictModalOpen(false);
      toast('Content restrictions updated', 'success');
      setErr('');
    } catch (e2) {
      toast(e2?.message || 'Could not update restrictions', 'error');
    } finally {
      setRestrictSaving(false);
    }
  };

  const submitBan = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setBanSubmitting(true);
    try {
      const reason = banReason.trim() || 'Violated community guidelines';
      const res = await AuthService.adminPutUserBan(userId, { banned: true, reason });
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res?.message || 'Ban request failed');
      }
      await refreshUserFromApi();
      setBanModalOpen(false);
      setBanReason('Violated community guidelines');
      toast('User banned', 'success');
      setErr('');
    } catch (e2) {
      toast(e2?.message || 'Could not ban user', 'error');
    } finally {
      setBanSubmitting(false);
    }
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
      setUser((prev) => (prev ? { ...prev, ...updated } : updated));
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
  const restrictionFlags = readRestrictionFlags(user);

  if (loadingUser || (!user && !err)) {
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
        <Link to="/users" className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← Back to users
        </Link>
      </PageShell>
    );
  }

  const coverSrc =
    user.coverUrl ||
    `https://picsum.photos/seed/cover${String(user.username || user._id || '').replace(/\W/g, '')}/1200/360`;

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
              <p className="text-gray-600 dark:text-zinc-400">@{user.username || '—'}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-500">{user.email || '—'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={statusBadgeTone(user.status)} className="capitalize">
                  {user.status}
                </Badge>
                {user.isVerified || user.emailVerified ? <Badge tone="info">Verified</Badge> : null}
                {user.isGoogleUser ? <Badge tone="default">Google</Badge> : null}
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
                disabled={banSubmitting}
                onClick={async () => {
                  setBanSubmitting(true);
                  try {
                    const res = await AuthService.adminPutUserBan(userId, { banned: false });
                    if (res && typeof res === 'object' && res.success === false) {
                      throw new Error(res?.message || 'Unban request failed');
                    }
                    await refreshUserFromApi();
                    toast('User unbanned', 'success');
                    setErr('');
                  } catch (e) {
                    setErr(e.message);
                    toast(e.message, 'error');
                  } finally {
                    setBanSubmitting(false);
                  }
                }}
              >
                Unban
              </Button>
            ) : (
              <Button
                variant="primary"
                className="bg-amber-600 hover:bg-amber-700"
                type="button"
                disabled={banSubmitting}
                onClick={() => {
                  setBanReason('Violated community guidelines');
                  setBanModalOpen(true);
                }}
              >
                Ban
              </Button>
            )}
            <Button
              variant="secondary"
              type="button"
              className="text-sm"
              disabled={banSubmitting || restrictSaving}
              onClick={() => {
                setRestrictDraft(readRestrictionFlags(user));
                setRestrictModalOpen(true);
              }}
            >
              Restrict
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={async () => {
                if (!window.confirm('Delete this account?')) return;
                try {
                  const res = await AuthService.adminDeleteUser(userId);
                  if (res && typeof res === 'object' && res.success === false) {
                    throw new Error(res?.message || 'Delete failed');
                  }
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
        {['profile', 'logins', 'activity', 'admin'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold capitalize transition-all duration-200 ${tab === t
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-zinc-400'
              }`}
          >
            {t === 'admin' ? 'Admin actions' : t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <DetailSection title="Identity" description="Account identifiers and internal reference.">
            <Row label="User ID">{String(user._id)}</Row>
            <Row label="Username">@{user.username || '—'}</Row>
            <Row label="Display name">{user.displayName || '—'}</Row>
            <Row label="Email">{user.email || '—'}</Row>
            <Row label="Phone">{user.phone || user.mobileNumber || '—'}</Row>
            <Row label="Account type">{user.accountType || '—'}</Row>
            <Row label="Role">{user.role || '—'}</Row>
            <Row label="Google account">{user.isGoogleUser ? 'Yes' : 'No'}</Row>
            <Row label="Google ID">{user.googleId ? `…${String(user.googleId).slice(-8)}` : '—'}</Row>
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
            <Row label="Last active">{fmtDate(user.lastActiveAt ?? user.lastLogin)}</Row>
            <Row label="Profile updated">{fmtDate(user.updatedAt)}</Row>
            <Row label="Last device / app">{user.deviceLast || '—'}</Row>
            <Row label="Restrictions (raw)">
              {user.restrictions && typeof user.restrictions === 'object'
                ? Object.entries(user.restrictions)
                  .map(([k, v]) => `${k}: ${String(v)}`)
                  .join(' · ')
                : '—'}
            </Row>
            {user.status === 'blocked' || user.banReason ? (
              <Row label="Ban reason">{user.banReason ? String(user.banReason) : '—'}</Row>
            ) : null}
            <Row label="Registered devices">
              {Array.isArray(user.devices) && user.devices.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-sm font-normal">
                  {user.devices.map((dev, idx) => (
                    <li key={dev.deviceId || dev._id || idx}>
                      <span className="capitalize">{dev.platform || 'device'}</span>
                      {dev.deviceId ? <span className="text-gray-500 dark:text-zinc-400"> · {dev.deviceId}</span> : null}
                      {dev.registeredAt ? (
                        <span className="block text-xs text-gray-500 dark:text-zinc-500">{fmtDate(dev.registeredAt)}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                '—'
              )}
            </Row>
          </DetailSection>

          <DetailSection
            title="Content permissions"
            description="Control what this user can create in the app. Uncheck to restrict."
          >
            <Row label="Post">
              {restrictionFlags.canPost ? <Badge tone="success">Allowed</Badge> : <Badge tone="warning">Restricted</Badge>}
            </Row>
            <Row label="Messages">
              {restrictionFlags.canMessage ? <Badge tone="success">Allowed</Badge> : <Badge tone="warning">Restricted</Badge>}
            </Row>
            <Row label="Reels">
              {restrictionFlags.canReel ? <Badge tone="success">Allowed</Badge> : <Badge tone="warning">Restricted</Badge>}
            </Row>
            <Row label="Stories">
              {restrictionFlags.canStory ? <Badge tone="success">Allowed</Badge> : <Badge tone="warning">Restricted</Badge>}
            </Row>
            <Row label="Actions">
              <Button
                type="button"
                variant="secondary"
                className="text-sm"
                onClick={() => {
                  setRestrictDraft(readRestrictionFlags(user));
                  setRestrictModalOpen(true);
                }}
              >
                Edit permissions
              </Button>
            </Row>
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


          {user.adminNotes ? (
            <DetailSection title="Admin notes" description="Internal only — not visible to the user.">
              <Row label="Notes">
                <span className="whitespace-pre-wrap font-normal text-gray-800 dark:text-zinc-200">{user.adminNotes}</span>
              </Row>
            </DetailSection>
          ) : null}
        </div>
      )}

      {tab === 'admin' && (
        <ul className="space-y-3">
          {adminActions.length === 0 ? (
            <Card className="shadow-md" padding="p-6">
              <p className="text-center text-sm text-gray-500 dark:text-zinc-400">No admin actions recorded.</p>
            </Card>
          ) : (
            adminActions.map((item, idx) => (
              <li
                key={item?._id || item?.id || idx}
                className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white/90 p-3 text-xs dark:bg-zinc-950/80">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </li>
            ))
          )}
        </ul>
      )}

      <Modal
        open={banModalOpen}
        onClose={() => !banSubmitting && setBanModalOpen(false)}
        title="Ban user"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" disabled={banSubmitting} onClick={() => setBanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="ban-user-form"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={banSubmitting}
            >
              {banSubmitting ? 'Banning…' : 'Confirm ban'}
            </Button>
          </div>
        }
      >
        <form id="ban-user-form" className="space-y-4" onSubmit={submitBan}>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            The account will be marked banned and this reason will be sent to the server.
          </p>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
            Reason
            <textarea
              name="banReason"
              rows={3}
              required
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Violated community guidelines"
              className="mt-1 w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
        </form>
      </Modal>

      <Modal
        open={restrictModalOpen}
        onClose={() => !restrictSaving && setRestrictModalOpen(false)}
        title="Content permissions"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" disabled={restrictSaving} onClick={() => setRestrictModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="restrict-user-form" disabled={restrictSaving}>
              {restrictSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="restrict-user-form" className="space-y-4" onSubmit={submitRestrict}>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Checked means the user is allowed; unchecked sends false for that capability.</p>
          {(
            [
              ['canPost', 'Can post'],
              ['canMessage', 'Can send messages'],
              ['canReel', 'Can post reels'],
              ['canStory', 'Can post stories'],
            ]
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
                checked={restrictDraft[key]}
                onChange={(e) => setRestrictDraft((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{label}</span>
            </label>
          ))}
        </form>
      </Modal>

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
