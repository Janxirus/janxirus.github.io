/*! cube3d.js · © 2026 Janxirus (janxirus.github.io). All rights reserved. Not licensed for reuse; see LICENSE. */
/* cube3d.js: the pixel-art 3D "code block" cube from the Janxirus site.
   Five live faces: code being typed, a terminal build, pixel art being drawn, mini pong, and a chip on top.
   Texture/mesh code is copied verbatim from index.html (hero logo). Usage:
     Cube3D.mount(document.getElementById('cube'))   // a <canvas> inside a sized box
   Options: {period:12 (seconds per clockwise turn), scale:1.5 (CSS px per canvas px)} */
(function(){
"use strict";
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t].map(Math.round);
function cube(){const v=[];for(const x of[-1,1])for(const y of[-1,1])for(const z of[-1,1])v.push([x,y,z]);return{v,f:[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]}}
const M={cube:cube()};
const LIGHT=(()=>{const l=[-.55,-.75,.6],n=Math.hypot(...l);return l.map(x=>x/n)})();
const rX=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c]},rY=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c]};
/* the logo: a pixel "code block" with 32x32 faces. Blue side: editor window with "<" and syntax-coloured code lines.
   Purple side: ">" prompt with a blinking cursor. Lilac top: { } with circuit traces. Bevelled white rim, moving sheen. */
const TS=32,LC={top:[170,125,255],code:[79,140,255],term:[110,60,210],paint:[150,82,232],game:[58,104,222]},LW=[244,242,255],LD=[22,12,52];
const PAL={c1:[130,230,255],c2:[255,150,210],c3:[255,214,110],c4:[160,255,170],r:[255,95,110],y:[255,205,90],n:[110,230,140],ok:[120,240,150],
 s1:[30,40,110],s2:[70,140,255],s3:[140,230,255],s4:[250,252,255],pb:[255,255,255]};
/* each side of the logo is a little live screen:
   code  = code being typed line by line      term = a build running in a terminal
   paint = a Shardlight shard drawn pixel by pixel   game = a tiny pong match      top = a pulsing chip */
const G3={lt:['.#','#.','.#'],gt:['#.','.#','#.'],chk:['....#','...#.','#.#..','.#...']};
const CODE=[[8,[[6,4,'c2'],[11,6,'c1']]],[10,[[8,3,'c3'],[12,8,'G']]],[12,[[8,5,'c4'],[14,4,'G'],[19,3,'c1']]],[14,[[10,6,'G'],[17,5,'c3']]],[16,[[10,4,'c2'],[15,7,'c4']]],[18,[[8,2,'G']]],[20,[[8,4,'c1'],[13,9,'G']]],[22,[[6,2,'G']]],[24,[[6,3,'c2'],[10,5,'c4']]]];
const CODEN=CODE.reduce((s,[,sg])=>s+sg.reduce((a,x)=>a+x[1],0),0);
const SHARD=['.....aa.....','....acwa....','...acwcba...','..acwccbba..','.acwcccbbba.','acwccccbbbba','acccccbbbbba','.acccbbbbba.','..accbbbba..','...acbbba...','....acba....','.....aa.....'];
const SHP=[];SHARD.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='.')SHP.push([x,y,{a:'s1',b:'s2',c:'s3',w:'s4'}[ch]])}));
const tri=x=>1-Math.abs(((x%2)+2)%2-1);
function chrome(ty,u,v){const E=TS-1;if(u===0||v===0||u===E||v===E)return'w';if((u===1||u===E-1)&&(v===1||v===E-1))return'w';if(u===1||v===1)return'l';if(u===E-1||v===E-1)return'd';
 if(ty==='top')return null;if(v>=3&&v<=5&&u>=3&&u<=28){if(v===4&&(u===5||u===7||u===9))return['r','y','n'][(u-5)/2];return'k'}
 if(v===6||u===2||u===29||v===29)return'b';if(v>=7&&v<=28&&u>=3&&u<=28)return'K';return'b'}
