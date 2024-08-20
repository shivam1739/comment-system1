import { db } from "@/config/firebase";
import { ReplyData } from "@/utils/types";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { commentId } = body;


    const replyData: ReplyData = {
        userId: body.userId,
        userImageUrl: body.userImageUrl,
        username: body.username,
        replyText: body.replyText,
        timestamp: firebase.firestore.Timestamp.now(),
        likes: body.likes || [],
        replies: {},
    };

    try {

        const repliesCollectionRef = collection(db, `replies/${commentId}/replies`);


        const replyDocRef = await addDoc(repliesCollectionRef, replyData);


        const replyId = replyDocRef.id;


        const commentRef = doc(db, "comments", commentId);


        await updateDoc(commentRef, {
            [`replies.${replyId}`]: replyDocRef.path,
        });

        return NextResponse.json({
            message: "Reply added successfully", data: {
                id: replyId,
                userId: body.userId,
                userImageUrl: body.userImageUrl,
                username: body.username,
                replyText: body.replyText,
                timestamp: firebase.firestore.Timestamp.now(),
                likes: [],
                replies: {},
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
