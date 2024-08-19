import firebase from "firebase/compat/app";

export type userID = {
    userId: string;
};

export interface ReplyOfReplyData {
    userId: string;
    userImageUrl: string;
    username: string;
    replyText: string;
    timestamp?: { seconds: number; nanoseconds: number };
    likes?: userID[];
}

export interface ReplyData {
    userId: string;
    userImageUrl: string;
    username: string;
    replyText: string;
    timestamp?: { seconds: number; nanoseconds: number };
    likes?: userID[];
    replies?: { [key: string]: ReplyOfReplyData }; // Replies stored as an object
}

export interface CommentData {
    id?: string;
    userId: string;
    userImageUrl: string;
    username: string;
    commentText: string;
    timestamp?: { seconds: number; nanoseconds: number };
    replies?: { [key: string]: ReplyData }; // Replies stored as an object
    likes?: userID[];
}

export interface AddReplyRequestBody {
    commentId: string;
    replyData: ReplyData;
    replyId?: string; // Optional replyId for adding to a specific reply
}


export interface User {
    id: string;
    name: string;
    email: string;
    picture?: string | null
    // Add other properties as needed
}

export interface RichTextEditorProps {
    handleSend: (value: string) => void;
    text: string
    setText: (value: string) => void;
    closeEditor?: (value?: string) => void;
    showCancleBtn?: boolean

}