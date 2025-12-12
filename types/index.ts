export type User = {
  id?: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  captchaToken?: string;
  token?: string;
  role?: string;
};

export type NewUser = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  code?: string;
};

export type UserFormatFriendRequest = {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
};

export type GetFriends = {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
};

export type GetFriendRequests = {
  id?: number;
  sender?: UserFormatFriendRequest | null;
  receiver?: UserFormatFriendRequest | null;
  status?: string;
};

export type StatusMessage = {
  message: string;
  type: "error" | "success";
};

export type MapCircle = {
  id: string;
  x: number;
  y: number;
  found: boolean;
  timestamp?: Date;
};

export type MapState = {
  circles: MapCircle[];
  counter: number;
  centerX: number;
  centerY: number;
  gameStarted: boolean;
};

export type CircleData = {
  latitude: number;
  longitude: number;
  radius: number;
  isInside: boolean;
};

export type CircleShareRequest = {
  circles: CircleData[];
};

export type CircleShareResponse = {
  shareId: string;
  shareUrl: string;
  message: string;
};

export type SharedCircleDTO = {
  id: number;
  latitude: number;
  longitude: number;
  radius: number;
  isInside: boolean;
  ownerUsername: string;
  createdAt: string;
};

export type AcceptedCircleShareDTO = {
  id: number | null;
  shareId: string;
  ownerUsername: string;
  acceptedAt: string | null;
  visible: boolean;
  circles: SharedCircleDTO[];
};

export type EventCode = {
  id: number;
  code: string;
};

export type UpdateCodeDTO = {
  code: string;
};

export type Hint = {
  id: number;
  title: string;
  content: string;
  active: boolean;
};

export type HintInputDto = {
  title: string;
  content: string;
};