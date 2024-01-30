import{c as L,j as B,I as $,p as M,k as c,h as d,e as K,J as O,K as N,g as R,w as P,b as U,i as V,L as A,M as I,N as k,O as D,P as J,r as m,t as _,R as C,S as x,U as G,V as X}from"./index.b8bea508.js";import{Q as E}from"./QResizeObserver.231b9bb5.js";var ne=L({name:"QPageContainer",setup(e,{slots:p}){const{proxy:{$q:o}}=R(),n=B(O,$);if(n===$)return console.error("QPageContainer needs to be child of QLayout"),$;M(N,!0);const r=c(()=>{const a={};return n.header.space===!0&&(a.paddingTop=`${n.header.size}px`),n.right.space===!0&&(a[`padding${o.lang.rtl===!0?"Left":"Right"}`]=`${n.right.size}px`),n.footer.space===!0&&(a.paddingBottom=`${n.footer.size}px`),n.left.space===!0&&(a[`padding${o.lang.rtl===!0?"Right":"Left"}`]=`${n.left.size}px`),a});return()=>d("div",{class:"q-page-container",style:r.value},K(p.default))}});const{passive:F}=k,Y=["both","horizontal","vertical"];var Z=L({name:"QScrollObserver",props:{axis:{type:String,validator:e=>Y.includes(e),default:"vertical"},debounce:[String,Number],scrollTarget:{default:void 0}},emits:["scroll"],setup(e,{emit:p}){const o={position:{top:0,left:0},direction:"down",directionChanged:!1,delta:{top:0,left:0},inflectionPoint:{top:0,left:0}};let n=null,r,a;P(()=>e.scrollTarget,()=>{f(),y()});function u(){n!==null&&n();const v=Math.max(0,D(r)),h=J(r),s={top:v-o.position.top,left:h-o.position.left};if(e.axis==="vertical"&&s.top===0||e.axis==="horizontal"&&s.left===0)return;const w=Math.abs(s.top)>=Math.abs(s.left)?s.top<0?"up":"down":s.left<0?"left":"right";o.position={top:v,left:h},o.directionChanged=o.direction!==w,o.delta=s,o.directionChanged===!0&&(o.direction=w,o.inflectionPoint=o.position),p("scroll",{...o})}function y(){r=I(a,e.scrollTarget),r.addEventListener("scroll",l,F),l(!0)}function f(){r!==void 0&&(r.removeEventListener("scroll",l,F),r=void 0)}function l(v){if(v===!0||e.debounce===0||e.debounce==="0")u();else if(n===null){const[h,s]=e.debounce?[setTimeout(u,e.debounce),clearTimeout]:[requestAnimationFrame(u),cancelAnimationFrame];n=()=>{s(h),n=null}}}const{proxy:b}=R();return P(()=>b.$q.lang.rtl,u),U(()=>{a=b.$el.parentNode,y()}),V(()=>{n!==null&&n(),f()}),Object.assign(b,{trigger:l,getPosition:()=>o}),A}}),oe=L({name:"QLayout",props:{container:Boolean,view:{type:String,default:"hhh lpr fff",validator:e=>/^(h|l)h(h|r) lpr (f|l)f(f|r)$/.test(e.toLowerCase())},onScroll:Function,onScrollHeight:Function,onResize:Function},setup(e,{slots:p,emit:o}){const{proxy:{$q:n}}=R(),r=m(null),a=m(n.screen.height),u=m(e.container===!0?0:n.screen.width),y=m({position:0,direction:"down",inflectionPoint:0}),f=m(0),l=m(_.value===!0?0:C()),b=c(()=>"q-layout q-layout--"+(e.container===!0?"containerized":"standard")),v=c(()=>e.container===!1?{minHeight:n.screen.height+"px"}:null),h=c(()=>l.value!==0?{[n.lang.rtl===!0?"left":"right"]:`${l.value}px`}:null),s=c(()=>l.value!==0?{[n.lang.rtl===!0?"right":"left"]:0,[n.lang.rtl===!0?"left":"right"]:`-${l.value}px`,width:`calc(100% + ${l.value}px)`}:null);function w(t){if(e.container===!0||document.qScrollPrevented!==!0){const i={position:t.position.top,direction:t.direction,directionChanged:t.directionChanged,inflectionPoint:t.inflectionPoint.top,delta:t.delta.top};y.value=i,e.onScroll!==void 0&&o("scroll",i)}}function W(t){const{height:i,width:g}=t;let S=!1;a.value!==i&&(S=!0,a.value=i,e.onScrollHeight!==void 0&&o("scrollHeight",i),q()),u.value!==g&&(S=!0,u.value=g),S===!0&&e.onResize!==void 0&&o("resize",t)}function j({height:t}){f.value!==t&&(f.value=t,q())}function q(){if(e.container===!0){const t=a.value>f.value?C():0;l.value!==t&&(l.value=t)}}let z=null;const Q={instances:{},view:c(()=>e.view),isContainer:c(()=>e.container),rootRef:r,height:a,containerHeight:f,scrollbarWidth:l,totalWidth:c(()=>u.value+l.value),rows:c(()=>{const t=e.view.toLowerCase().split(" ");return{top:t[0].split(""),middle:t[1].split(""),bottom:t[2].split("")}}),header:x({size:0,offset:0,space:!1}),right:x({size:300,offset:0,space:!1}),footer:x({size:0,offset:0,space:!1}),left:x({size:300,offset:0,space:!1}),scroll:y,animate(){z!==null?clearTimeout(z):document.body.classList.add("q-body--layout-animate"),z=setTimeout(()=>{z=null,document.body.classList.remove("q-body--layout-animate")},155)},update(t,i,g){Q[t][i]=g}};if(M(O,Q),C()>0){let g=function(){t=null,i.classList.remove("hide-scrollbar")},S=function(){if(t===null){if(i.scrollHeight>n.screen.height)return;i.classList.add("hide-scrollbar")}else clearTimeout(t);t=setTimeout(g,300)},T=function(H){t!==null&&H==="remove"&&(clearTimeout(t),g()),window[`${H}EventListener`]("resize",S)},t=null;const i=document.body;P(()=>e.container!==!0?"add":"remove",T),e.container!==!0&&T("add"),G(()=>{T("remove")})}return()=>{const t=X(p.default,[d(Z,{onScroll:w}),d(E,{onResize:W})]),i=d("div",{class:b.value,style:v.value,ref:e.container===!0?void 0:r,tabindex:-1},t);return e.container===!0?d("div",{class:"q-layout-container overflow-hidden",ref:r},[d(E,{onResize:j}),d("div",{class:"absolute-full",style:h.value},[d("div",{class:"scroll",style:s.value},[i])])]):i}}});export{oe as Q,ne as a};
