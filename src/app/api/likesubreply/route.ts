import { db } from "@/config/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export interface LikeSubReplyRequestBody {
    commentId: string;
    replyId: string;
    subReplyId: string;
    userId: string;
    action: 'like' | 'unlike';
}

export async function POST(req: NextRequest) {
    try {
        const body: LikeSubReplyRequestBody = await req.json();
        const { replyId, subReplyId, userId, action } = body;

        // Reference to the sub-reply document
        const subReplyRef = doc(db, `subreplies/${replyId}/replies`, subReplyId);

        if (action === 'like') {
            await updateDoc(subReplyRef, {
                likes: arrayUnion(userId)
            });
        } else if (action === 'unlike') {
            await updateDoc(subReplyRef, {
                likes: arrayRemove(userId)
            });
        }

        return NextResponse.json({ message: `Sub-reply ${action}d successfully`, success: true, action: action });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
