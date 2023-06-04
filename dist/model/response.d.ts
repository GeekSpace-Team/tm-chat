export interface IResponseMessage {
    tm: string;
    en: string;
}
export interface GResponse<T> {
    code: number;
    message: IResponseMessage;
    error: boolean;
    body: T;
}
export interface InitChatResponse {
    user: User;
    chatRoom: ChatRoom;
    sendMessage: SendMessage;
    oldRooms: ChatRoom[];
}
export interface ChatRoom {
    id: string;
    title: string;
    image: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
    shop_slug: string;
    is_used: boolean;
    uuid: string;
    users: User[];
}
export interface SendMessage {
    message: string;
}
export interface User {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    phone_number: string;
    email: string;
    image: string;
    uuid: string;
    usertype: string;
    created_at: Date;
    updated_at: Date;
    description: string;
    sell_point_uuid: null;
    is_deleted: boolean;
    front_id: string;
}
