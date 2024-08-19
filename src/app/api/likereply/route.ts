import { db } from "@/config/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export interface LikeReplyRequestBody {
    commentId: string;
    replyId: string;
    userId: string;
    action: 'like' | 'unlike';
}

export async function POST(req: NextRequest) {
    try {
        const body: LikeReplyRequestBody = await req.json();
        const { commentId, replyId, userId, action } = body;

        const replyRef = doc(db, `replies/${commentId}/replies`, replyId);

        if (action === 'like') {
            await updateDoc(replyRef, {
                likes: arrayUnion(userId)
            });
        } else if (action === 'unlike') {
            await updateDoc(replyRef, {
                likes: arrayRemove(userId)
            });
        }

        return NextResponse.json({ message: `Reply ${action}d successfully` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
