import{M as P,j as ne,R as T,S as pe,a as ue,I as he,b as xe,c as fe,P as ye,V as j,L as be,B as ge,d as ve,C as we,W as Me,O as Ne,A as Re,G as Te,r as u,e as re,f as ie,g as Ae}from"./vendor.f1484561.js";const De=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const p of o.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&i(p)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerpolicy&&(o.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?o.credentials="include":s.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}};De();const qe=5,Fe=/^(-?)0(\.)/;function O(a){if(Math.abs(a)<1e-4)return"0";const t=a.toString().replace(Fe,"$1$2"),n=Math.max(t.indexOf(".")+3,qe);return t.length>n?t.slice(0,n-1)+"\u2026":t.slice(0,n)}function Se(a){return new P().fromArray([0,-a.z,a.y,a.z,0,-a.x,-a.y,a.x,0])}function se(a){const t=a.elements;return new P().fromArray([t[0],t[1],t[2],t[4],t[5],t[6],t[8],t[9],-t[10],0,0,0])}function oe(a,t){return a.length===t.length&&a.every((n,i)=>n===t[i])}const e=ne.exports.jsx,r=ne.exports.jsxs;function C({label:a,array:t,className:n,style:i}){return r("div",{className:"matrix "+n,children:[e("div",{className:"matrix-label",children:a}),e("div",{className:"matrix-elements",style:i,children:t.map((s,o)=>e("span",{className:"limit-dp",children:O(s)},o))})]})}function Pe({label:a,matrix:t}){return e(C,{label:a,array:t.elements,style:{gridTemplate:"repeat(4, 1fr) / repeat(4, auto)"}})}function Ce(a,t){return a.label===t.label&&a.matrix.equals(t.matrix)}const K=T.memo(Pe,Ce);function ze({label:a,vector:t,className:n}){return e(C,{label:a,array:t.toArray(),className:n,style:{gridTemplate:"repeat(4, 1fr) / auto"}})}function Be(a,t){return a.label===t.label&&a.vector.equals(t.vector)}const le=T.memo(ze,Be),z=new pe;z.showPanel(0);document.body.appendChild(z.dom);z.dom.style.zIndex="100000000000000";function ce(a,t){t.nextFrameReq=requestAnimationFrame(n=>ce(n,t)),z.begin(),t.isPlaying&&(Ie(a,t),Ee(a,t),t.updateGUIFunction(t)),z.end()}function Ie(a,t){t.prevTime=a,t.pointPosition.y=2+Math.sin(a*.0015)*2}function Ee(a,t){for(let n=0;n<t.cameraData.length;n++){const i=t.cameraData[n],s=i.renderer,o=i.camera,p=i.container.clientWidth,f=i.container.clientHeight;o.aspect=p/f,o.updateProjectionMatrix(),s.setSize(p,f),i.orbitControls.update();const l=i.line.geometry.attributes.position.array,y=t.pointPosition.clone().sub(i.camera.position),g=i.camera.position.clone().add(y.clone().multiplyScalar(-1e3)),b=i.camera.position.clone().add(y.clone().multiplyScalar(1e3));l[0]=g.x,l[1]=g.y,l[2]=g.z,l[3]=b.x,l[4]=b.y,l[5]=b.z,i.line.geometry.attributes.position.needsUpdate=!0,s.render(t.scene,i.camera)}}function He(a){const t=new ue,n=new he(.25),i=new xe({color:15257272}),s=new fe(n,i);s.layers.enableAll(),t.add(s);const o=[];for(let l=0;l<a.length;l++){const y=a[l].container.clientWidth,g=a[l].container.clientHeight,b=y/g,c=new ye(30,b,1e-4,1e4);l?c.position.set(10,10,15):c.position.set(35,20,20),c.lookAt(new j),c.layers.set(l);const w=new be({color:l?6010245:33511}),D=[c.position,s.position],W=new ge().setFromPoints(D),x=new ve(W,w);x.frustumCulled=!1,x.layers.enableAll(),x.layers.disable(l),t.add(x);const q=new we(c);q.layers.enableAll(),q.layers.disable(l),t.add(q);const v=new Me({canvas:a[l].canvas});v.setPixelRatio(window.devicePixelRatio),v.setClearColor(1315346),v.setSize(y,g);const N=new Ne(c,a[l].container);o.push({camera:c,line:x,renderer:v,container:a[l].container,canvas:a[l].canvas,orbitControls:N,extrinsicMatrix:c.matrixWorldInverse,intrinsicMatrix:c.projectionMatrix})}const p=new Re(10);p.layers.enableAll(),t.add(p);const f=new Te(5,5,16711680,8680812);return f.layers.enableAll(),t.add(f),{isPlaying:!0,scene:t,pointPosition:s.position,updateGUIFunction:l=>{},nextFrameReq:0,prevTime:0,cameraData:o}}function je(a,t,n,i){const s=He([{container:a,canvas:t},{container:n,canvas:i}]);return s.nextFrameReq=requestAnimationFrame(o=>ce(o,s)),s}function Ke({label:a,matrix:t}){const n=t.elements,i=n.length===16?[n[0],n[1],n[2],n[4],n[5],n[6],n[8],n[9],n[10]]:n;return e(C,{label:a,array:i,style:{gridTemplate:"repeat(3, 1fr) / repeat(3, auto)"}})}function We(a,t){return a.label===t.label&&oe(a.matrix.elements,t.matrix.elements)}const m=T.memo(Ke,We);function ke({label:a,vector:t,className:n}){const i=t.toArray(),s=i.length===4?[i[0],i[1],i[2]]:i;return e(C,{label:a,array:s,className:n,style:{gridTemplate:"repeat(3, 1fr) / auto"}})}function Ge(a,t){return a.label===t.label&&oe(a.vector.toArray(),t.vector.toArray())}const h=T.memo(ke,Ge);function Le({label:a,matrix:t}){const n=t.elements,i=[n[0],n[1],n[2],n[4],n[5],n[6],n[8],n[9],n[10],n[12],n[13],n[14]];return e(C,{label:a,array:i,style:{gridTemplate:"repeat(3, 1fr) / repeat(4, auto)"}})}function Oe(a,t){return a.label===t.label&&a.matrix.equals(t.matrix)}const de=T.memo(Le,Oe);function A({x:a,y:t,className:n}){return e("div",{className:"target "+n,style:{transform:`translate(${-a*50}%, ${t*50||0}%) scale(0.02)`}})}function _e(){const a=u.exports.useRef(),t=u.exports.useRef(),n=u.exports.useRef(),i=u.exports.useRef(),s=u.exports.useRef(),[o,p]=u.exports.useState(new re),[f,l]=u.exports.useState(new P),[y,g]=u.exports.useState(new ie),b=o.clone().applyMatrix4(y),c=new j(b.x,b.y,b.z).applyMatrix3(f),w=c.clone().divideScalar(c.z).setZ(1),[D,W]=u.exports.useState(new P),[x,q]=u.exports.useState(new ie),v=o.clone().applyMatrix4(x),N=new j(v.x,v.y,v.z).applyMatrix3(D),F=N.clone().divideScalar(N.z).setZ(1),_=y.clone().invert(),B=x.clone().multiply(_),me=new P().setFromMatrix4(B),$=new j().setFromMatrixColumn(B,3),S=me.clone().transpose(),k=$.clone().multiplyScalar(-1).applyMatrix3(S),G=Se(k),V=f.clone().invert().transpose(),X=D.clone().invert(),L=G.clone().multiply(S),I=V.clone().multiply(L).multiply(X),U=I.clone().transpose(),E=F.clone().applyMatrix3(I),Z=R=>(-E.z-E.x*R)/E.y,H=w.clone().applyMatrix3(U),J=R=>(-H.z-H.x*R)/H.y;return u.exports.useEffect(()=>{a.current=je(t.current,n.current,i.current,s.current);function R(M){const Y=new re(M.pointPosition.x,M.pointPosition.y,M.pointPosition.z,1);p(d=>Y.equals(d)?d:Y);const Q=se(M.cameraData[0].intrinsicMatrix),ee=M.cameraData[0].extrinsicMatrix;l(d=>Q.equals(d)?d:Q),g(d=>ee.equals(d)?d:ee);const te=se(M.cameraData[1].intrinsicMatrix),ae=M.cameraData[1].extrinsicMatrix;W(d=>te.equals(d)?d:te),q(d=>ae.equals(d)?d:ae)}R(a.current),a.current.updateGUIFunction=R},[]),r("div",{className:"App",children:[r("div",{id:"container-container",children:[r("div",{className:"container",ref:t,children:[e("canvas",{className:"canvas",ref:n}),e(A,{x:w.x,y:w.y,className:"blue"}),e(A,{x:-1,y:Z(-1),className:"green"}),e(A,{x:1,y:Z(1),className:"green"})]}),r("div",{className:"container",ref:i,children:[e("canvas",{className:"canvas",ref:s}),e(A,{x:F.x,y:F.y,className:"green"}),e(A,{x:-1,y:J(-1),className:"blue"}),e(A,{x:1,y:J(1),className:"blue"})]})]}),e("div",{id:"scroll-outer",children:r("div",{id:"scroll-inner",children:[r("div",{className:"text",children:[r("p",{children:["Welcome! Get comfy, because this page is all about how to mathematically go from ",e("strong",{children:"camera matrices"})," to the ",e("strong",{children:"fundamental matrix"})," and ",e("strong",{children:"epipolar lines"}),"."]}),r("p",{children:["Let's get started with some simple camera projection, based on the cameras and objects ","in the scene simulated above."]}),r("p",{children:["By the way, any time you see a ",e("strong",{style:{color:"#5bb585"},children:"colored "}),e("strong",{style:{color:"#0082e7"},children:"circle "}),"up there, that's actually our prediction (using CSS), not a part of the simulation!"]})]}),r("div",{className:"matrix-equation",children:[e(m,{label:"intrinsic matrix, K",matrix:f}),e("span",{children:"*"}),e(de,{label:"extrinsic matrix, M",matrix:y}),e("span",{children:"*"}),e(le,{label:"world coord, X",vector:o}),e("span",{children:"="}),e(h,{label:"result",vector:c}),e("span",{children:"="}),e("span",{className:"limit-dp",children:O(c.z)}),e(h,{label:"image coord, x",vector:w,className:"blue"})]}),r("div",{className:"matrix-equation",children:[e(m,{label:"intrinsic matrix, K'",matrix:D}),e("span",{children:"*"}),e(de,{label:"extrinsic matrix, M'",matrix:x}),e("span",{children:"*"}),e(le,{label:"world coord, X",vector:o}),e("span",{children:"="}),e(h,{label:"result",vector:N}),e("span",{children:"="}),e("span",{className:"limit-dp",children:O(N.z)}),e(h,{label:"image coord, x'",vector:F,className:"green"})]}),r("div",{className:"text",children:[r("p",{children:["Since ",e("strong",{children:"epipolar geometry"})," is all about the relationship between two cameras,"," let's begin by finding the ",e("strong",{children:"relative transformation"})," from camera 1's space to camera 2's space."]}),r("p",{children:["If we have a coordinate in camera 1's space, first we ",e("strong",{children:"left-multiply by M\u207B\xB9"})," to get to world space. Then, we ",e("strong",{children:"left-multiply by M'"})," to get to camera 2's space. This can be combined as below:"]})]}),r("div",{className:"matrix-equation",children:[e(K,{label:"M'",matrix:x}),e("span",{children:"*"}),e(K,{label:"M\u207B\xB9",matrix:_}),e("span",{children:"="}),e(K,{label:"camera 1 space to camera 2 space",matrix:B})]}),e("div",{className:"text",children:r("p",{children:["Next, let's break the above matrix apart. We define these parts as "," weird math expressions, but it will make more sense later!"]})}),r("div",{className:"matrix-equation",children:[e("span",{children:" break "}),e(K,{label:"camera 1 space to camera 2 space",matrix:B}),e("span",{children:" into "}),e(m,{label:"left side, defined as R\u1D40",matrix:S}),e("span",{children:" and "}),e(h,{label:"right side, defined as -(R\u1D40 * T)",vector:$})]}),r("div",{className:"matrix-equation",children:[e("span",{children:"From R\u1D40 and -(R\u1D40 * T), we can then get "}),e(m,{label:"R",matrix:S}),e("span",{children:" and "}),e(h,{label:"T",vector:k})]}),r("div",{className:"text",children:[r("p",{children:[e("strong",{children:"Think:"})," What exactly do ",e("strong",{children:"R"})," and ",e("strong",{children:"T"})," represent, and what's up with the -(R\u1D40 * T) on the right side?"]}),e("p",{children:e("strong",{children:"Explanation (click to expand):"})}),r("p",{children:["Imagine both cameras shared the same world position, but differed in rotation. Then, ","R\u1D40 would take camera 1's (c1's) direction and rotate it to match camera 2's (c2's). ","Thus, R\u1D40 is ",e("strong",{children:"the rotation from c1 to c2"}),", and since transposition is the same as inversion for rotation matrices, R is ",e("strong",{children:"the rotation from c2 to c1"}),"."]}),r("p",{children:["Now, imagine they have different world positions as well. ","R\u1D40 again rotates c1 to be parallel to c2. ","But now, to move c1 to perfectly match c2, ","we need to translate it by some vector ",e("em",{children:"in c2's space"}),": this is -(R\u1D40 * T), ",e("strong",{children:"the translation from c1 to c2, in c2's space"}),"."]}),r("p",{children:["On the flip side, T is ",e("strong",{children:"the translation from c2 to c1, in c1's space"}),"."]})]}),e("div",{className:"matrix-equation",children:e("span",{style:{top:0},children:"(\u0CA5\uFE4F\u0CA5)"})}),r("div",{className:"text",children:[r("p",{children:[e("strong",{children:"Whew!"})," That was a lot to get through!",e("br",{}),"Don't worry, it took me >20h to figure this out, ","and you don't have to totally understand this for HW3."]}),r("p",{children:["But now, ",e("strong",{children:"given R and T"}),", we can finally make the ",e("strong",{children:"essential matrix"}),"! Just follow the recipe:"]})]}),r("div",{className:"matrix-equation",children:[e("span",{children:"First, convert T into its cross-product matrix form: "}),e(h,{label:"T",vector:k}),e("span",{children:"=>"}),e(m,{label:"T_x",matrix:G})]}),r("div",{className:"matrix-equation",children:[e("span",{children:"Then multiply!: "}),e(m,{label:"T_x",matrix:G}),e("span",{children:"*"}),e(m,{label:"R",matrix:S}),e("span",{children:"="}),e(m,{label:"E",matrix:L})]}),e("div",{className:"text",children:r("p",{children:["The essential matrix is great for ",e("strong",{children:"canonical cameras"}),", with K = identity, but we have non-canonical cameras here. So, we must instead get the ",e("strong",{children:"fundamental matrix"}),":"]})}),r("div",{className:"matrix-equation",children:[e(m,{label:"K\u207B\u1D40",matrix:V}),e("span",{children:"*"}),e(m,{label:"E",matrix:L}),e("span",{children:"*"}),e(m,{label:"K'\u207B\xB9",matrix:X}),e("span",{children:"="}),e(m,{label:"F",matrix:I})]}),e("div",{className:"text",children:r("p",{children:["And with that, we can finally make ",e("strong",{children:"epipolar lines"}),"! ","Those are what I'm using to position the circles on the sides of the images above."]})}),r("div",{className:"matrix-equation",children:[e(m,{label:"F",matrix:I}),e("span",{children:"*"}),e(h,{label:"x'",vector:F,className:"green"}),e("span",{children:"="}),e(h,{label:"l",vector:E,className:"green all"})]}),r("div",{className:"matrix-equation",children:[e(m,{label:"F\u1D40",matrix:U}),e("span",{children:"*"}),e(h,{label:"x",vector:w,className:"blue"}),e("span",{children:"="}),e(h,{label:"l'",vector:H,className:"blue all"})]}),r("div",{className:"text",children:[r("p",{children:[e("strong",{children:"Congratulations!"}),e("br",{}),"You made it through the most difficult concept in CSCI 1430 :)"]}),r("p",{children:["As you saw above, we used ",e("strong",{children:"known camera matrices"})," to get a fundamental matrix. This is just ",e("strong",{children:"one"})," way to do it, and probably the harder one."]}),r("p",{children:["In HW3, you will implement a different way, one which involves ","using point correspondences to ",e("em",{children:"guess"})," the fundamental matrix, instead. All the best!"]})]})]})})]})}Ae.render(e(T.StrictMode,{children:e(_e,{})}),document.getElementById("root"));