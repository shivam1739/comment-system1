"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import RichTextEditor from "./TextEditor";
import { Quill } from "react-quill";
import NestedReply from "./NestedReply";
import { getUser } from "@/utils/commonUtils";
import useAuth from "@/app/hooks/useAuth";

const Reply = (replyData: { commentData }) => {
  const user = getUser();
  const [commentData, setCommentData] = useState(replyData.commentData);
  const [liked, setLike] = useState(commentData?.likes?.includes(user?.email));
  const [likeCount, setLikeCount] = useState(commentData?.likes?.length);
  const [isClickedReply, setIsClickedReply] = useState(false);
  const [text, setText] = useState("");
  const [replies, setReplies] = useState([]);

  const { handleSignIn } = useAuth();

  const checkUserAuthenticate = () => {
    if (!user) {
      handleSignIn();
    } else {
      return true;
    }
  };

  const handleAppendReply = (reply: any) => {
    setCommentData({
      ...commentData,
      replies: { ...commentData?.replies, [reply.id]: reply },
    });
    setIsClickedReply(false);
  };

  const handleAppendLike = (action: string) => {
    const count = action === "like" ? +1 : -1;
    setLikeCount(likeCount + count);
  };

  const handleRepliesSort = () => {
    const repliesArray: any = Object.keys(commentData.replies).map((item) => ({
      ...commentData?.replies[item],
      replyId: commentData?.replyId,
      nestedReplyId: item,
    }));

    repliesArray.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
    setReplies(repliesArray);
  };

  useEffect(() => {
    handleRepliesSort();
  }, [commentData]);

  const handleLike = async () => {
    const res = await fetch("/api/likereply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commentId: commentData?.commentId,
        userId: user?.email,
        action: liked ? "unlike" : "like",
        replyId: commentData?.replyId,
      }),
    });
    const parseRes = await res.json();

    if (parseRes?.success) {
      handleAppendLike(parseRes?.action);
    } else {
      setLike(!liked);
    }
  };

  const handleSendReply = async (val) => {
    const quill = new Quill(document.createElement("div")); // Create a temporary div
    quill.setContents(val); // Set the Delta content
    const htmlContent = quill.root.innerHTML; // Get the HTML content
    const response = await fetch("/api/reply/subreply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commentId: commentData?.commentId,
        replyId: commentData?.replyId,
        userId: user.email,
        userImageUrl: user?.picture,
        username: user?.name,
        replyText: htmlContent,
      }),
    });
    const data = await response.json();

    if (data.success) {
      handleAppendReply(data?.data);
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
            {likeCount}
          </div>
          |
          <StyledReplyBtn onClick={() => setIsClickedReply(!isClickedReply)}>
            <span
              className={` ${
                isClickedReply ? "text-black" : "text-gray-400"
              } select-none`}
            >
              Reply
            </span>
          </StyledReplyBtn>
        </StyledFooter>

        {isClickedReply && (
          <div className="w-full">
            <div className=" w-full h-[1px] bg-gray-400 mb-6"></div>
            <div className="flex h-full w-full">
              <div className=" w-[2px] min-h-fit bg-gray-400 "></div>
              <div className="w-[100%] ml-6">
                <RichTextEditor
                  handleSend={(val) => {
                    const isUserLogedIn = checkUserAuthenticate();
                    if (isUserLogedIn) {
                      handleSendReply(val);
                    }
                  }}
                  text={text}
                  setText={setText}
                  showCancleBtn={true}
                  closeEditor={() => setIsClickedReply(false)}
                />
              </div>
            </div>
          </div>
        )}
      </StyledCommentWrapper>
      {Object.keys(commentData?.replies).length > 0 && (
        <div className="ml-8">
          {replies.map((item) => (
            <>
              <NestedReply key={item} commentData={item} />
              <div className=" w-full h-[1px] bg-gray-400 mb-6"></div>
            </>
          ))}
        </div>
      )}
    </div>
  );
};
const StyledTitle = styled("div")``;
const StyledFooter = styled("div")`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;
const StyledReplyBtn = styled("div")`
  color: ${(props: any) => (props.active ? "black" : "gray")};
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

export default Reply;
