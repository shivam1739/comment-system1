import { db } from "@/config/firebase";
import { ReplyData } from "@/utils/types";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { commentId } = body;

    // Prepare reply data
    const replyData: ReplyData = {
        userId: body.userId,
        userImageUrl: body.userImageUrl,
        username: body.username,
        replyText: body.replyText,
        timestamp: firebase.firestore.Timestamp.now(), // Use Firebase Timestamp
        likes: body.likes || [],
        replies: {}, // Initialize subreplies object
    };

    try {

        const repliesCollectionRef = collection(db, `replies/${commentId}/replies`);


        const replyDocRef = await addDoc(repliesCollectionRef, replyData);


        const replyId = replyDocRef.id;


        const commentRef = doc(db, "comments", commentId);


        await updateDoc(commentRef, {
            [`replies.${replyId}`]: replyDocRef.path,
        });

        return NextResponse.json({ message: "Reply added successfully", replyId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
