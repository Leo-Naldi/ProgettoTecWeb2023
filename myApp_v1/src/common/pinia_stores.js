import { useChannelStore } from "src/stores/channels";
import { useUserStore } from "src/stores/user";
import { useAuthStore } from 'src/stores/auth';
import { useGlobalStore } from "src/stores/global";
import { useHashtagStore } from "src/stores/hashtags";
import { useMapStore } from "src/stores/map";
import { useNotificationsStore } from "src/stores/notifications";
import { usePostStore } from "src/stores/posts";
import { useSocketStore } from "src/stores/socket";

export const channelStore = useChannelStore()
export const authStore = useAuthStore()
export const userStore = useUserStore()
export const globalStore = useGlobalStore()
export const hashStore = useHashtagStore()
export const mapStore = useMapStore()
export const notificationStore = useNotificationsStore()
export const postStore = usePostStore()
export const socketStore= useSocketStore()
