export interface ApiUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export interface RoomSummary {
  id: string;
  roomId: string;
  meetName: string;
  createdAt: string;
}

export interface RoomDetails extends RoomSummary {
  chats?: ChatMessage[];
}

export interface ChatMessage {
  id?: string;
  sendersName: string;
  message: string;
  time: string;
  isOwn?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export interface JoinPayload {
  uuid: string;
  displayName: string;
  room: string;
}

export type WebRTCSignal =
  | {
    type: "join";
    uuid: string;
    displayName?: string;
    room: string;
  }
  | {
    type: "offer" | "answer";
    uuid: string;
    dest: string;
    room: string;
    sdp: RTCSessionDescriptionInit;
    displayName?: string;
  }
  | {
    type: "ice";
    uuid: string;
    dest: string;
    room: string;
    ice: RTCIceCandidateInit;
  };


