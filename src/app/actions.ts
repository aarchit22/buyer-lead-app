// app/actions.ts
'use server';

import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  // 1. Check if the credentials are valid
  if (
    username === process.env.DEMO_USER &&
    password === process.env.DEMO_PASSWORD
  ) {
    // 2. Create the JWT token
    const user = { username: 'admin' };
    const token = sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // 3. Set the cookie
    cookies().set('session', token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    // 4. Redirect to the main page
    redirect('/buyers');
  }

  // If login fails
  return { error: 'Invalid username or password' };
}