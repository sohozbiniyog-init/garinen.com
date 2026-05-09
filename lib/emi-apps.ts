export interface EmiApplication {
  id: string; // unique
  listingId: string;
  title?: string;
  status: 'DRAFT' | 'FOLLOW_UP_REQUIRED' | 'SUBMITTED';
  createdAt: string;
}

const KEY = 'ghuri_emi_apps_v1';

export function getEmiApps(): EmiApplication[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveEmiApps(items: EmiApplication[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

export function addDraft(app: Omit<EmiApplication, 'id' | 'createdAt'>) {
  const list = getEmiApps();
  const newItem: EmiApplication = {
    ...app,
    id: 'emi_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString()
  };
  const next = [newItem, ...list];
  saveEmiApps(next);
  return newItem;
}

export function updateStatus(id: string, status: EmiApplication['status']) {
  const list = getEmiApps();
  const next = list.map((a) => (a.id === id ? { ...a, status } : a));
  saveEmiApps(next);
  return next;
}
