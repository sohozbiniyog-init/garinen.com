export function showToast(message: string, opts?: { type?: 'success' | 'error' | 'info'; duration?: number }) {
  const duration = opts?.duration ?? 4000;
  const type = opts?.type ?? 'info';

  const root = document.createElement('div');
  root.className = `fixed right-4 bottom-6 z-[9999] max-w-xs transform-gpu`;

  const el = document.createElement('div');
  el.className = `mb-2 rounded-lg px-4 py-3 text-sm shadow-lg transition-opacity duration-200 ${
    type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'
  }`;
  el.textContent = message;

  root.appendChild(el);
  document.body.appendChild(root);

  // fade out
  setTimeout(() => {
    el.style.opacity = '0';
  }, duration - 400);

  setTimeout(() => {
    try { document.body.removeChild(root); } catch (e) { /* ignore */ }
  }, duration);
}
