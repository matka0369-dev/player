import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ApiError, LANGUAGES, api, useAuth, useLang } from '../shared';
import { PinPad } from './PinPad';
import { accessText, type AccessKey } from './text';
import { clearDevice, loadAgentCode, saveDevice, type SavedDevice } from './device';

function useAccessText() {
  const { lang } = useLang();
  return useCallback((key: AccessKey, params?: Record<string, string | number>) => accessText(lang, key, params), [lang]);
}

function Frame({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang();
  return (
    <div className="access" data-role="PLAYER">
      <div className="access__langs">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            className={`type-chip${lang === l.code ? ' type-chip--selected' : ''}`}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="access__mark">P</div>
      {children}
    </div>
  );
}

const code = (e: unknown) => (e instanceof ApiError ? e.message : '');

/** First visit from a link: choose a PIN (twice), which also enrolls this
 *  phone. The link is spent only if the whole thing succeeds. */
export function EnterScreen({ token, onDone }: { token: string; onDone: () => void }) {
  const tx = useAccessText();
  const { refresh } = useAuth();
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [reset, setReset] = useState(0);
  const [dead, setDead] = useState(false);

  const flash = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setReset((n) => n + 1);
  };

  async function complete(pin: string) {
    if (first === null) {
      setFirst(pin);
      setError(null);
      setReset((n) => n + 1);
      return;
    }
    if (pin !== first) {
      setFirst(null);
      setError(tx('pinMismatch'));
      flash();
      return;
    }
    setBusy(true);
    try {
      const res = await api.enter(token, pin);
      saveDevice({ deviceId: res.deviceId, deviceKey: res.deviceKey, username: res.user.username });
      await refresh();
      onDone();
    } catch (e) {
      if (code(e) === 'link_invalid') setDead(true);
      else {
        setError(tx('tryAgain'));
        setFirst(null);
        flash();
      }
    } finally {
      setBusy(false);
    }
  }

  if (dead) {
    return (
      <Frame>
        <p className="access__sub">{tx('linkInvalid')}</p>
        <button type="button" className="access__cta" onClick={onDone}>
          {tx('register')}
        </button>
      </Frame>
    );
  }

  return (
    <Frame>
      <h1 className="access__title">{first === null ? tx('choosePin') : tx('repeatPin')}</h1>
      <p className="access__error">{busy ? tx('wait') : error}</p>
      <PinPad onComplete={(p) => void complete(p)} disabled={busy} shake={shake} resetKey={reset} />
    </Frame>
  );
}

/** Every later launch with no live session: just the keypad. */
export function PinScreen({ device, onForget }: { device: SavedDevice; onForget: () => void }) {
  const tx = useAccessText();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [reset, setReset] = useState(0);
  const [locked, setLocked] = useState(false);

  async function complete(pin: string) {
    setBusy(true);
    setError(null);
    try {
      await api.pinLogin(device.deviceId, device.deviceKey, pin);
      await refresh();
    } catch (e) {
      const msg = code(e);
      if (msg.startsWith('wrong_pin:')) {
        setError(`${tx('wrongPin')} · ${tx('triesLeft', { n: msg.split(':')[1] })}`);
      } else if (msg === 'locked' || msg === 'account_disabled') {
        clearDevice();
        setLocked(true);
      } else if (msg === 'unknown_device') {
        // This phone's enrollment no longer exists (new link issued, device
        // revoked): nothing to type a PIN against any more.
        clearDevice();
        onForget();
        return;
      } else {
        setError(tx('tryAgain'));
      }
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setReset((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }

  if (locked) {
    return (
      <Frame>
        <p className="access__sub">{tx('locked')}</p>
        <button type="button" className="access__cta" onClick={onForget}>
          {tx('register')}
        </button>
      </Frame>
    );
  }

  return (
    <Frame>
      <h1 className="access__title">{tx('welcomeBack')}</h1>
      <p className="access__sub">{device.username}</p>
      <p className="access__error">{busy ? tx('wait') : error}</p>
      <PinPad onComplete={(p) => void complete(p)} disabled={busy} shake={shake} resetKey={reset} />
      <button type="button" className="access__link" onClick={() => { clearDevice(); onForget(); }}>
        {tx('notYou')}
      </button>
    </Frame>
  );
}

/** A phone that has never signed in: ask the player's own Agent, on WhatsApp,
 *  for a link. Which Agent comes from the code baked into this app's start
 *  URL (or the invite link they opened), looked up here so the number is
 *  never hard-coded into a build. */
export function RegisterScreen({ onPassword }: { onPassword: () => void }) {
  const tx = useAccessText();
  const agentCode = loadAgentCode();
  const [number, setNumber] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!agentCode) return;
    let cancelled = false;
    setFailed(false);
    api
      .joinInfo(agentCode)
      .then((r) => !cancelled && setNumber(r.whatsappNumber))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [agentCode, attempt]);

  return (
    <Frame>
      {number ? (
        <>
          <a className="access__cta" href={`https://wa.me/${number}?text=${encodeURIComponent('Register')}`}>
            <span aria-hidden="true">💬</span> {tx('register')}
          </a>
          <p className="access__sub">{tx('registerHint')}</p>
        </>
      ) : failed ? (
        <>
          <p className="access__sub">{tx('agentLoadFailed')}</p>
          <button type="button" className="access__cta" onClick={() => setAttempt((n) => n + 1)}>
            {tx('tryAgain')}
          </button>
        </>
      ) : agentCode ? (
        <p className="access__sub">{tx('wait')}</p>
      ) : (
        <p className="access__sub">{tx('noAgent')}</p>
      )}
      <button type="button" className="access__link" onClick={onPassword}>
        {tx('havePassword')}
      </button>
    </Frame>
  );
}
