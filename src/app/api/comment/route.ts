import { db } from "@/config/firebase";
import { CommentData, ReplyData } from "@/utils/types";
import { addDoc, collection, doc, getDoc, getDocs, getDocs as getDocsFromCollection, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Prepare comment data without replies (since they'll be stored separately)
    const commentData: CommentData = {
        userId: body.userId,
        userImageUrl: body.userImageUrl,
        username: body.username,
        commentText: body.commentText,
        timestamp: firebase.firestore.Timestamp.now(), // Use Firebase Timestamp
        likes: body.likes || [],
        replies: {} // Initialize replies object
    };

    try {
        // Start a Firestore batch operation
        const batch = writeBatch(db);

        // Add the main comment to the comments collection
        const commentRef = doc(collection(db, "comments")); // Create a reference without adding yet
        batch.set(commentRef, commentData);

        // Commit the batch operation to Firestore
        await batch.commit();

        return NextResponse.json({ message: "Comment and replies added successfully", commentId: commentRef.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}

export async function GET() {
    try {
        // Get all comments from the 'comments' collection
        const commentsSnapshot = await getDocs(collection(db, "comments"));
        const comments: CommentData[] = [];

        for (const commentDoc of commentsSnapshot.docs) {
            const commentData = commentDoc.data() as CommentData;
            const commentId = commentDoc.id;

            // Fetch replies for the current comment
            const repliesSnapshot = await getDocs(collection(db, `replies/${commentId}/replies`));
            const replies: { [key: string]: ReplyData } = {};

            for (const replyDoc of repliesSnapshot.docs) {
                const replyData = replyDoc.data() as ReplyData;
                const replyId = replyDoc.id;

                // Fetch sub-replies for the current reply
                const subRepliesSnapshot = await getDocs(collection(db, `subreplies/${replyId}/replies`));
                const subReplies: { [key: string]: ReplyData } = {};

                for (const subReplyDoc of subRepliesSnapshot.docs) {
                    subReplies[subReplyDoc.id] = subReplyDoc.data() as ReplyData;
                }


                replyData.replies = subReplies;
                replies[replyId] = replyData;
            }


            commentData.replies = replies;
            comments.push({ id: commentId, ...commentData });
        }

        return NextResponse.json(comments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}