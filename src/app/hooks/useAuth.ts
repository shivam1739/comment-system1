'use client'
import { useState, useEffect } from 'react';
import { signInWithPopup, signOut, getAuth } from 'firebase/auth';
import { auth, provider } from '@/config/firebase';
import { getCookie, setCookie } from 'cookies-next';
import { User } from '@/utils/types';

const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            // Send the ID token to your server for verification
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);
                sessionStorage.setItem('user', JSON.stringify(data.data.user));
                setCookie('token', idToken); // Store token in cookies
            } else {
                setError('Server error');
                console.error('Server error:', await response.text());
            }
            if (idToken) {
                window.location.reload();
            }
        } catch (error) {
            setError('Error signing in');
            console.error('Error signing in:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            sessionStorage.clear();
            await signOut(auth);
            setUser(null);
            const res = await fetch('/api/logout');
            const response = await res.json();

            if (response?.success) {
                window.location.reload();
            }
        } catch (error) {
            setError('Error signing out');
            console.error('Error signing out:', error);
        }
    };

    const getUserInfoFromToken = async (idToken: string) => {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);
                sessionStorage.setItem('user', JSON.stringify(data.data.user));
            }
        } catch (error) {
            setError('Error fetching user info');
            console.error('Error fetching user info:', error);
        }
    };

    useEffect(() => {
        const cookie = getCookie('token');
        const userInfo: any = sessionStorage.getItem('user');
        if (cookie) {
            if (!userInfo) {
                getUserInfoFromToken(cookie as string);
            } else {
                const parsedUser: User = JSON.parse(userInfo);
                if (parsedUser) {
                    setUser(parsedUser);
                }
            }
            setLoading(false);
        } else {
            if (userInfo) {
                handleSignOut();
            } else {
                setLoading(false);
            }
        }
    }, []);

    return { user, loading, error, handleSignIn, handleSignOut };
};

export default useAuth;
