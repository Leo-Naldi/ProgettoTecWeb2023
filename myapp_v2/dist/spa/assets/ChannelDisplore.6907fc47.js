import{C as w,a as x,Q as y,h as k}from"./CloseDialog.f0183c26.js";import{_ as v,r as i,ak as m,k as d,C as h,D as r,a9 as D,H as c,G as n,F as o,x as F,Z as p,E as _,a7 as u}from"./index.b8bea508.js";import{C as V}from"./ChannelEnum.33074358.js";import"./ClosePopup.da0077f2.js";import"./use-dark.880f3e4e.js";import"./focus-manager.05708ea9.js";import"./QInput.c0248187.js";import"./QResizeObserver.231b9bb5.js";import"./QSeparator.92a6cda9.js";import"./QCardActions.f9bcb485.js";import"./QForm.0a780925.js";import"./QItem.ea7b6016.js";import"./ChannelButton.4b56e50f.js";const B={setup(){const e=i(m()!=null),t=e.value?d(()=>p().getChannelLists):d(()=>p().getOfficialChannlLists);return{allowFilter:i(!1),store_channel:t,logged:e}},components:{CloseDialog:w,ChannelEnum:V},data(){return{channel_list:i([])}},watch:{allowFilter(e){if(e!=!0)this.channel_list=this.store_channel;else{const t=m().joinedChannels,s=JSON.parse(JSON.stringify(this.store_channel)).filter(l=>!t.some(a=>a.name===l.name));this.channel_list=s}}}},E={class:"trend-container",style:{"max-width":"full"}},N={class:"flex justify-between items-center q-px-md q-py-sm"},Q=c("p",{class:"text-weight-bold text-h5 q-pa-md"},"Displore more Channel",-1),b={class:"q-pt-md"};function q(e,t,s,l,a,S){const f=h("CloseDialog"),g=h("ChannelEnum");return r(),D("div",E,[c("div",N,[Q,n(F,{name:"settings",size:"sm",class:"mySettingButton",clickable:""},{default:o(()=>[l.logged?(r(),_(y,{key:0},{default:o(()=>[n(f,null,{default:o(()=>[c("div",b,[u("Don't show followed: "),n(x,{modelValue:l.allowFilter,"onUpdate:modelValue":t[0]||(t[0]=C=>l.allowFilter=C),"checked-icon":"check",color:"primary","unchecked-icon":"clear"},null,8,["modelValue"])])]),_:1})]),_:1})):(r(),_(k,{key:1,class:"bg-primary"},{default:o(()=>[u("Login to filter your followed channel!")]),_:1}))]),_:1})]),n(g,{channels:a.channel_list},null,8,["channels"])])}var K=v(B,[["render",q]]);export{K as default};
