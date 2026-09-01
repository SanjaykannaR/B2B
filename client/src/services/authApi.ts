export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'driver' | 'executive';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const AUTH_TOKEN_KEY = 'b2b_auth_token';
export const AUTH_USER_KEY = 'b2b_auth_user';

export interface DemoCredential {
  label: string;
  email: string;
  password: string;
  role: User['role'];
  color: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  { label: 'Admin', email: 'admin@b2b.com', password: 'admin123', role: 'admin', color: '#3B82F6' },
  { label: 'Client', email: 'client@b2b.com', password: 'client123', role: 'client', color: '#10B981' },
  { label: 'Driver', email: 'driver@b2b.com', password: 'driver123', role: 'driver', color: '#8B5CF6' },
  { label: 'Executive', email: 'executive@b2b.com', password: 'executive123', role: 'executive', color: '#FF6B2C' },
];

const DEMO_USERS: Array<User & { password: string }> = DEMO_CREDENTIALS.map((cred, index) => ({
  id: `u-${cred.role}-${index + 1}`,
  name: cred.role.charAt(0).toUpperCase() + cred.role.slice(1) + ' User',
  email: cred.email,
  role: cred.role,
  password: cred.password,
}));

const API_TIMEOUT_MS = 2500;

function postLogin(email: string, password: string): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        clearTimeout(timer);
        const { token, user } = json?.data ?? json;
        if (!token || !user) throw new Error('Malformed auth response');
        resolve({ token, user });
      })
      .catch(() => {
        clearTimeout(timer);
        const match = DEMO_USERS.find((u) => u.email === email && u.password === password);
        if (match) {
          const { password: _pw, ...user } = match;
          resolve({ token: `demo-${user.role}-${Date.now()}`, user });
        } else {
          reject(new Error('Invalid email or password'));
        }
      });
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return postLogin(email.trim().toLowerCase(), password);
}

export function getProfile(): Promise<User | null> {
  try {
    const cached = localStorage.getItem(AUTH_USER_KEY);
    return Promise.resolve(cached ? (JSON.parse(cached) as User) : null);
  } catch {
    return Promise.resolve(null);
  }
}
