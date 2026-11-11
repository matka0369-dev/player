import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Portal, useAuth } from './shared';
import { EnterScreen, PinScreen, RegisterScreen } from './access/screens';
import { loadDevice, saveAgentCode } from './access/device';
import './access/access.css';

const TOKEN_RE = /^#t=([0-9a-f]{64})$/;
const JOIN_RE = /^\/join\/([A-Za-z0-9_-]{4,32})\/?$/;

/**
 * The Player app's front door. Players don't have passwords: an Agent hands
 * them a one-time link (which sets their PIN and enrolls the phone), after
 * which opening the app asks only for the PIN. Anything else — a phone that's
 * never signed in, or an older account that still has a password — falls
 * through to Register / the stock password form.
 *
 * Replaces the shared `Portal` for this app only; the other three portals keep
 * theirs. It still renders `Portal` once someone is signed in, so the
 * wrong-account-type guard is unchanged.
 */
export function PlayerGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Read once, at first render, before the address is tidied below. The token
  // rides after the `#` so it never reaches server logs or a Referer header.
  const [pendingToken, setPendingToken] = useState<string | null>(() => TOKEN_RE.exec(location.hash)?.[1] ?? null);
  const [joinCode] = useState<string | null>(() => JOIN_RE.exec(location.pathname)?.[1] ?? null);
  const [device, setDevice] = useState(loadDevice);
  const [password, setPassword] = useState(false);

  useEffect(() => {
    if (joinCode) saveAgentCode(joinCode);
    // Strip the token / invite code out of the address bar and history.
    if (pendingToken || joinCode) navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pendingToken) {
    return (
      <EnterScreen
        token={pendingToken}
        onDone={() => {
          setPendingToken(null);
          setDevice(loadDevice());
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="login" data-role="PLAYER">
        <span className="note">Loading…</span>
      </div>
    );
  }

  if (user || password) return <Portal accountTypes={['PLAYER']}>{children}</Portal>;

  if (device) {
    return <PinScreen device={device} onForget={() => setDevice(null)} />;
  }
  return <RegisterScreen onPassword={() => setPassword(true)} />;
}