const TX={};for(const ty in LC)TX[ty]=new Array(TS*TS);
function glyph(T,g,u0,v0,k){g.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch==='#')T[(v0+y)*TS+u0+x]=k}))}
function buildTex(tm){for(const ty in LC){const T=TX[ty];for(let v=0;v<TS;v++)for(let u=0;u<TS;u++)T[v*TS+u]=chrome(ty,u,v)}
 {const T=TX.top;for(let v=0;v<TS;v++)for(let u=0;u<TS;u++){if(T[v*TS+u])continue;let k='b';
   if(u>=11&&u<=20&&v>=11&&v<=20)k=(u===11||u===20||v===11||v===20)?'t':(u===13&&v===13)?'o':(u>=14&&u<=17&&v>=14&&v<=17)?'g2':'k';
   else if(((u>=12&&u<=19&&(u-12)%2===0)&&(v===9||v===10||v===21||v===22))||((v>=12&&v<=19&&(v-12)%2===0)&&(u===9||u===10||u===21||u===22)))k='o';
   else if(((u===14||u===18)&&(v>=4&&v<=8||v>=23&&v<=27))||((v===14||v===18)&&(u>=4&&u<=8||u>=23&&u<=27)))k='t';
   else if((u===14||u===18)&&(v===3||v===28)||(v===14||v===18)&&(u===3||u===28))k='o';
   T[v*TS+u]=k}}
 /* code: typing at 14 chars/s, hold, then start over */
 {const T=TX.code;glyph(T,G3.lt,25,3,'g');const cyc=CODEN/14+2.5,n=Math.floor((tm%cyc)*14);let left=n,cu=null,cv=null;
  for(const [v,sg] of CODE){T[v*TS+4]='K2';for(const [u0,len,c] of sg){for(let q=0;q<len;q++){if(left<=0)break;T[v*TS+u0+q]=c;left--;cu=u0+q+1;cv=v}}}
  if(cu===null){cu=6;cv=8}if(n<CODEN||(tm%.9)<.45){T[cv*TS+Math.min(27,cu)]='C';T[(cv+1)*TS+Math.min(27,cu)]='C'}}
 /* terminal: prompt, typed command, output, progress bar, green check */
 {const T=TX.term;glyph(T,G3.gt,25,3,'g');const t=tm%9;glyph(T,G3.gt,4,8,'ok');
  const typed=Math.max(0,Math.min(13,Math.floor((t-.3)*10)));for(let q=0;q<typed;q++)if(q!==4&&q!==9)T[9*TS+8+q]='g';
  if(t<1.7&&(t%.8)<.4)T[9*TS+8+typed]='C';
  [[13,14,1.8],[15,10,2.1],[17,16,2.4]].forEach(([v,len,at])=>{if(t>at)for(let q=0;q<len;q++)if(q%5!==3)T[v*TS+4+q]='G'});
  if(t>2.5){for(let u=4;u<=27;u++){T[20*TS+u]='G';T[22*TS+u]='G'}T[21*TS+4]='G';T[21*TS+27]='G';const pr=Math.min(1,(t-2.6)/2.4);for(let u=5;u<5+Math.round(pr*22);u++)T[21*TS+u]='ok'}
  if(t>5.2){glyph(T,G3.chk,4,24,'ok');for(let q=0;q<9;q++)if(q!==4)T[25*TS+11+q]='n'}}
 /* paint: the shard is drawn pixel by pixel with a palette below */
 {const T=TX.paint;for(let v=8;v<=21;v++)for(let u=9;u<=22;u++)T[v*TS+u]=(u+v)%2?'K':'K3';
  const t=tm%9,cnt=t<.5?0:Math.min(SHP.length,Math.floor((t-.5)*20));for(let q=0;q<cnt;q++){const [x,y,c]=SHP[q];T[(9+y)*TS+10+x]=c}
  const cur=SHP[Math.min(SHP.length-1,cnt)];if(cnt<SHP.length){T[(9+cur[1])*TS+10+cur[0]]='pb';T[(8+cur[1])*TS+11+cur[0]]='g'}
  const sw=['s1','s2','s3','s4'],sel=cnt<SHP.length?sw.indexOf(cur[2]):-1;sw.forEach((c,i)=>{const u0=8+i*4;for(let q=0;q<3;q++){T[25*TS+u0+q]=c;T[26*TS+u0+q]=c}if(i===sel)for(let q=0;q<3;q++)T[24*TS+u0+q]='g'});
  [9,12,15].forEach((v,i)=>{T[v*TS+4]=T[v*TS+5]=T[(v+1)*TS+4]=T[(v+1)*TS+5]=i===0?'g':'G'})}
 /* game: pong, the paddles follow the ball */
 {const T=TX.game;glyph(T,G3.lt,24,3,'g');glyph(T,G3.gt,26,3,'g');for(let v=8;v<=27;v+=2)T[v*TS+15]='G';
  const bx=Math.round(6+tri(tm*.55)*19),by=Math.round(9+tri(tm*.83)*17),py=c=>Math.max(8,Math.min(23,Math.round(c-2)));
  const lp=py(by+Math.sin(tm*1.7)*2),rp=py(by-Math.sin(tm*1.3)*2);for(let q=0;q<5;q++){T[(lp+q)*TS+4]='c1';T[(rp+q)*TS+27]='c2'}T[by*TS+bx]='g';
  const pips=Math.floor(tm/6)%5;for(let q=0;q<5;q++)T[4*TS+12+q*2]=q<pips?'y':'k'}}
