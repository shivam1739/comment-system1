import { db } from "@/config/firebase";
import { ReplyData } from "@/utils/types";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { commentId, replyId } = body; // We expect both commentId and replyId to be provided in the request

    // Prepare sub-reply data
    const subReplyData: ReplyData = {
        userId: body.userId,
        userImageUrl: body.userImageUrl,
        username: body.username,
        replyText: body.replyText,
        timestamp: firebase.firestore.Timestamp.now(), // Use Firebase Timestamp
        likes: body.likes || [],
        replies: {}, // Initialize sub-replies object
    };

    try {
        // Get a reference to the sub-replies sub-collection under the specified reply
        const subRepliesCollectionRef = collection(db, `subreplies/${replyId}/replies`);

        // Add the sub-reply to the sub-replies sub-collection and get the document reference
        const subReplyDocRef = await addDoc(subRepliesCollectionRef, subReplyData);

        // Get the document ID of the newly created sub-reply
        const subReplyId = subReplyDocRef.id;

        // Get a reference to the parent reply document
        const parentReplyRef = doc(db, `replies/${commentId}/replies`, replyId);

        // Update the replies map in the parent reply document with the reference to the newly created sub-reply
        await updateDoc(parentReplyRef, {
            [`replies.${subReplyId}`]: subReplyDocRef.path, // Store the path to the sub-reply document
        });

        return NextResponse.json({ message: "Sub-reply added successfully", subReplyId });
    } catch (error:any) {
        return NextResponse.json({ error: error.message });
    }
}
