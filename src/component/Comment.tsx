'use client'
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Reply from './Reply';
import { Quill } from 'react-quill';
import RichTextEditor from './TextEditor';
import { getUser } from '@/utils/commonUtils';


const Comment = (data: { commentData }) => {
    const [loading, setLoading] = useState(false)
    const [commentData, setCommentData] = useState(data.commentData)
    const user = getUser()
    const [replyText, setReplyText] = useState('')
    const [likeCount, setLikeCount] = useState(commentData?.likes?.length)
    const [liked, setLike] = useState(commentData?.likes?.includes(user?.email))
    const [isClickedReply, setIsClickedReply] = useState(false)
    const [replies, setReplies] = useState([])

    const handleAppendReply = (reply: any) => {
        setCommentData({ ...commentData, replies: { ...commentData?.replies, [reply.id]: reply } })
        setIsClickedReply(false)
        setReplyText('')

    }

    const handleAppendLike = (action: string) => {
        const count = action === 'like' ? +1 : -1
        setLikeCount(likeCount + count)
    }

    const handleRepliesSort = () => {
        const repliesArray: any = Object.keys(commentData.replies).map(item => ({ ...commentData?.replies[item], replyId: item }))

        repliesArray.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
        setReplies(repliesArray)
    }


    const handleLike = async () => {
        const res = await fetch('/api/likecomment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commentId: commentData?.id,
                userId: user?.email,
                action: liked ? 'unlike' : 'like'
            }),
        });
        const parseRes = await res.json()

        if (parseRes?.success) {
            handleAppendLike(parseRes?.action)

        } else {
            setLike(!liked)
        }

    }

    const handleSendReply = async (val) => {
        setLoading(true)
        const quill = new Quill(document.createElement('div')); // Create a temporary div
        quill.setContents(val); // Set the Delta content
        const htmlContent = quill.root.innerHTML; // Get the HTML content

        const response = await fetch('/api/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commentId: commentData?.id,
                userId: user?.email,
                userImageUrl: user?.picture,
                username: user?.name,
                replyText: htmlContent,
            }),
        });
        const data = await response.json()

        if (data.message === "Reply added successfully") {
            const reply = data?.data
            handleAppendReply(reply)
        }
        setLoading(false)
    }

    useEffect(() => {
        handleRepliesSort()
    }, [commentData])


    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && commentData.commentText) {
            // Initialize Quill editor
            const quill = new Quill(containerRef.current, {
                theme: 'bubble', // Use a read-only theme
                readOnly: true,
                modules: {
                    toolbar: false // Disable the toolbar
                }
            });

            // Set content
            if (typeof commentData.commentText === 'string') {
                // Assuming it's HTML if it's a string
                containerRef.current.innerHTML = commentData.commentText;
            } else {
                // Assuming it's Delta if it's an object
                quill.setContents(commentData.commentText);
            }
        }

        if (Object.keys(commentData?.replies).length) {
            handleRepliesSort()


        }
    }, [commentData.commentText]);


    return (
        <div className='mt-6'>
            <StyledCommentWrapper>
                <StyledTitle className='flex gap-3'> <Image className='rounded-full' src={commentData?.userImageUrl
                } alt="Google Icon" width={30} height={30} />  {commentData.username}</StyledTitle>
                <StyledContent ref={containerRef}></StyledContent>
                <StyledFooter >
                    <div onDoubleClick={() => {
                        setLike(!liked)
                        handleLike()
                    }} className='cursor-pointer flex gap-1'>
                        {liked ? <Image src="/like.svg" alt="like icon" width={20} height={20} /> : <Image src="/unlike.svg" alt="unlike Icon" width={20} height={20} />}
                        {likeCount || 0}
                    </div>
                    | <StyledReplyBtn onClick={() => setIsClickedReply(!isClickedReply)} > <span className={` ${isClickedReply ? 'text-black' : 'text-gray-400'} select-none`}>Reply</span> </StyledReplyBtn>
                </StyledFooter>

                {isClickedReply && <div className='w-full' >

                    <div className='flex h-full w-full'>
                        <div className=' w-[2px] min-h-fit bg-gray-400 '></div>
                        <div className='w-[100%] ml-6'>
                            <RichTextEditor text={replyText} setText={setReplyText} handleSend={handleSendReply} closeEditor={() => setIsClickedReply(false)} showCancleBtn={true} loading={loading} />
                        </div>

                    </div>

                </div>}
            </StyledCommentWrapper>
            {Object.keys(commentData?.replies).length > 0 && <div className='ml-4'>
                {replies.map((item: any) =>
                    <>
                        <div className=' w-full h-[1px] bg-gray-400  my-6'></div>
                        <Reply key={item.replyId} commentData={{ ...item, commentId: commentData.id }} />

                    </>
                )}
            </div>}
        </div>
    )
}
const StyledTitle = styled('div')`
    
`
const StyledFooter = styled('div')`
display: flex;
flex-direction: row;
gap: 5px;

    
`
const StyledReplyBtn = styled('div')`
color: ${(props: any) => props.active ? 'black' : 'gray'};
/* Add additional styles as needed */
`;

const StyledContent = styled('div')`
font-weight: 400;
color: gray;
    
`
const StyledCommentWrapper = styled('div')`
display: flex;
gap: 1rem;
flex-direction: column;

    
`

export default Comment