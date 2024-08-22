"use client";
import useAuth from "@/app/hooks/useAuth";
import { getUser } from "@/utils/commonUtils";
import Image from "next/image";

import styled from "styled-components";

const Header = () => {
  const user = getUser();
  const { handleSignIn, handleSignOut } = useAuth();

  return (
    <StyledHeader className="bg-white">
      {!user ? (
        <div onClick={handleSignIn} className="flex items-center gap-x-4">
          <Image src="/google.svg" alt="Google Icon" width={37} height={37} />
          Sign in with Google
        </div>
      ) : (
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-3">
            <Image
              className="rounded-full"
              src={user.picture}
              alt="User Image"
              width={37}
              height={37}
            />
            {user.name}
          </div>
          <button onClick={handleSignOut}>Logout</button>
        </div>
      )}
    </StyledHeader>
  );
};

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: end;
  padding: 1rem;
  cursor: pointer;
`;

export default Header;
