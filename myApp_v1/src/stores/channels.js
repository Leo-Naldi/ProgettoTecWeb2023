import { defineStore } from 'pinia'
import API from "src/api/apiconfig";

export const useChannelStore = defineStore('channel', {
  state: () => ({
    allChannel: [],
    autoComplateAllChannel: [],
  }),

  getters: {
    getChannels(state) {
      return state.allChannel;
    },
    getAutoComplateAllChannel(state){
      return state.autoComplateAllChannel;
    }
  },

  actions: {
    async fetchAutoCompleteChannels(){
      return await API.all_channels()
        .then((response) => {
          if (response.status === 200) {
            for (var element in response.data) {
              var tmp_res2 = { value: "", label: "", searchText: "" };
              tmp_res2.value = response.data[element].name;
              tmp_res2.label = response.data[element].description;
              tmp_res2.searchText = response.data[element].name;
              this.autoComplateAllChannel.push(tmp_res2);
            }
          }
        })
        .catch((err) => console.log("fetch all channels error!!!", err));
    },
    async fetchAllChannelName(){
      return await API.all_channels_name()
        .then((response) => {
          if (response.status === 200) {
            this.allChannel = response.data
          }
        })
        .catch((err) => console.log("fetch all channel name error!!!", err));
    },
    async searchChannel(channel_name){
      channel_name = channel_name[0]=='#' ? '%23'+channel_name.substring(1): channel_name

      try {
        const response = await API.search_channel(channel_name)
        return response.data;
      } catch (error) {
        console.log("search channel name error!!!", error);
        throw error;
      }
    },


  }
})
