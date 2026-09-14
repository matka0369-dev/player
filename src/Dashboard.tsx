import { useCallback, useEffect, useMemo, useState } from 'react';
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
  useLang,
  useRoutedTabs,
  type NavItem,
  type UserSummary,
} from './shared';

export function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();

  // 'predict' listed first so it's the tab Layout lands a Player on (it
  // defaults activeId to nav[0]) — the games grid is this app's home
  // screen, not the account-stats overview. Its own "/predict/:gameId"
  // nested route (PredictForm) still resolves to this same tab — see
  // useRoutedTabs.
  const NAV: NavItem[] = useMemo(
    () => [
      { id: 'predict', label: t('nav.predict', 'Predict') },
      { id: 'overview', label: t('nav.overview', 'Overview') },
      { id: 'rates', label: t('nav.yourRates', 'Your rates') },
      { id: 'my-predictions', label: t('nav.myPredictions', 'My predictions') },
      { id: 'requests', label: t('nav.requestTokens', 'Request tokens') },
      { id: 'ledger', label: t('nav.tokenHistory', 'Token history') },
      { id: 'sessions', label: t('nav.yourSessions', 'Your sessions') },
      { id: 'about', label: t('nav.aboutTokens', 'About your tokens') },
    ],
    [t],
  );
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

  // The Predict tab (home + its /predict/:gameId page) carries its own
  // heading — each game's own card/name, and now open+close times right on
  // it — so the generic "Welcome, x" header above it is redundant there.
  // Every other tab keeps it.
  const isPredictTab = activeId === 'predict';

  return (
    <Layout
      title={isPredictTab ? undefined : `${t('dash.welcome', 'Welcome')}, ${user?.username ?? 'Player'}`}
      subtitle={isPredictTab ? undefined : t('dash.subtitle', 'View your account, balance, and prediction activity.')}
      nav={NAV}
      activeId={activeId}
      onSelectTab={onSelectTab}
    >
      {error && <Alert tone="error">{error}</Alert>}

      <Section id="overview">
        <div className="grid grid--stats">
          <Stat
            label={t('dash.mainBalance', 'Main balance')}
            value={me ? me.balance.toLocaleString() : '—'}
            hint={t('dash.mainBalanceHint', 'Spent first when you predict')}
          />
          <Stat
            label={t('dash.winnings', 'Winnings')}
            value={me ? me.winningsBalance.toLocaleString() : '—'}
            hint={t('dash.winningsHint', 'Where payouts land — spendable once main runs out')}
          />
          <Stat
            label={t('dash.account', 'Account')}
            value={me?.isActive ? t('dash.active', 'Active') : t('dash.disabled', 'Disabled')}
          />
          <Stat
            label={t('dash.yourAgent', 'Your agent')}
            value={me?.agent?.username ?? '—'}
            hint={t('dash.yourAgentHint', 'Who to contact for support')}
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
          title={t('nav.tokenHistory', 'Token history')}
          desc={t('dash.tokenHistoryDesc', 'Every change to your balance.')}
          showAccount={false}
          refreshKey={activityVersion}
        />
      </Section>

      <Section id="sessions">
        <MySessionsCard />
      </Section>

      <Section id="about">
        <Card title={t('dash.aboutTokensTitle', 'About your tokens')}>
          <div className="note">
            {t(
              'dash.aboutTokensBody',
              'Tokens are a closed-loop simulation currency. They cannot be purchased, sold, redeemed, transferred, or converted into anything of value, and there are no deposits or withdrawals of any kind. Every change to your balance is recorded in an auditable ledger.',
            )}
          </div>
        </Card>
      </Section>
    </Layout>
  );
}
