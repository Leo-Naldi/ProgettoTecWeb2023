import { defineStore } from "pinia";
import API from "src/api/apiconfig";
import { useNotificationsStore } from "./notifications";

export const useChannelStore = defineStore("channel", {
  state: () => ({
    allChannel: [],
    channels_list: [],
    autoComplateAllChannel: [],
  }),

  getters: {
    getChannels(state) {
      return state.allChannel;
    },
    getChannelLists(state){
      return state.channels_list
    },
    getAutoComplateAllChannel(state) {
      return state.autoComplateAllChannel;
    },
  },

  actions: {
    async fetchAutoCompleteChannels() {
      return await API.all_channels()
        .then((response) => {
          if (response.status === 200) {
            const channelArr = response.data.results;
            console.log("fetchAutoComplete channel res: ", channelArr);
            console.log(
              "fetchAutoComplete channel length: ",
              channelArr.length
            );
            for (var element in channelArr) {
              var tmp_res2 = { value: "", label: "", searchText: "" };
              tmp_res2.value = channelArr[element].name;
              tmp_res2.label = channelArr[element].description;
              tmp_res2.searchText = channelArr[element].name;
              this.autoComplateAllChannel.push(tmp_res2);
            }
          }
        })
        .catch((err) => console.log("fetch all channels error!!!", err));
    },
    async fetchChannels() {
      try {
        const response = await API.all_channels();
        this.channels_list=response.data.results
        console.log("fetch all channel res: ", this.channels_list)
        return this.channels_list;
      } catch (error) {
        console.log("fetch all channel error!!!", error);
        throw error;
      }
    },
    //TODO:
    async fetchPublicChannels(){

    },
    async fetchAllChannelName() {
      return await API.all_channels_name()
        .then((response) => {
          if (response.status === 200) {
            this.allChannel = response.data.results;
          }
        })
        .catch((err) => console.log("fetch all channel name error!!!", err));
    },
    async searchChannel(channel_name) {
      channel_name =
        channel_name[0] == "#"
          ? "%23" + channel_name.substring(1)
          : channel_name;

      try {
        const response = await API.search_channel(channel_name);
        console.log("searchChannel res: ", response.data.results);
        return response.data.results;
      } catch (error) {
        console.log("search channel name error!!!", error);
        throw error;
      }
    },
    async modifyChannel(channel_name, channel_data) {
      return await API.modify_channel(channel_name, channel_data)
        .then((response) => {
          if (response.status === 200) {
            useNotificationsStore().showPositive(
              "You've modified channel data successfully!"
            );
            return response.status;
          }
        })
        .catch((err) => {
          console.log("modify channel data error!!!", err);
          useNotificationsStore().showNegative(
            "Modify channel data failed! Please try it again!"
          );
          return err.response.status;
        });
    },
    async createChannel(channel_name, channel_data){
      return await API.create_channel(channel_name, channel_data)
      .then((response) => {
        if (response.status === 200) {
          useNotificationsStore().showPositive(
            "You've created channel data successfully!"
          );
          return [response.status, response.data];
        }
      })
      .catch((err) => {
        console.log("create channel data error!!!", err);
        useNotificationsStore().showNegative(
          "Create channel failed! Please try it again!"
        );
        return [err.response.status];
      });
    },
    async deleteChannel(channel_name) {
      return await API.delete_channel(channel_name)
        .then((response) => {
          if (response.status === 200) {
            this.router.push({ name: "myChannelPage" });
          }
          return response;
        })
        .catch((err) => console.log("delete channel error!", err));
    },
    async deleteChannelMessages(channel_name) {
      return await API.delete_channel_messages(channel_name)
        .then((response) => {
          if (response.status === 200) {
            console.log("you've delete all " + channel_name + "'s messages!");
            return response.status;
          }
        })
        .catch((err) => {
          console.log("delete channel message error!", err);
          return err.response.status;
        });
    },
    async addChannelMember(channel_name, handle) {
      let addMemberJson = { addMembers: [handle] };
      return await API.modify_channel_member(channel_name, addMemberJson)
        .then((response) => {
          if (response.status === 200) {
            console.log("add Channel member success");
          }
        })
        .catch((err) => console.log("add channel member error!!!", err));
    },
    async refuseChannelMember(channel_name, handle) {
      let refuseMemberJson = { removeRequests: [handle] };
      return await API.modify_channel_member(channel_name, refuseMemberJson)
        .then((response) => {
          if (response.status === 200) {
            console.log("refuse Channel member success");
          }
        })
        .catch((err) => console.log("refuse channel member error!!!", err));
    },
    async addChannelEditor(channel_name, handle) {
      let addEditorJson = { addEditors: [handle] };
      return await API.modify_channel_editor(channel_name, addEditorJson)
        .then((response) => {
          if (response.status === 200) {
            console.log("add Channel editor success");
          }
        })
        .catch((err) => console.log("add channel editor error!!!", err));
    },
    async refuseChannelEditor(channel_name, handle) {
      let refuseEditorJson = { removeRequests: [handle] };
      // console.log("我正在移除这个人的频道编辑请求：", channel_name, [handle]);

      return await API.modify_channel_editor(channel_name, refuseEditorJson)
        .then((response) => {
          if (response.status === 200) {
            console.log("refuse Channel editor success");
          }
        })
        .catch((err) => console.log("refuse channel editor error!!!", err));
    },
    async removeChannelMember(channel_name, handle) {
      let removeMemberJson = { removeMembers: [handle] };
      return await API.modify_channel_member(channel_name, removeMemberJson)
        .then((response) => {
          if (response.status === 200) {
            console.log("remove Channel member success");
          }
        })
        .catch((err) => console.log("remove channel member error!!!", err));
    },
    async removeChannelEditor(channel_name, handle) {
      let removeEditorJson = { removeEditors: [handle] };
      return await API.modify_channel_editor(channel_name, removeEditorJson)
        .then((response) => {
          if (response.status === 200) {
            console.log("remove Channel editor success");
          }
        })
        .catch((err) => console.log("remove channel editor error!!!", err));
    },
  },
});
