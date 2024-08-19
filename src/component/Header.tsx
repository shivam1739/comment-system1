'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/config/firebase';
import { getCookie, setCookie } from 'cookies-next';
import { User } from '@/utils/types';
import { useRouter } from 'next/navigation';


const Header = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const handleSignOut = async () => {
        try {
            sessionStorage.clear()
            await auth.signOut(); // Sign out the user

            setUser(null); // Clear user state
            const res = await fetch('/api/logout');
            const response = await res.json()

            if (response?.success) {

                window.location.reload();

            }
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const getUserInfoFromToken = async (idToken: string) => {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });


        if (response.ok) {
            const data = await response.json();
            setUser(data.data.user); // Set the authenticated user data
            sessionStorage.setItem('user', JSON.stringify(data.data.user))

        }
    }

    useEffect(() => {
        const cookie = getCookie("token")
        const userInfo: any = sessionStorage.getItem('user')
        if (cookie) {
            if (!userInfo) {
                getUserInfoFromToken(cookie)
            }
            else {
                const parsedUser: User = JSON.parse(userInfo);
                if (parsedUser) {
                    setUser(parsedUser)

                }

            }
            // window.location.reload();
        } else {
            if (userInfo) {
                handleSignOut()
            }
        }
    }, [])


    const handleSignIn = async () => {
        setLoading(true);
        try {
            // Open Google Sign-In popup

            if (!getCookie("token")) {
                const result = await signInWithPopup(auth, provider);
                const user = result.user; // Firebase user object
                const idToken = await user.getIdToken(); // Get the ID token from the user


                // Send the ID token to your server for verification
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });


                if (response.ok) {
                    const data = await response.json();
                    setUser(data.data.user); // Set the authenticated user data
                    sessionStorage.setItem('user', JSON.stringify(data.data.user))


                } else {
                    console.error('Server error:', await response.text());
                }

                if (idToken) {
                    window.location.reload();

                }
            }


        } catch (error) {
            console.error('Error signing in:', error);
        } finally {
            setLoading(false);
        }
    };




    return (
        <StyledHeader >
            {!user ? <div onClick={() => handleSignIn()} className='flex items-center gap-x-4'>
                <Image src="/google.svg" alt="Google Icon" width={37} height={37} />
                Sign with the Google
            </div> : <div className='flex justify-between w-full items-center'><div className='flex items-center gap-3'> <Image className='rounded-full' src={user?.picture} alt="user img" width={37} height={37} />{user.name} </div> <button onClick={() => handleSignOut()}>Logout</button> </div>}


        </StyledHeader>
    )
}

const StyledHeader = styled('div')`
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: end;
    padding: 1rem;
    cursor: pointer;
`

export default Header