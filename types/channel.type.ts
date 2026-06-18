import { ChannelTypeEnum } from "@/constants/channels";

export type ChannelType = {
  id: string;
  type: ChannelTypeEnum;
  name?: string;
  color: string;
  characterLimit: number;
  connected: boolean;
  userChannelId?: string | null;
  handle?: string | null;
  profileImage?: string | null;
  profileImageUrl?: string | null;
};
