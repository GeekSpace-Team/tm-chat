import axios, { AxiosInstance } from "axios";
import { Socket, io } from "socket.io-client";
import { IChatOptions, IEvents, IMessage, UserInfo } from "./model/model";
import { ChatRoom, GResponse, InitChatResponse, User } from "./model/response";

class TmChat {
  public fetcher: AxiosInstance;
  public realtime: Socket;
  public socketId: string;
  public userId: string;
  public user: User;
  public chats: IMessage[] = [];
  public room: ChatRoom;
  public rooms: any = [];
  private events: IEvents;
  constructor(private readonly chat: IChatOptions) {
    this.fetcher = axios.create({
      baseURL: this.chat.url,
    });
  }

  public async connect(events: IEvents) {
    this.events = events;
    this.realtime = io(this.chat.url, {
      autoConnect: true,
      reconnectionDelayMax: 1000,
      timeout: 100000,
      query: {
        uuid: this.chat.uuid,
      },
    });
    this.createEvents(events);
  }

  private isExistMessage(args:any):boolean {
     let found = this.chats.filter((ch) => ch.uuid === args.uuid);
      if (found.length <= 0) {
        let isReceive = args.users.includes(this.userId);
        return isReceive;
      } else {
        return false;
      }
  }

  public async createEvents(events: IEvents) {
    this.realtime.on("connect", () => {
      console.log("Connected", this.realtime.id);
      this.socketId = this.realtime.id;
      events.onConnect(this.socketId);
    });

    this.realtime.on("disconnect", () => {
      console.log("disconnected", this.socketId);
      this.socketId = this.realtime.id;
      events.onDisconnect(this.socketId);
    });

    this.realtime.on("onNewMessage", (args) => {
        let isReceive = this.isExistMessage(args);
        if (isReceive) {
          events.onNewMessage(args);
          this.chats.push(args);
        }
    });

    this.realtime.on("onChatRoomCreated", (args) => {
      let found = this.rooms.filter((ch: any) => ch.uuid === args.uuid);
      if (found.length <= 0) {
        let isReceive = args.users
          .map((it: any) => it.id)
          .includes(this.userId);
        if (isReceive) {
          events.onChatRoomCreated(args);
          this.rooms.push(args);
        }
      }
    });

    this.realtime.on("onMarkAsRead", (args) => {
      events.onMarkAsRead(args);
    });

    this.realtime.on("onInviteChatRoom", (args) => {
      events.onInviteToRoom(args);
    })
  }

 


  public async initChat(user: UserInfo): Promise<GResponse<InitChatResponse>> {
    return new Promise<GResponse<InitChatResponse>>((resolve, reject) => {
      try {
        this.fetcher
          .post<GResponse<InitChatResponse>>("/api/v1/chat/init-chat", user)
          .then((response) => {
            this.userId = response.data.body.user.id;
            this.user = response.data.body.user;
            this.room = response.data.body.chatRoom;
            try {
              this.rooms = response.data.body.oldRooms;
              response.data.body.oldRooms.forEach((roomInfo) => {
                this.events.onChatRoomCreated(null);
              });
            } catch (err) {
              console.log(err);
            }
            resolve(response.data);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async sendMessage(
    text: string,
    front_path: string,
    chat_room_uuid?: string
  ): Promise<GResponse<IMessage>> {
    try {
      let message: IMessage = {
        avatar: this.user.image,
        chat_room_uuid: chat_room_uuid ? chat_room_uuid : this.room.uuid,
        click_url: this.chat.url,
        front_path: front_path,
        message: text,
        message_duration: "0",
        message_size: "0",
        mime_type: "plaintext/*",
        reply_id: 0,
        status: "sent",
        to_id: 0,
        user_id: Number(this.userId),
        username: this.user.username,
        uuid: "",
        users: [],
        created_at: new Date(),
      };
      return new Promise<GResponse<IMessage>>((resolve, reject) => {
        this.fetcher
          .post<GResponse<IMessage>>("/api/v1/chat/send-message", message)
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => reject(error));
      });
    } catch (err) {
      throw err;
    }
  }

  public async sendImageMessage(
    image: File,
    front_path: string,
    chat_room_uuid?: string
  ): Promise<GResponse<IMessage>> {
    try {
      let data = new FormData();
      data.append("avatar", this.user.image);
      data.append(
        "chat_room_uuid",
        chat_room_uuid ? chat_room_uuid : this.room.uuid
      );
      data.append("click_url", this.chat.url);
      data.append("front_path", front_path);
      data.append("message", "");
      data.append("message_duration", "0");
      data.append("message_size", "0");
      data.append("mime_type", "image/*");
      data.append("reply_id", null);
      data.append("status", "sent");
      data.append("to_id", "0");
      data.append("user_id", this.userId);
      data.append("username", this.user.username);
      data.append("uuid", "");
      data.append("users", "");
      data.append("image", image);
      data.append("created_at", new Date().toDateString());
      return new Promise<GResponse<IMessage>>((resolve, reject) => {
        this.fetcher
          .post<GResponse<IMessage>>("/api/v1/chat/send-image", data, {
            headers: {
              "content-type": "multipart/form-data",
            },
          })
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => reject(error));
      });
    } catch (err) {
      throw err;
    }
  }

  public async getChatRoomMessages(
    chat_room_uuid: string
  ): Promise<IMessage[]> {
    return new Promise<IMessage[]>((resolve, reject) => {
      try {
        this.fetcher
          .get<GResponse<IMessage[]>>(`/api/v1/chat/get-chat-room-messages/${chat_room_uuid}`)
          .then((result) => {
            let msgs = result.data.body
            resolve(msgs);
          })
          .catch((err) => reject(err));
      } catch (err) {
        throw err;
      }
    });
  }

  public async sendMessageToRoom(
    chat_room_uuid: string,
    text: string,
    front_path: string
  ) {
    return this.sendMessage(text, front_path, chat_room_uuid);
  }

  public async sendImageToRoom(
    chat_room_uuid: string,
    image: File,
    front_path: string
  ){
    return this.sendImageMessage(image, front_path, chat_room_uuid);
  }

  public getImageFullUrl(image: string){
    try{
      return `${this.chat.url}/${image}`;
    } catch(err){
      return "";
    }
  }

  public async leaveChatRoom(roomId: string){
    return new Promise((resolve, reject) => {
      try{
        this.fetcher.post(`/api/v1/chat/leave-chat-room/${this.user.id}/${roomId}`)
        .then(result=>{
          resolve('Success');
        })
        .catch(err=>{
          reject(err);
        })
      } catch(err){
        reject(err);
      }
    })
  }

  public async getChatRoomDetails(chatRoomUUID: string){
    return new Promise((resolve, reject) =>{
      try{
        this.fetcher.get(`/api/v1/chat/get-chat-room-details/${chatRoomUUID}`)
        .then(response=>{
          resolve(response.data)
        })
        .catch(err=>{
          reject(err)
        })
      } catch(err){
        reject(err);
      }
    })
  }

  public async inviteChatRoom(chatRoomUUID:string, userId: number){
    return new Promise((resolve, reject) =>{
      try{
        this.fetcher.post('/api/v1/chat/invite-chat-room',{
          roomUUID: chatRoomUUID,
          userId: userId
        }).then(result=>{
          resolve(result);
        }).catch(err=>{
          reject(err);
        })
      } catch(err){
        reject(err);
      }
    })
  }

}

export default TmChat;
