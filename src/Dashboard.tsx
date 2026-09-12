import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Card,
  Layout,
  LedgerCard,
  MyPredictionsCard,
  MySessionsCard,
  PredictForm,
  RatesSection,
  Section,
  Stat,
  TokenRequestsCard,
  api,
  useAuth,
  type NavItem,
  type UserSummary,
} from './shared';

// 'predict' listed first so it's the tab Layout lands a Player on (it
// defaults activeId to nav[0]) — the games grid is this app's home screen,
// not the account-stats overview.
const NAV: NavItem[] = [
  { id: 'predict', label: 'Predict' },
  { id: 'overview', label: 'Overview' },
  { id: 'rates', label: 'Your rates' },
  { id: 'my-predictions', label: 'My predictions' },
  { id: 'requests', label: 'Request tokens' },
  { id: 'ledger', label: 'Token history' },
  { id: 'sessions', label: 'Your sessions' },
  { id: 'about', label: 'About your tokens' },
];

// Every tab is its own URL — 'predict' owns both "/" (the games grid) and
// "/predict/:gameId" (PredictForm's own nested route for the bet form), so
// picking a game there stays on the "predict" tab as far as the sidebar and
// TabContext are concerned.
const PATH_FOR_TAB: Record<string, string> = {
  predict: '/',
  overview: '/overview',
  rates: '/rates',
  'my-predictions': '/my-predictions',
  requests: '/requests',
  ledger: '/ledger',
  sessions: '/sessions',
  about: '/about',
};

function tabForPath(pathname: string): string | undefined {
  if (pathname === '/' || pathname.startsWith('/predict/')) return 'predict';
  const id = pathname.slice(1);
  return id in PATH_FOR_TAB ? id : undefined;
}

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState<UserSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Bumped after placing a prediction so the ledger and history tabs pick up
  // the new debit/row without waiting for their own next mount.
  const [activityVersion, setActivityVersion] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setMe(await api.getUser(user.id));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  function onPlaced() {
    void load();
    setActivityVersion((v) => v + 1);
  }

  return (
    <Layout
      title={`Welcome, ${user?.username ?? 'Player'}`}
      subtitle="View your account, balance, and prediction activity."
      nav={NAV}
      activeId={tabForPath(location.pathname)}
      onSelectTab={(id) => navigate(PATH_FOR_TAB[id] ?? '/')}
    >
      {error && <Alert tone="error">{error}</Alert>}

      <Section id="overview">
        <div className="grid grid--stats">
          <Stat
            label="Main balance"
            value={me ? me.balance.toLocaleString() : '—'}
            hint="Spent first when you predict"
          />
          <Stat
            label="Winnings"
            value={me ? me.winningsBalance.toLocaleString() : '—'}
            hint="Where payouts land — spendable once main runs out"
          />
          <Stat label="Account" value={me?.isActive ? 'Active' : 'Disabled'} />
          <Stat
            label="Your agent"
            value={me?.agent?.username ?? '—'}
            hint="Who to contact for support"
          />
        </div>
      </Section>

      <Section id="rates">
        <RatesSection />
      </Section>

      <Section id="predict">
        <PredictForm onPlaced={onPlaced} />
      </Section>

      <Section id="my-predictions">
        <MyPredictionsCard refreshKey={activityVersion} />
      </Section>

      <Section id="requests">
        <TokenRequestsCard
          mainBalance={me?.balance ?? 0}
          winningsBalance={me?.winningsBalance ?? 0}
          onChanged={onPlaced}
        />
      </Section>

      <Section id="ledger">
        <LedgerCard
          title="Token history"
          desc="Every change to your balance."
          showAccount={false}
          refreshKey={activityVersion}
        />
      </Section>

      <Section id="sessions">
        <MySessionsCard />
      </Section>

      <Section id="about">
        <Card title="About your tokens">
          <div className="note">
            Tokens are a closed-loop simulation currency. They cannot be purchased, sold, redeemed,
            transferred, or converted into anything of value, and there are no deposits or
            withdrawals of any kind. Every change to your balance is recorded in an auditable
            ledger.
          </div>
        </Card>
      </Section>
    </Layout>
  );
}
