type TrackPayload = {
  event: string;
  sessionId: string;
  properties?: Record<string, any>;
};

function getSessionId() {
  const key = 'pg_session_id';
  let id = localStorage.getItem(key);
  if (id) return id;
  id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, id);
  return id;
}

export function track(event: string, properties?: Record<string, any>) {
  if (!event) return;
  const payload: TrackPayload = { event, sessionId: getSessionId(), properties };

  try {
    const body = JSON.stringify(payload);
    const token = localStorage.getItem('access_token');
    
    if (navigator.sendBeacon) {
      // sendBeacon doesn't support custom headers, so skip if token is required
      if (!token) return;
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/events', blob);
      return;
    }
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    fetch('/api/events', {
      method: 'POST',
      headers,
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
  }
}
