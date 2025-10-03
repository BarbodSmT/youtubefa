'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { User } from '@/types';
export default function AuthInitializer() {
  const dispatch = useDispatch();
  const { token: tokenInState } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (tokenInState) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');

      if (token && userString) {
        const user: User = JSON.parse(userString);
        dispatch(setCredentials({ user, token }));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    }
  }, [dispatch, tokenInState]);

  return null;
}