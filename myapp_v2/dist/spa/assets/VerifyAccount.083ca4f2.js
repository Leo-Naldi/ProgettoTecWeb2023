import{Q as l}from"./QPage.0605acda.js";import{_ as r,a4 as i,b1 as u,bD as c,D as s,E as d,F as m,H as n,a8 as t,bE as f}from"./index.b8bea508.js";const _={props:{email:{type:String},handle:{type:String},token:{type:String}},setup(e){console.log("email in router: ",e.email),console.log("handle in router: ",e.handle),console.log("token in router: ",e.token);const a=i().currentRoute.value.fullPath;console.log("router name: ",a),u(async()=>{await c(e.handle,e.email,f+a)})}};function g(e,o,a,h,p,k){return s(),d(l,{padding:""},{default:m(()=>[n("div",null,[n("p",null,"email in param: "+t(a.email),1)]),n("div",null,[n("p",null,"handle in param: "+t(a.handle),1)]),n("div",null,[n("p",null,"token in param: "+t(a.token),1)])]),_:1})}var B=r(_,[["render",g]]);export{B as default};
