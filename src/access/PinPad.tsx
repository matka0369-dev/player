import { useEffect, useState } from 'react';

/**
 * A big numeric keypad that collects exactly four digits and reports them the
 * moment the fourth lands — no submit button to find. `resetKey` clears it
 * (after a wrong PIN, or between "choose" and "repeat"); `shake` is the
 * wrong-answer cue, since a red word means little to someone who can't read it.
 */
export function PinPad({
  onComplete,
  disabled,
  shake,
  resetKey,
}: {
  onComplete: (pin: string) => void;
  disabled?: boolean;
  shake?: boolean;
  resetKey?: number;
}) {
  const [digits, setDigits] = useState('');

  useEffect(() => setDigits(''), [resetKey]);

  function press(d: string) {
    if (disabled || digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) onComplete(next);
  }

  return (
    <>
      <div className={`pin-dots${shake ? ' pin-dots--shake' : ''}`} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`pin-dots__dot${i < digits.length ? ' pin-dots__dot--filled' : ''}`} />
        ))}
      </div>
      <div className="pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className="pin-pad__key" disabled={disabled} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <span />
        <button type="button" className="pin-pad__key" disabled={disabled} onClick={() => press('0')}>
          0
        </button>
        <button
          type="button"
          className="pin-pad__key pin-pad__key--ghost"
          aria-label="Delete"
          disabled={disabled || digits.length === 0}
          onClick={() => setDigits((v) => v.slice(0, -1))}
        >
          ⌫
        </button>
      </div>
    </>
  );
}