const LF=M.cube.f.map(fc=>{const V=fc.map(i=>M.cube.v[i]),n=[0,1,2].map(a=>V.reduce((s,q)=>s+q[a],0)/4),up=[0,-1,0];
 const ty=n[1]!==0?'top':n[0]<0?'code':n[0]>0?'paint':n[2]>0?'term':'game',rt=[n[1]*up[2]-n[2]*up[1],n[2]*up[0]-n[0]*up[2],n[0]*up[1]-n[1]*up[0]],h=TS/2;
 return{fc,ty,uv:V.map(q=>ty==='top'?[(q[0]+1)*h,(q[2]+1)*h]:[(q[0]*rt[0]+q[1]*rt[1]+q[2]*rt[2]+1)*h,(q[1]+1)*h])}});
let LT=0;
const lcol=(ty,k,d,hv,u,v)=>{const b=LC[ty];let c;
 if(k==='w')c=LW;else if(k==='g')c=[250,248,255];else if(k==='l')c=mixc(b,[255,255,255],.3);else if(k==='d')c=mixc(b,LD,.3);
 else if(k==='k')c=mixc(b,LD,.42);else if(k==='K')c=mixc(b,LD,.68);else if(k==='K2')c=mixc(b,LD,.5);else if(k==='K3')c=mixc(b,LD,.6);else if(k==='G')c=mixc([235,232,255],mixc(b,LD,.68),.45);else if(k==='h')c=mixc(b,[255,255,255],.6);else if(k==='t')c=mixc(b,[255,255,255],.32);else if(k==='o')c=mixc(b,[255,255,255],.7);
 else if(k==='m')c=mixc(b,[255,255,255],.12);else if(k==='g2')c=(LT%2)<1?mixc(b,[255,255,255],.75):mixc(b,[255,255,255],.45);else if(k==='C')c=(LT%1)<.55?[250,248,255]:mixc(b,LD,.2);else if(PAL[k])c=PAL[k];else c=b;
 const sw=(LT%7)/7*110-30,sd=u+v-sw;if(sd>=0&&sd<4&&k!=='k'&&k!=='K')c=mixc(c,[255,255,255],sd<2?.32:.16);
 c=d>.62?mixc(c,[255,255,255],.08):d>.18?c:d>-.25?mixc(c,LD,.14):mixc(c,LD,.3);return hv?mixc(c,[255,255,255],.12):c};
function setLT(t){LT=t;buildTex(t)}

