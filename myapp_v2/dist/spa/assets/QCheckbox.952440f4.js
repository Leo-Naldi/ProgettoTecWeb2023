import{h as e,c as a,k as l,x as u}from"./index.b8bea508.js";import{i,j as r,k as h}from"./CloseDialog.f0183c26.js";const k=e("div",{key:"svg",class:"q-checkbox__bg absolute"},[e("svg",{class:"q-checkbox__svg fit absolute-full",viewBox:"0 0 24 24"},[e("path",{class:"q-checkbox__truthy",fill:"none",d:"M1.73,12.91 8.1,19.28 22.79,4.59"}),e("path",{class:"q-checkbox__indet",d:"M4,14H20V10H4"})])]);var _=a({name:"QCheckbox",props:i,emits:r,setup(c){function s(n,t){const o=l(()=>(n.value===!0?c.checkedIcon:t.value===!0?c.indeterminateIcon:c.uncheckedIcon)||null);return()=>o.value!==null?[e("div",{key:"icon",class:"q-checkbox__icon-container absolute-full flex flex-center no-wrap"},[e(u,{class:"q-checkbox__icon",name:o.value})])]:[k]}return h("checkbox",s)}});export{_ as Q};
