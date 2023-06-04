export type MimeType = "plaintext/*" | "image/*";

export interface UserInfo {
    username: string;
    password: string;
    socket_id: string;
    shop_slug?: string;
    uuid?: string;
    firstname?: string;
    lastname?: string;
    phone_number?: string;
    email?: string;
    description?: string;
    front_id?: string;
}

export interface IChatOptions {
    url: string;
    uuid: string;
    userInfo?: UserInfo;
}

export interface IEvents {
    onConnect: (socketId: string)=> void;
    onDisconnect: (socketId: string)=> void;
    onNewMessage: (args: any) => void;
    onChatRoomCreated: (args: any) => void;
    onMarkAsRead: (args: any) => void;
    onInviteToRoom: (args: any) => void;
}

export interface IMessage {
    users: string[];
    message: string;
    mime_type: MimeType;
    user_id: number;
    front_path: string;
    to_id: number;
    reply_id: number;
    click_url: string;
    message_size: string;
    message_duration: string;
    status: string;
    uuid: string;
    chat_room_uuid: string;
    username: string;
    avatar: string;
    created_at: Date;
}