function mount(cv,opt){
 opt=opt||{};const period=opt.period||12,scale=opt.scale||1.5,box=cv.parentElement||cv;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cx=cv.getContext('2d');let W=0,img,ID,hov=0,last=0,vis=true,run=false,inside=false;
 function size(){const r=box.getBoundingClientRect();W=Math.max(48,Math.round(r.width/scale));if(cv.width===W)return;cv.width=cv.height=W;img=cx.createImageData(W,W);ID=new Uint8Array(W*W)}
 function draw(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;setLT(now/1000);
  /* clockwise seen from above, one full turn every `period` seconds */
  const yaw=Math.PI/4-now/1000*Math.PI*2/period;hov+=((inside?1:0)-hov)*(reduce?1:Math.min(1,dt*10));
  const ls=W*.255,F=W*2.2,c0=W/2,bob=reduce?0:Math.sin(now/1000*Math.PI/2)*W*.012,pit=-.44,hv=hov>.5;
  const D=img.data;D.fill(0);ID.fill(0);
  const vw=M.cube.v.map(p=>{const q=rX(rY([p[0]*ls,p[1]*ls,p[2]*ls],yaw),pit);return[q[0],q[1]+bob,q[2]]}),pr=q=>{const k=F/(F-q[2]);return[c0+q[0]*k,c0+q[1]*k]};
  for(const Lf of LF){const Q=Lf.fc.map(i=>vw[i]),a=Q[0],b=Q[1],c=Q[2],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const nl=Math.hypot(...n)||1;n=n.map(x=>x/nl);
   const cen=Q.reduce((s,p)=>[s[0]+p[0]/4,s[1]+p[1]/4,s[2]+p[2]/4],[0,0,0]);if(n[0]*-cen[0]+n[1]*-cen[1]+n[2]*(F-cen[2])<=0)continue;
   const d=n[0]*LIGHT[0]+n[1]*LIGHT[1]+n[2]*LIGHT[2],S=Q.map(pr),UV=Lf.uv,tx=TX[Lf.ty];
   for(const [i0,i1,i2] of [[0,1,2],[0,2,3]]){const A=S[i0],B=S[i1],C=S[i2],den=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(den)<1e-6)continue;
    const x0=Math.max(0,Math.floor(Math.min(A[0],B[0],C[0]))),x1=Math.min(W-1,Math.ceil(Math.max(A[0],B[0],C[0]))),y0=Math.max(0,Math.floor(Math.min(A[1],B[1],C[1]))),y1=Math.min(W-1,Math.ceil(Math.max(A[1],B[1],C[1])));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const px=x+.5,py=y+.5,w0=((B[1]-C[1])*(px-C[0])+(C[0]-B[0])*(py-C[1]))/den,w1=((C[1]-A[1])*(px-C[0])+(A[0]-C[0])*(py-C[1]))/den,w2=1-w0-w1;if(w0<-1e-4||w1<-1e-4||w2<-1e-4)continue;
     const uu=Math.min(TS-1,Math.max(0,Math.floor(w0*UV[i0][0]+w1*UV[i1][0]+w2*UV[i2][0]))),vv=Math.min(TS-1,Math.max(0,Math.floor(w0*UV[i0][1]+w1*UV[i1][1]+w2*UV[i2][1]))),col=lcol(Lf.ty,tx[vv*TS+uu],d,hv,uu,vv),k=(y*W+x)*4;
     D[k]=col[0];D[k+1]=col[1];D[k+2]=col[2];D[k+3]=255;ID[y*W+x]=1}}}
  /* 1px dark outline */
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){if(!ID[y*W+x])continue;if(x===0||y===0||x===W-1||y===W-1||!ID[y*W+x-1]||!ID[y*W+x+1]||!ID[(y-1)*W+x]||!ID[(y+1)*W+x]){const k=(y*W+x)*4;D[k]=22;D[k+1]=12;D[k+2]=52}}
  cx.putImageData(img,0,0);cv.dataset.frame=String((+cv.dataset.frame||0)+1)}
 const loop=n=>{if(!vis){run=false;return}run=true;draw(n);requestAnimationFrame(loop)};
 size();addEventListener('resize',()=>{size();draw(reduce?2400:performance.now())});
 /* light interaction only: a slight brighten while hovered */
 box.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;inside=true;if(reduce)draw(2400)});
 box.addEventListener('pointerleave',()=>{inside=false;if(reduce)draw(2400)});
 if(reduce){draw(2400);return}  /* one still frame, with every face mid-animation */
 if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis&&!run)requestAnimationFrame(loop)}).observe(box);else requestAnimationFrame(loop);
}
window.Cube3D={mount,M,rX,rY,LIGHT,LF,TX,TS,lcol,setLT};
})();
