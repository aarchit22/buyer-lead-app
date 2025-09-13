'use client';

import { useActionState } from 'react';
import { login } from '@/lib/actions';

// Define the shape of the state object returned by our server action
type FormState = {
  error?: string;
};

export default function LoginPage() {
  const initialState: FormState = {};
  const [state, formAction] = useActionState(login, initialState);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="panel w-full max-w-sm space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Buyer Lead Intake</h1>
          <p className="text-sm text-muted">Sign in to your account</p>
        </header>
        <form className="space-y-5" action={formAction}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="username" className="form-label">Username</label>
              <input id="username" name="username" type="text" required className="form-field" defaultValue="admin" />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="form-label">Password</label>
              <input id="password" name="password" type="password" required className="form-field" />
            </div>
          </div>
          {state?.error && (
            <div className="text-sm error-text text-center bg-red-50 border border-red-200 rounded p-2">{state.error}</div>
          )}
          <button type="submit" className="btn btn-primary w-full">Log in</button>
        </form>
      </div>
    </main>
  );
}

