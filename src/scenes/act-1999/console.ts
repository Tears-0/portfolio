import { runCommand, type CliData } from './cli';

/** Characters per second the console types at: readable, and any key finishes it at once. */
const CPS = 60;
/** The screen keeps this many lines; older ones scroll away for good. */
const MAX_LINES = 200;

/**
 * The 1999 console (the act's hero interaction), in both modes. Visitors type commands or
 * press a suggested-command chip; answers come from the content data (cli.ts) and type out
 * at 60 characters a second. Screen readers get each whole answer at once from a polite live
 * region. The input never traps the page: PageUp and PageDown still page (data-allow-paging),
 * Escape leaves the input, and the title bar's Skip moves on to the next rest point.
 */
export function mountConsole(root: HTMLElement): () => void {
  const screen = root.querySelector<HTMLElement>('[data-cli-screen]');
  const live = root.querySelector<HTMLElement>('[data-cli-live]');
  const form = root.querySelector<HTMLFormElement>('[data-cli-form]');
  const input = form?.querySelector<HTMLInputElement>('input');
  const dataEl = root.querySelector('#cli-data');
  if (!screen || !live || !form || !input || !dataEl) return () => {};
  const data = JSON.parse(dataEl.textContent ?? '{}') as CliData;
  const instant = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const history: string[] = [];
  let recall = 0; // index into history while browsing it with ↑ / ↓
  let pending: { el: HTMLElement; text: string }[] = []; // lines still typing out
  let typed = 0; // characters of pending[0] already shown
  let timer: number | undefined;
  let last = 0;

  const scrollDown = () => {
    screen.scrollTop = screen.scrollHeight;
  };

  const addLine = (text: string, className?: string) => {
    const p = document.createElement('p');
    if (className) p.className = className;
    p.textContent = text;
    screen.append(p);
    while (screen.childElementCount > MAX_LINES) screen.firstElementChild?.remove();
    return p;
  };

  /** Shows everything still typing out, at once. */
  const finish = () => {
    window.clearTimeout(timer);
    timer = undefined;
    for (const line of pending) line.el.textContent = line.text;
    pending = [];
    typed = 0;
    screen.classList.remove('is-typing');
    scrollDown();
  };

  // Typing follows the clock, not the frame rate, so a slow or hidden tab still keeps time.
  const tick = () => {
    const now = performance.now();
    let budget = Math.max(1, Math.floor(((now - last) * CPS) / 1000));
    last += (budget * 1000) / CPS;
    while (budget > 0 && pending.length > 0) {
      const line = pending[0]!;
      const take = Math.min(budget, line.text.length - typed);
      typed += take;
      budget -= take;
      line.el.textContent = line.text.slice(0, typed);
      if (typed >= line.text.length) {
        pending.shift();
        typed = 0;
      }
    }
    scrollDown();
    if (pending.length > 0) timer = window.setTimeout(tick, 1000 / 30);
    else finish();
  };

  const typeOut = (lines: readonly string[]) => {
    const els = lines.map((text) => ({ el: addLine(''), text }));
    if (instant) {
      pending = els;
      finish();
      return;
    }
    pending.push(...els);
    screen.classList.add('is-typing');
    if (timer === undefined) {
      last = performance.now();
      timer = window.setTimeout(tick, 1000 / 30);
    }
  };

  const run = (command: string) => {
    finish();
    const result = runCommand(command, data);
    if (command.trim()) {
      history.push(command.trim());
      recall = history.length;
    }
    if (result.clear) {
      screen.replaceChildren();
      live.textContent = 'Screen cleared.';
      return;
    }
    addLine(`> ${command.trim()}`, 'is-echo');
    typeOut(result.lines);
    live.textContent = result.lines.join('\n');
  };

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const command = input.value;
    input.value = '';
    run(command);
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      input.blur();
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (history.length === 0) return;
      e.preventDefault();
      recall = Math.min(history.length, Math.max(0, recall + (e.key === 'ArrowUp' ? -1 : 1)));
      input.value = history[recall] ?? '';
      input.setSelectionRange(input.value.length, input.value.length);
      return;
    }
    // Any other key while an answer is typing out shows the rest of it at once.
    if (pending.length > 0 && e.key !== 'Enter') finish();
  };

  const onClick = (e: MouseEvent) => {
    const chip = (e.target as Element | null)?.closest<HTMLElement>('[data-cli-run]');
    if (chip) {
      run(chip.dataset.cliRun ?? '');
      return;
    }
    if (pending.length > 0 && screen.contains(e.target as Node)) finish();
  };

  form.addEventListener('submit', onSubmit);
  input.addEventListener('keydown', onKeydown);
  root.addEventListener('click', onClick);
  root.dataset.cliReady = '';

  return () => {
    finish();
    form.removeEventListener('submit', onSubmit);
    input.removeEventListener('keydown', onKeydown);
    root.removeEventListener('click', onClick);
    delete root.dataset.cliReady;
  };
}
