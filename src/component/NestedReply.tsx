"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Quill } from "react-quill";
import { getUser } from "@/utils/commonUtils";
import useAuth from "@/app/hooks/useAuth";

const NestedReply = ({ commentData }) => {
  const user = getUser();

  const [liked, setLike] = useState(commentData?.likes?.includes(user?.email));
  const [likeCount, setLikeCount] = useState(commentData?.likes?.length);

  const { handleSignIn } = useAuth();

  const checkUserAuthenticate = () => {
    if (!user) {
      handleSignIn();
    } else {
      return true;
    }
  };

  const handleAppendLike = (action: string) => {
    const count = action === "like" ? +1 : -1;
    setLikeCount(likeCount + count);
  };

  const handleLike = async () => {
    const res = await fetch("/api/likesubreply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commentId: commentData?.commentId,
        userId: user?.email,
        action: liked ? "unlike" : "like",
        replyId: commentData?.replyId,
        subReplyId: commentData?.nestedReplyId,
      }),
    });

    const parseRes = await res.json();

    if (parseRes?.success) {
      handleAppendLike(parseRes?.action);
    } else {
      setLike(!liked);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && commentData.replyText) {
      // Initialize Quill editor
      const quill = new Quill(containerRef.current, {
        theme: "bubble", // Use a read-only theme
        readOnly: true,
        modules: {
          toolbar: false, // Disable the toolbar
        },
      });

      // Set content
      if (typeof commentData?.replyText === "string") {
        // Assuming it's HTML if it's a string
        containerRef.current.innerHTML = commentData?.replyText;
      } else {
        // Assuming it's Delta if it's an object
        quill.setContents(commentData.replyText);
      }
    }
  }, [commentData.commentText]);
  return (
    <div className="mt-6">
      <StyledCommentWrapper>
        <StyledTitle className="flex gap-3">
          <Image
            className="rounded-full"
            src={commentData?.userImageUrl}
            alt="Google Icon"
            width={30}
            height={30}
          />
          {commentData.username}
        </StyledTitle>
        <StyledContent ref={containerRef}></StyledContent>

        <StyledFooter>
          <div
            onDoubleClick={() => {
              const isUserLogedIn = checkUserAuthenticate();
              if (isUserLogedIn) {
                setLike(!liked);
                handleLike();
              }
            }}
            className="cursor-pointer flex gap-1"
          >
            {liked ? (
              <Image src="/like.svg" alt="like icon" width={20} height={20} />
            ) : (
              <Image
                src="/unlike.svg"
                alt="unlike Icon"
                width={20}
                height={20}
              />
            )}
            {likeCount || 0}
          </div>
        </StyledFooter>
      </StyledCommentWrapper>
    </div>
  );
};
const StyledTitle = styled("div")``;
const StyledFooter = styled("div")`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;

const StyledContent = styled("div")`
  font-weight: 400;
  color: gray;
`;

const StyledCommentWrapper = styled("div")`
  display: flex;
  gap: 1rem;
  flex-direction: column;
`;

export default NestedReply;
