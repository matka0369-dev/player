import { useCallback, useEffect, useState } from 'react';
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
  useRoutedTabs,
  type NavItem,
  type UserSummary,
} from './shared';

// 'predict' listed first so it's the tab Layout lands a Player on (it
// defaults activeId to nav[0]) — the games grid is this app's home screen,
// not the account-stats overview. Its own "/predict/:gameId" nested route
// (PredictForm) still resolves to this same tab — see useRoutedTabs.
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

export function Dashboard() {
  const { user } = useAuth();
  const { activeId, onSelectTab } = useRoutedTabs('predict');
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
      activeId={activeId}
      onSelectTab={onSelectTab}
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
