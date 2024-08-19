'use client'
import Comment from "@/component/Comment";
import RichTextEditor from "@/component/TextEditor";
import { useEffect, useState } from "react";
import useGetUserInfo from "./hooks/getUserInfo";
import { Quill } from "react-quill";
import { getUser } from "@/utils/commonUtils";


export default function Home() {

  const [comments, setComments] = useState([])
  const user = getUser()
  const [text, setText] = useState('');


  const getComments = async () => {
    try {
      const response = await fetch('/api/comment');

      // Check if the response is okay (status code 200-299)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the response as JSON
      const data = await response.json();

      // Log and set the comments
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }

  }

  useEffect(() => {
    getComments()
  }, [])

  const handleSendComment = async (val: any) => {

    const quill = new Quill(document.createElement('div')); // Create a temporary div
    quill.setContents(val); // Set the Delta content
    const htmlContent = quill.root.innerHTML; // Get the HTML content

    const response = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "userId": user.email,
        "userImageUrl": user.picture,
        "commentText": htmlContent,
        "username": user.name
      }),
    });
    const data = await response.json()
    if (data.message === "Comment and replies added successfully") {
      getComments()
      setText('')
    }


  }



  return (
    <div className="shadow-md w-2/4 m-auto px-7" >
      <RichTextEditor handleSend={handleSendComment} text={text} setText={setText} showCancleBtn={false} />


      <div className="py-4">
        {
          comments.map((item) => <Comment key={item} commentData={item} />)
        }

      </div>

    </div>
  );
}
