import { defineStore } from "pinia";
import API from "src/common/apiconfig";
import { useNotificationsStore } from "./notification";
import { showPositive, showNegative } from "src/common/utils";


export const useChannelStore = defineStore("channel", {
  state: () => ({
    channelName_list: [],
    channels_list: [],
    officialChannel_list: [],
    autoComplateAllChannel: [],
    fetchChannelReturned: false
  }),
  getters: {
    getChannelNames: (state) => state.channelName_list,
    getChannelLists: (state) => state.channels_list,
    getOfficialChannlLists: (state) => state.officialChannel_list,
    getAutoComplateAllChannel: (state)=> state.autoComplateAllChannel,
    getFetchChannelReturned: (state)=>state.fetchChannelReturned,
    getChannel: (state) =>  (channel_name) => state.channels_list.find((obj) => obj.name === channel_name),

  },
  actions: {
    resetStoredChannelPublic(){
      this.officialChannel_list=[],
      this.fetchChannelReturned=false
    },
    resetStoredChannelLogged(){
      this.channelName_list=[]
      this.channels_list=[],
      this.autoComplateAllChannel=[]
      this.fetchAllChannelName=false
    },
    async fetchOfficialChannels(page=1){
      return API.all_public_channels(page)
        .then((response) => {
          if (response.status === 200) {
            this.officialChannel_list=response.data.results
          }
        })
        .catch((err) => console.log("fetch all official channels error!!!", err))
        .finally(this.fetchChannelReturned=true)
    },
    async fetchAutoCompleteChannels() {
      return await API.all_channels()
        .then((response) => {
          if (response.status === 200) {
            const channelArr = response.data.results;
            for (var element in channelArr) {
              var tmp_res2 = { value: "", label: "", searchText: "" };
              tmp_res2.value = channelArr[element].name;
              tmp_res2.label = channelArr[element].description;
              tmp_res2.searchText = channelArr[element].name;
              this.autoComplateAllChannel.push(tmp_res2);
            }
          }
        })
        .catch((err) => console.log("fetch autocompleted channels error!!!", err));
    },
    async fetchChannels() {
      // console.log("3. 【channel.js】 的 [fetchChannels] 被调用了！抓取到所有频道：", this.channels_list) //获得 proxy
      return API.all_channels()
        .then((response) => {
          if (response.status === 200) {
            this.channels_list=response.data.results
          }
        })
        .catch((err) => console.log("fetch all channels error!!!", err))
        .finally(this.fetchChannelReturned=true)
    },
    async fetchAllChannelName() {
      return await API.all_channels_name()
        .then((response) => {
          if (response.status === 200) {
            this.channelName_list = response.data.results;
          }
        })
        .catch((err) => console.log("fetch all channel name error!!!", err));
    },
    async refuseChannelMemberRequest(channel_name, handle) {
      let refuseMemberJson = { handles: [handle] };
      return await API.modify_channel_member(channel_name, refuseMemberJson)
        .then((response) => {
          if (response.status === 200) {
            showPositive("refuse Channel member request with success!")
            // console.log("refuse Channel member success");
          }
        })
        .catch((err) => console.log("refuse channel member error!!!", err));
    },
    async refuseChannelEditorRequest(channel_name, handle) {
      let refuseEditorJson = { handles: [handle] };
      // console.log("我正在移除这个人的频道编辑请求：", channel_name, [handle]);

      return await API.modify_channel_editor(channel_name, refuseEditorJson)
        .then((response) => {
          if (response.status === 200) {
            showPositive("refuse Channel editor success")
          }
        })
        .catch((err) => console.log("refuse channel editor error!!!", err));
    },
    async acceptChannelEditor(channel_name, handle) {
      let addEditorJson = { editors: [handle] };
      return await API.modify_channel_editor(channel_name, addEditorJson)
        .then((response) => {
          if (response.status === 200) {
            showPositive("add Channel editor success")
            // console.log("add Channel editor success");
          }
        })
        .catch((err) => console.log("add channel editor error!!!", err));
    },
    async acceptChannelMember(channel_name, handle) {
      let addMemberJson = { members: [handle] };
      return await API.modify_channel_member(channel_name, addMemberJson)
        .then((response) => {
          if (response.status === 200) {
            showPositive("add Channel member success")
            // console.log("add Channel member success");
          }
        })
        .catch((err) => console.log("add channel member error!!!", err));
    },
    async removeChannelMember(channel_name, handle) {
      let removeMemberJson = { members: [handle] };
      return await API.remove_channel_member(channel_name, removeMemberJson)
        .then((response) => {
          if (response.status === 200) {
            showPositive("remove Channel member success")
            // console.log("remove Channel member success");
          }
        })
        .catch((err) => console.log("remove channel member error!!!", err));
    },
    async removeChannelEditor(channel_name, handle) {
      let removeEditorJson = { editors: [handle] };
      console.log("channel_name: "+channel_name+" handle: ",removeEditorJson)
      return await API.remove_channel_editor(channel_name, removeEditorJson)
        .then((response) => {
          if (response.status === 200) {
            showPositive("remove Channel editor success")
            // console.log("remove Channel editor success");
          }
        })
        .catch((err) => console.log("remove channel editor error!!!", err));
    },
    // TODO: 新的添加到 all_channels，并且添加名字到channel 的列表里
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
  },
});
