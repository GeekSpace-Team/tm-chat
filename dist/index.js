"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var socket_io_client_1 = require("socket.io-client");
var TmChat = /** @class */ (function () {
    function TmChat(chat) {
        this.chat = chat;
        this.chats = [];
        this.rooms = [];
        this.fetcher = axios_1.default.create({
            baseURL: this.chat.url,
        });
    }
    TmChat.prototype.connect = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.events = events;
                this.realtime = (0, socket_io_client_1.io)(this.chat.url, {
                    autoConnect: true,
                    reconnectionDelayMax: 1000,
                    timeout: 100000,
                    query: {
                        uuid: this.chat.uuid,
                    },
                });
                this.createEvents(events);
                return [2 /*return*/];
            });
        });
    };
    TmChat.prototype.isExistMessage = function (args) {
        var found = this.chats.filter(function (ch) { return ch.uuid === args.uuid; });
        if (found.length <= 0) {
            var isReceive = args.users.includes(this.userId);
            return isReceive;
        }
        else {
            return false;
        }
    };
    TmChat.prototype.createEvents = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.realtime.on("connect", function () {
                    console.log("Connected", _this.realtime.id);
                    _this.socketId = _this.realtime.id;
                    events.onConnect(_this.socketId);
                });
                this.realtime.on("disconnect", function () {
                    console.log("disconnected", _this.socketId);
                    _this.socketId = _this.realtime.id;
                    events.onDisconnect(_this.socketId);
                });
                this.realtime.on("onNewMessage", function (args) {
                    var isReceive = _this.isExistMessage(args);
                    if (isReceive) {
                        events.onNewMessage(args);
                        _this.chats.push(args);
                    }
                });
                this.realtime.on("onChatRoomCreated", function (args) {
                    var found = _this.rooms.filter(function (ch) { return ch.uuid === args.uuid; });
                    if (found.length <= 0) {
                        var isReceive = args.users
                            .map(function (it) { return it.id; })
                            .includes(_this.userId);
                        if (isReceive) {
                            events.onChatRoomCreated(args);
                            _this.rooms.push(args);
                        }
                    }
                });
                this.realtime.on("onMarkAsRead", function (args) {
                    events.onMarkAsRead(args);
                });
                this.realtime.on("onInviteChatRoom", function (args) {
                    events.onInviteToRoom(args);
                });
                return [2 /*return*/];
            });
        });
    };
    TmChat.prototype.initChat = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            _this.fetcher
                                .post("/api/v1/chat/init-chat", user)
                                .then(function (response) {
                                _this.userId = response.data.body.user.id;
                                _this.user = response.data.body.user;
                                _this.room = response.data.body.chatRoom;
                                try {
                                    _this.rooms = response.data.body.oldRooms;
                                    response.data.body.oldRooms.forEach(function (roomInfo) {
                                        _this.events.onChatRoomCreated(null);
                                    });
                                }
                                catch (err) {
                                    console.log(err);
                                }
                                resolve(response.data);
                            })
                                .catch(function (err) {
                                reject(err);
                            });
                        }
                        catch (err) {
                            reject(err);
                        }
                    })];
            });
        });
    };
    TmChat.prototype.sendMessage = function (text, front_path, chat_room_uuid) {
        return __awaiter(this, void 0, void 0, function () {
            var message_1;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    message_1 = {
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
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            _this.fetcher
                                .post("/api/v1/chat/send-message", message_1)
                                .then(function (response) {
                                resolve(response.data);
                            })
                                .catch(function (error) { return reject(error); });
                        })];
                }
                catch (err) {
                    throw err;
                }
                return [2 /*return*/];
            });
        });
    };
    TmChat.prototype.sendImageMessage = function (image, front_path, chat_room_uuid) {
        return __awaiter(this, void 0, void 0, function () {
            var data_1;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    data_1 = new FormData();
                    data_1.append("avatar", this.user.image);
                    data_1.append("chat_room_uuid", chat_room_uuid ? chat_room_uuid : this.room.uuid);
                    data_1.append("click_url", this.chat.url);
                    data_1.append("front_path", front_path);
                    data_1.append("message", "");
                    data_1.append("message_duration", "0");
                    data_1.append("message_size", "0");
                    data_1.append("mime_type", "image/*");
                    data_1.append("reply_id", null);
                    data_1.append("status", "sent");
                    data_1.append("to_id", "0");
                    data_1.append("user_id", this.userId);
                    data_1.append("username", this.user.username);
                    data_1.append("uuid", "");
                    data_1.append("users", "");
                    data_1.append("image", image);
                    data_1.append("created_at", new Date().toDateString());
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            _this.fetcher
                                .post("/api/v1/chat/send-image", data_1, {
                                headers: {
                                    "content-type": "multipart/form-data",
                                },
                            })
                                .then(function (response) {
                                resolve(response.data);
                            })
                                .catch(function (error) { return reject(error); });
                        })];
                }
                catch (err) {
                    throw err;
                }
                return [2 /*return*/];
            });
        });
    };
    TmChat.prototype.getChatRoomMessages = function (chat_room_uuid) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            _this.fetcher
                                .get("/api/v1/chat/get-chat-room-messages/".concat(chat_room_uuid))
                                .then(function (result) {
                                var msgs = result.data.body;
                                resolve(msgs);
                            })
                                .catch(function (err) { return reject(err); });
                        }
                        catch (err) {
                            throw err;
                        }
                    })];
            });
        });
    };
    TmChat.prototype.sendMessageToRoom = function (chat_room_uuid, text, front_path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendMessage(text, front_path, chat_room_uuid)];
            });
        });
    };
    TmChat.prototype.sendImageToRoom = function (chat_room_uuid, image, front_path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendImageMessage(image, front_path, chat_room_uuid)];
            });
        });
    };
    TmChat.prototype.getImageFullUrl = function (image) {
        try {
            return "".concat(this.chat.url, "/").concat(image);
        }
        catch (err) {
            return "";
        }
    };
    TmChat.prototype.leaveChatRoom = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            _this.fetcher.post("/api/v1/chat/leave-chat-room/".concat(_this.user.id, "/").concat(roomId))
                                .then(function (result) {
                                resolve('Success');
                            })
                                .catch(function (err) {
                                reject(err);
                            });
                        }
                        catch (err) {
                            reject(err);
                        }
                    })];
            });
        });
    };
    TmChat.prototype.getChatRoomDetails = function (chatRoomUUID) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            _this.fetcher.get("/api/v1/chat/get-chat-room-details/".concat(chatRoomUUID))
                                .then(function (response) {
                                resolve(response.data);
                            })
                                .catch(function (err) {
                                reject(err);
                            });
                        }
                        catch (err) {
                            reject(err);
                        }
                    })];
            });
        });
    };
    TmChat.prototype.inviteChatRoom = function (chatRoomUUID, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            _this.fetcher.post('/api/v1/chat/invite-chat-room', {
                                roomUUID: chatRoomUUID,
                                userId: userId
                            }).then(function (result) {
                                resolve(result);
                            }).catch(function (err) {
                                reject(err);
                            });
                        }
                        catch (err) {
                            reject(err);
                        }
                    })];
            });
        });
    };
    return TmChat;
}());
exports.default = TmChat;
