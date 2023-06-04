# TmChat

This is chat system for bazar.com.tm

### Note

This chat system works like a group chat (in code chat room).
One chat room includes one or many users.
This is not person to person chat.
This is group chat. But if chat room has 2 person it will work like person to person chat.
Everytime user click the chat, chat system will create new chat room.

## Installation

Only one package installation required

```bash
  npm install tm-chat
```

Or with yarn

```bash
  yarn add tm-chat
```

## Usage

import TmChat first

```javascript
import TmChat from "tm-chat";
```

Create chat variable with TmChat class:

```javascript
const chat = new TmChat({
  url: "https://chat.bazar.com.tm", // or any host, this is chat backend host address
  uuid: window.localStorage.getItem("uuid"), // this is user uuid
});
```

Connect chat socket with events:

```javascript
function startChat() {
  chat.connect({
    onConnect: (id) => {
      initChat(id);
    },
    onDisconnect: (id) => {
      console.log(id);
    },
    onNewMessage: (args) => {
      console.log("onNewMessage", chat.chats, args);
    },
    onChatRoomCreated: (room) => {
      if (room !== null) {
        console.log("onChatRoomCreated", room);
      }
    },
    onMarkAsRead: (ids) => {
      console.log("onMarkAsRead", ids);
    },
    onInviteToRoom: (args) => {
      console.log("onInviteToRoom", args);
    },
  });
}
```

After startChat(), create initChat function:

```javascript
function initChat(id) {
  console.log("initChat", chat.socketId);
  chat
    .initChat({
      socket_id: chat.socketId,
      username: username,
      password: password,
      shop_slug: shopSlug,
      phone_number: phone,
      email: email,
      firstname: firstName,
      lastname: lastName,
      uuid: uuid,
    })
    .then((result) => {
      window.localStorage.setItem("uuid", result.body.user.uuid);
      console.log(chat.user.image);
    })
    .catch((err) => {
      console.log(err);
    });
}
```

Let's send text message:

```javascript
// This method has 2 paramaters, (text message, front end location)
chat
  .sendMessage(msg, window.location.pathname)
  .then((response) => {
    console.log("sent message", response);
  })
  .catch((err) => {
    console.log("error sending message", err);
    // alert(err);
  });
```

Send text message to specific chat room:

```javascript
// this method for only moderators and admin
chat
  .sendMessageToRoom(chatRoomUUID, textMessage, window.location.pathname)
  .then((response) => {
    console.log("sent message", response);
  })
  .catch((err) => {
    console.log("error sending message", err);
    // alert(err);
  });
```

Send image message:

```javascript
chat
  .sendImageMessage(file, window.location.pathname)
  .then((response) => {
    console.log("sent image message", response);
  })
  .catch((err) => {
    alert(err);
  });
```

Send image message to specific chat room:

```javascript
chat
  .sendImageToRoom(roomUUID, file, window.location.pathname)
  .then((response) => {
    console.log("sent image message", response);
  })
  .catch((err) => {
    alert(err);
  });
```

Get list of specific chat room messages:

```javascript
chat.getChatRoomMessages(roomUUID).then((response) => {
  console.log(response);
});
```

List of other chat methods:

```javascript
inviteChatRoom(chatRoomUUID:string, userId: number)
getChatRoomDetails(chatRoomUUID: string)
leaveChatRoom(roomId: string)
getImageFullUrl(image: string)
```

List of chat class properties:

```javascript
chat.fetcher; // this axios instance for only chat requets
chat.realtime; // this is socket io client
chat.socketId; // this is your socket id on server side
chat.userId; // this is your id as number
chat.user; // this is your all profile information
chat.chats; // this message list for all chat rooms
chat.room; // this your current chat room, this property commonly use for simple users
chat.rooms; // this is your chat rooms history, this property use for moderators and admin, because this users can see old chat rooms
```

List of chat models:

```javascript
// To create user
interface UserInfo {
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

// chat events
interface IEvents {
  onConnect: (socketId: string) => void;
  onDisconnect: (socketId: string) => void;
  onNewMessage: (args: any) => void;
  onChatRoomCreated: (args: any) => void;
  onMarkAsRead: (args: any) => void;
  onInviteToRoom: (args: any) => void;
}

// single message
interface IMessage {
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

// initChat function response
interface InitChatResponse {
  user: User;
  chatRoom: ChatRoom;
  sendMessage: SendMessage;
  oldRooms: ChatRoom[];
}

// chat room model
interface ChatRoom {
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

interface SendMessage {
  message: string;
}

// created user model
interface User {
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
```
