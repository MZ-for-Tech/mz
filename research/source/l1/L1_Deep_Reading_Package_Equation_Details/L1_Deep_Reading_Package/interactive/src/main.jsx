import React, {useState,useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {motion,MotionConfig,AnimatePresence} from 'framer-motion';
import figures from './figures.generated.json';
import {soft,linspace,sum,dot,norm1,norm2,matvec,ridge,lasso,contact,loss,reconstruct} from './math.mjs';
import './style.css';

const fmt=x=>Math.abs(x)<1e-9?'0':Number(x.toFixed(4)).toString();
const tickfmt=x=>Math.abs(x)<1e-9?'0':Number(x.toFixed(2)).toString();
const vfmt=a=>'('+a.map(fmt).join(', ')+')';
const text=(value,lang)=>typeof value==='string'?value:value[lang];
const color=i=>['var(--accent)','var(--olive)','var(--pencil)','var(--gold)'][i%4];
const samples=(f,a,b,n=161)=>linspace(a,b,n).map(x=>[x,f(x)]);
const circle=(r,c=[0,0],q=[1,1])=>linspace(0,2*Math.PI,181).map(a=>[c[0]+r*Math.cos(a)/Math.sqrt(q[0]),c[1]+r*Math.sin(a)/Math.sqrt(q[1])]);
const diamond=t=>[[0,t],[t,0],[0,-t],[-t,0],[0,t]];

function Plot({series=[],points=[],x=[-3,3],y=[-3,3],xlabel='x',ylabel='y',equal=false,children}) {
  const W=720,H=equal?720:420,L=68,R=25,T=25,B=65;
  const width=W-L-R,height=H-T-B;
  let xd=[...x],yd=[...y];
  if(equal) {const ratio=width/height; const cy=(y[0]+y[1])/2;const half=(x[1]-x[0])/ratio/2;yd=[cy-half,cy+half];}
  const px=a=>L+(a-xd[0])/(xd[1]-xd[0])*width;
  const py=b=>T+(yd[1]-b)/(yd[1]-yd[0])*height;
  const path=pts=>pts.map(([a,b],i)=>`${i?'L':'M'}${px(a).toFixed(3)},${py(b).toFixed(3)}`).join(' ');
  const tx=linspace(xd[0],xd[1],5),ty=linspace(yd[0],yd[1],5);
  return <div className="plot-wrap" dir="ltr"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${ylabel} versus ${xlabel}`}>
    <defs><clipPath id="plot-clip"><rect x={L} y={T} width={width} height={height}/></clipPath></defs>
    {tx.map(a=><g key={'x'+a}><line className="grid" x1={px(a)} x2={px(a)} y1={T} y2={H-B}/><text className="tick" x={px(a)} y={H-B+24} textAnchor="middle">{tickfmt(a)}</text></g>)}
    {ty.map(b=><g key={'y'+b}><line className="grid" x1={L} x2={W-R} y1={py(b)} y2={py(b)}/><text className="tick" x={L-10} y={py(b)+5} textAnchor="end">{tickfmt(b)}</text></g>)}
    {xd[0]<=0&&xd[1]>=0&&<line className="axis" x1={px(0)} x2={px(0)} y1={T} y2={H-B}/>}
    {yd[0]<=0&&yd[1]>=0&&<line className="axis" x1={L} x2={W-R} y1={py(0)} y2={py(0)}/>}
    <g clipPath="url(#plot-clip)">
      {series.map((s,i)=><motion.path key={s.label??i} initial={false} animate={{d:path(s.points)}} stroke={s.color??color(i)} strokeWidth={s.width??2.8} strokeDasharray={s.dash??'none'} fill="none"/>)}
      {points.map((p,i)=><motion.circle key={'p'+i} initial={false} animate={{cx:px(p.x),cy:py(p.y)}} r={p.open?6:5} fill={p.open?'var(--paper)':p.color??color(i)} stroke={p.color??color(i)} strokeWidth={2}><title>{p.label??vfmt([p.x,p.y])}</title></motion.circle>)}
    </g>
    <text className="axis-label" x={L+width/2} y={H-12} textAnchor="middle">{xlabel}</text>
    <text className="axis-label" x={19} y={T+height/2} textAnchor="middle" transform={`rotate(-90 19 ${T+height/2})`}>{ylabel}</text>
    {children}
  </svg>
  <div className="legend">{series.filter(s=>s.label).map((s,i)=><span key={i}><i style={{background:s.color??color(i)}}/>{s.label}</span>)}</div></div>;
}

function Bars({groups,series,labels,lang}) {
  const W=720,H=360,L=65,R=20,T=30,B=65,w=W-L-R,h=H-T-B;
  const values=series.flatMap(s=>s.values),min=Math.min(0,...values),max=Math.max(.001,...values)*1.14;
  const py=v=>T+(max-v)/(max-min)*h;
  const cluster=w/groups.length,bw=Math.min(70,cluster*.72/series.length);
  return <div dir="ltr"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={labels??'Bar comparison'}>
    {linspace(min,max,5).map(v=><g key={v}><line className="grid" x1={L} x2={W-R} y1={py(v)} y2={py(v)}/><text className="tick" x={L-8} y={py(v)+5} textAnchor="end">{tickfmt(v)}</text></g>)}
    <line className="axis" x1={L} x2={W-R} y1={py(0)} y2={py(0)}/>
    {groups.map((label,i)=><g key={i}>
      {series.map((s,j)=>{const value=s.values[i],height=Math.abs(py(value)-py(0)),x=L+cluster*(i+.5)+(j-series.length/2)*bw;return <g key={j}>
        <motion.rect initial={false} animate={{x,y:Math.min(py(value),py(0)),width:bw-4,height}} fill={s.color??color(j)}><title>{`${text(s.label,lang)}: ${fmt(value)}`}</title></motion.rect>
        {series.length===1&&<text className="bar-value" x={x+(bw-4)/2} y={value>=0?py(value)-8:py(value)+18} textAnchor="middle">{fmt(value)}</text>}
      </g>;})}
      <text className="tick" x={L+cluster*(i+.5)} y={H-B+28} textAnchor="middle">{text(label,lang)}</text>
    </g>)}
  </svg><div className="legend">{series.map((s,i)=><span key={i}><i style={{background:s.color??color(i)}}/>{text(s.label,lang)}</span>)}</div></div>;
}

function Readout({children}) {return <div className="readout" aria-live="polite">{children}</div>;}
function Matrix({matrix,label}) {
  return <div className="matrix-wrap"><p>{label}</p><table dir="ltr" className="matrix"><tbody>{matrix.map((row,i)=><tr key={i}>{row.map((value,j)=><td key={j}><motion.div initial={false} animate={{backgroundColor:Math.abs(value)<1e-9?'var(--paper)':'var(--accent)',opacity:1}}/><span style={{color:Math.abs(value)<1e-9?'var(--ink)':'var(--paper)'}}>{fmt(value)}</span></td>)}</tr>)}</tbody></table></div>;
}

export function Figure({cfg,state:s,lang,onChange=()=>{}}) {
  const d=cfg.data,t=s.budget;
  const tr=(ar,en)=>lang==='ar'?ar:en;
  switch(cfg.renderer) {
    case 'normBalls': return <><Plot x={[-2.2,2.2]} y={[-1.2,1.2]} equal xlabel="w₁" ylabel="w₂" series={[
      {label:'L1',points:diamond(t)},{label:'L2',points:circle(t)},
      {label:'L∞',points:[[-t,-t],[t,-t],[t,t],[-t,t],[-t,-t]],dash:'7 5'}]}/><Readout>{tr('لكل شكل الميزانية نفسها:','Same budget for every shape:')} t={fmt(t)}.</Readout></>;
    case 'history': {const e=d.events[s.landmark];return <>
      <p className="date-note">{text(d.dateConvention,lang)}</p>
      <ol className="timeline">{d.events.map((event,i)=><motion.li initial={false} animate={{opacity:i===s.landmark?1:.7}} key={`${event.year}-${event.method}`}>
        <button type="button" className="landmark" aria-pressed={i===s.landmark} onClick={()=>onChange({landmark:i})}><strong>{event.year}</strong><span>{event.method}</span></button>
      </motion.li>)}</ol>
      <div className="history-navigation"><button type="button" disabled={s.landmark===0} onClick={()=>onChange({landmark:s.landmark-1})}>{tr('المحطة السابقة','Previous landmark')}</button><span>{s.landmark+1} / {d.events.length}</span><button type="button" disabled={s.landmark===d.events.length-1} onClick={()=>onChange({landmark:s.landmark+1})}>{tr('المحطة التالية','Next landmark')}</button></div>
      <Readout><motion.section key={`${e.year}-${e.method}`} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} className="history-detail" aria-labelledby="history-question">
        <p className="history-year">{e.year} · {e.method}</p><p className="history-authors" dir="ltr">{e.authors}</p>
        <h2 id="history-question">{text(e.question,lang)}</h2><p>{text(e.description,lang)}</p>
        <h3>{tr('الفكرة التي نأخذها معنا','The idea to carry forward')}</h3><p>{text(e.intuition,lang)}</p>
        <h3>{tr('إلى أين يصل هذا الادعاء؟','How far does this claim reach?')}</h3><p>{text(e.caveat,lang)}</p>
        <p className="history-connection">{text(e.connection,lang)} <a href={`?figure=${e.relatedFigure}&lang=${lang}`}>{tr('افتح المثال','Open the example')}</a></p>
        <div className="history-references"><h3>{tr('الورقة الأصلية','Original paper')}</h3>{e.references.map(ref=><a key={ref.url} href={ref.url} target="_blank" rel="noreferrer">{ref.title}</a>)}</div>
      </motion.section></Readout></>;}
    case 'countMagnitude': {const a=s.value;return <><Plot x={[-2.2,2.2]} y={[-.1,2.3]} xlabel="w" ylabel={tr('التكلفة','Cost')} series={[
      {label:'L1 = |w|',points:samples(Math.abs,-2,2)},
      {label:'L0',points:[[-2,1],[-.001,1]],color:color(1)},
      {points:[[.001,1],[2,1]],color:color(1)}]} points={[{x:0,y:1,open:true,color:color(1)},{x:0,y:0,color:color(1)},{x:a,y:Math.abs(a)},{x:a,y:a===0?0:1,color:color(1)}]}/>
      <Readout>w={fmt(a)}; L1={fmt(Math.abs(a))}; L0={a===0?0:1}.<p dir="ltr">{d.vectors.map(v=>`${vfmt(v)}: L1=${norm1(v)}, L0=${v.filter(x=>x!==0).length}`).join(' · ')}</p></Readout></>;}
    case 'geometry': {const one=contact(t,'l1'),two=contact(t,'l2');return <><Plot x={[-2.8,2.8]} y={[-1.5,1.5]} equal xlabel="β₁" ylabel="β₂" series={[
      {label:'L1 budget',points:diamond(t)}, {label:'L2 budget',points:circle(t)},
      {label:'L1 loss contour',points:circle(Math.sqrt(2*loss(one)),d.center,d.curvature),color:color(0),dash:'5 5'},
      {label:'L2 loss contour',points:circle(Math.sqrt(2*loss(two)),d.center,d.curvature),color:color(1),dash:'5 5'}]} points={[{x:one[0],y:one[1],label:'L1 optimum'},{x:two[0],y:two[1],label:'L2 optimum',color:color(1)},{x:2,y:.3,label:'Unconstrained',color:color(2)}]}/>
      <Readout><span dir="ltr">L1: {vfmt(one)}; F={fmt(loss(one))}. L2: {vfmt(two)}; F={fmt(loss(two))}.</span><p>{tr('نفس الخسارة، قيدان مختلفان؛ المعين قد يلامس رأسا أو ضلعا.','Same loss, different constraints; the diamond can contact a vertex or an edge.')}</p></Readout></>;}
    case 'path': {const vals=d.preferred.map(a=>soft(a,s.lambda));return <><Plot x={[0,2.2]} y={[-1.2,2.2]} xlabel="λ" ylabel="β" series={d.preferred.map((a,i)=>({label:`β${i+1}`,points:samples(l=>soft(a,l),0,2.2)}))} points={vals.map((v,i)=>({x:s.lambda,y:v,color:color(i)}))}/><Readout><span dir="ltr">λ={fmt(s.lambda)}, β={vfmt(vals)}, L0={vals.filter(x=>x!==0).length}</span></Readout></>;}
    case 'regression': {const b0=ridge(d.X,d.y,0),br=ridge(d.X,d.y,s.ridgeLambda),bl=lasso(d.X,d.y,s.lassoLambda);const bs=[b0,br,bl];const mse=bs.map(b=>sum(matvec(d.Xreference,b).map((v,i)=>(d.yreference[i]-d.intercept-v)**2))/d.yreference.length);const lambdaMax=Math.max(...d.X[0].map((_,j)=>Math.abs(sum(d.X.map((row,i)=>row[j]*d.y[i])))/d.y.length));return <><Bars groups={['β₁','β₂','β₃']} series={bs.map((b,i)=>({label:['OLS','Ridge','Lasso'][i],values:b}))} lang={lang}/><Readout>{bs.map((b,i)=><p key={i} dir="ltr">{['OLS','Ridge','Lasso'][i]}: {vfmt(b)} · MSE={fmt(mse[i])}</p>)}<p dir="ltr">λmax={fmt(lambdaMax)} · λ/λmax={fmt(s.lassoLambda/lambdaMax)} · {tr('معاملات نشطة','active coefficients')}={bl.filter(v=>Math.abs(v)>1e-8).length}</p><button type="button" onClick={()=>onChange({lassoLambda:lambdaMax})}>{tr('جرّب λmax','Try λmax')}</button><p>{tr('الضبط يغير المعاملات والخطأ معا؛ هذه عينة مرجعية تعليمية.','Tuning changes coefficients and error together; this is an educational reference sample.')}</p></Readout></>;}
    case 'threshold': {const a=s.a,l=s.lambda,w=soft(a,l),wr=a/(1+l);const cost=x=>(x-a)**2/2+l*Math.abs(x),ridgeCost=x=>(x-a)**2/2+l*x*x/2;return <>{s.view==='objective'?<Plot x={[-4,4]} y={[0,Math.max(cost(-4),cost(4),ridgeCost(-4),ridgeCost(4))*1.06]} xlabel="w" ylabel={tr('الهدف الكامل','Full objective')} series={[{label:tr('هدف Lasso','Lasso objective'),points:samples(cost,-4,4)},{label:tr('هدف Ridge','Ridge objective'),points:samples(ridgeCost,-4,4),color:color(1)}]} points={[{x:w,y:cost(w),label:'Lasso optimum'},{x:wr,y:ridgeCost(wr),label:'Ridge optimum',color:color(1)}]}/>:<Plot x={[-3,3]} y={[-3,3]} xlabel="a" ylabel="ŵ" series={[
      {label:'OLS',points:samples(x=>x,-3,3),color:color(2),dash:'5 5'},
      {label:'Ridge',points:samples(x=>x/(1+l),-3,3),color:color(1)},
      {label:'Lasso',points:samples(x=>soft(x,l),-3,3),color:color(0)}]} points={[{x:a,y:w},{x:a,y:wr,color:color(1)}]}/>}<Readout><span dir="ltr">a={fmt(a)}, λ={fmt(l)}, Lasso={fmt(w)}, Ridge={fmt(wr)}</span><p>{tr('مجال الصفر في Lasso:','Lasso zero interval:')} [−{fmt(l)}, {fmt(l)}].</p>{s.view==='objective'&&<p dir="ltr">{tr('عند حل Lasso','At the Lasso optimum')}: {fmt((w-a)**2/2)} + {fmt(l*Math.abs(w))} = {fmt(cost(w))}.</p>}</Readout></>;}
    case 'stability': {const n=s.samples,f=Array(3).fill(0);for(const row of d.selected.slice(0,n)) row.forEach((x,i)=>f[i]+=x/n);return <><Bars groups={[tr('x1: الإشارة','x1: signal'),tr('x2: بديل','x2: proxy'),tr('x3: ضجيج','x3: noise')]} series={[{label:tr('تواتر الاختيار','Selection frequency'),values:f}]} lang={lang}/><Readout><span dir="ltr">n={n}, λ=0.07, seed={d.seed}; {vfmt(f)}</span><p>{tr('التواتر يتغير مع العينات؛ لا يمثل احتمالا بايزيا أو ضمان سببية.','Frequency changes with resamples; it is neither a Bayesian probability nor a causal guarantee.')}</p></Readout></>;}
    case 'recovery': {const good=s.case==='good',t=s.t,z=good?[1-t,-t,t]:[1-2*t,t],cost=good?x=>Math.abs(1-x)+2*Math.abs(x):x=>Math.abs(1-2*x)+Math.abs(x);return <><Plot x={[-.4,1.1]} y={[0,2.7]} xlabel="t" ylabel="L1" series={[{label:good?'(1−t, −t, t)':'(1−2t, t)',points:samples(cost,-.4,1.1)}]} points={[{x:t,y:cost(t)}]}/><Readout><span dir="ltr">z={vfmt(z)}; Az={vfmt(matvec(good?d.A_good:d.A_bad,z))}; L1={fmt(norm1(z))}.</span><p>{good?tr('أصغر تكلفة عند t=0 فتستعاد الإشارة.','Minimum cost is at t=0, recovering the signal.'):tr('أصغر تكلفة عند t=0.5، فيختار L1 بديلا عن الإشارة الأصلية.','Minimum cost is at t=0.5, so L1 chooses an alternative to the original.')}</p></Readout></>;}
    case 'tv': {const delta=Math.max(40-2*s.lambda/3,0),row=[30-delta/2,30-delta/2,30-delta/2,30+delta/2,30+delta/2,30+delta/2],diff=row.slice(1).map((v,i)=>v-row[i]);return <><Plot x={[1,6]} y={[0,60]} xlabel={tr('موضع العنصر','Entry position')} ylabel={tr('الشدة','Intensity')} series={[{label:tr('الأصل','Original'),points:d.row.map((v,i)=>[i+1,v]),color:color(2),dash:'5 5'},{label:tr('حل TV','TV solution'),points:row.map((v,i)=>[i+1,v])}]}/><Readout><span dir="ltr">u={vfmt(row)}; Du={vfmt(diff)}; TV={fmt(norm1(diff))}.</span><p>{tr('المتوسط ثابت عند 30؛ يوجد ثلاثة عناصر في كل منطقة ولذلك عتبة الفرق 2λ/3.','The mean stays at 30; three entries per region make the difference threshold 2λ/3.')}</p></Readout></>;}
    case 'weights': {const W=d.matrix.map(row=>s.mode==='element'?row.map(v=>soft(v,s.lambda)):row.map(v=>v*Math.max(1-s.lambda/norm2(row),0)));return <><div className="matrix-pair"><Matrix matrix={d.matrix} label={tr('الأوزان الأصلية','Original weights')}/><Matrix matrix={W} label={tr('بعد العملية القريبة','After proximal update')}/></div><Readout>{tr('أصفار دقيقة:','Exact zeros:')} {W.flat().filter(x=>Math.abs(x)<1e-10).length}/{W.flat().length}; {tr('صفوف محذوفة:','Removed rows:')} {W.filter(row=>row.every(x=>Math.abs(x)<1e-10)).length}/{W.length}.<p>{tr('صفر اتصال لا يساوي حذف قناة كاملة.','A zero connection is not a removed channel.')}</p></Readout></>;}
    case 'storage': {const nnz=Math.round(d.rows*d.columns*(1-s.sparsity/100)),dense=d.rows*d.columns*d.valueBytes,csr=nnz*(d.valueBytes+d.indexBytes)+(d.rows+1)*d.indexBytes;return <><Bars groups={['Dense','CSR']} series={[{label:tr('ميغابايت عشرية خام','Raw decimal MB'),values:[dense/1e6,csr/1e6]}]} lang={lang}/><Readout><span dir="ltr">nnz={nnz.toLocaleString('en')}; dense={dense.toLocaleString('en')} B; CSR={csr.toLocaleString('en')} B.</span><p>{text(d.stages[s.stage],lang)}</p><p>{tr('لا يوجد قياس سرعة في هذه الرسمة.','This figure contains no speed benchmark.')}</p></Readout></>;}
    case 'singular': {const ss=d.singularValues.map(x=>Math.max(x-s.tau,0)),M=reconstruct(d.U,ss,d.Vt),err=Math.sqrt(sum(d.matrix.flat().map((x,i)=>(x-M.flat()[i])**2)));return <><Bars groups={['σ₁','σ₂']} series={[{label:tr('الأصل','Original'),values:d.singularValues},{label:tr('بعد العتبة','After threshold'),values:ss}]} lang={lang}/><Matrix matrix={M} label={tr('المصفوفة المعاد بناؤها','Reconstructed matrix')}/><Readout><span dir="ltr">τ={fmt(s.tau)}, σ={vfmt(ss)}, rank={ss.filter(x=>x>1e-10).length}, Frobenius error={fmt(err)}</span></Readout></>;}
    case 'envelope': {const M=s.M,w=s.fraction*M;return <><Plot x={[-3.2,3.2]} y={[-.1,1.3]} xlabel="w" ylabel={tr('التكلفة','Cost')} series={[
      {label:'|w|/M',points:samples(x=>Math.abs(x)/M,-M,M)},
      {label:'L0',points:[[-M,1],[-.0001,1]],color:color(1)},
      {points:[[.0001,1],[M,1]],color:color(1)}]} points={[{x:0,y:1,open:true,color:color(1)},{x:0,y:0,color:color(1)},{x:w,y:Math.abs(w)/M}]}/><Readout><span dir="ltr">M={fmt(M)}, w={fmt(w)}, |w|/M={fmt(Math.abs(w)/M)}, L0={w===0?0:1}.</span><p>{tr('المنحنى مقيد بالمجال [−M، M]؛ على المجال غير المحدود يكون الغلاف صفرا.','The curve is restricted to [−M, M]; on an unbounded domain the envelope is zero.')}</p></Readout></>;}
    case 'gap': {const history=d.history.filter(([k])=>k%5===0).map(([k,g])=>[k,Math.log10(g)]),point=d.history[s.iteration];return <><Plot x={[0,1200]} y={[-16,1]} xlabel={tr('الخطوة','Iteration')} ylabel="log₁₀(primal−dual)" series={[{label:tr('فجوة الهدف','Objective gap'),points:history}]} points={[{x:point[0],y:Math.log10(point[1])}]}/><Readout><span dir="ltr">k={point[0]}, gap={point[1].toExponential(3)}, λ={d.lambda}, η={fmt(d.stepSize)}</span><p>{tr('الحد السفلي للعرض 10⁻¹⁶؛ قربه تتدخل دقة الأعداد العائمة.','The display floor is 10⁻¹⁶; floating-point precision matters near it.')}</p></Readout></>;}
    default: throw Error(`Unknown renderer ${cfg.renderer}`);
  }
}

function Viewer({cfg,lang}) {
  const defaults=()=>Object.fromEntries(cfg.controls.map(c=>[c.key,c.default]));
  const [state,setState]=useState(defaults);
  const change=patch=>setState(previous=>({...previous,...patch}));
  const rendered=useMemo(()=><Figure cfg={cfg} state={state} lang={lang} onChange={change}/>,[cfg,state,lang]);
  function exportJSON(){const data=JSON.stringify({...cfg,currentState:state},null,2),a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.href=url;a.download=cfg.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <MotionConfig transition={{duration:cfg.framerMotion.duration,ease:cfg.framerMotion.ease}} reducedMotion="user">
    <motion.article initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <p className="eyebrow">L1{cfg.source.additionalResearchFigure?(lang==='ar'?' · من البحث المرافق':' · Research companion'):''}</p>
      <h1>{text(cfg.title,lang)}</h1><p className="caption">{text(cfg.caption,lang)}</p>
      <div className="figure-layout"><div className="figure-body">{rendered}{cfg.teaching&&<div className="teaching"><h2>{lang==='ar'?'جرّب ثم لاحظ':'Try and observe'}</h2><p>{text(cfg.teaching.try,lang)}</p><p>{text(cfg.teaching.notice,lang)}</p></div>}</div>
      <form className="controls" onSubmit={e=>e.preventDefault()}>{cfg.controls.map(c=><label key={c.key}>
        <span>{text(c.label,lang)} <output dir="ltr">{c.type==='range'?fmt(state[c.key]):''}</output></span>
        {c.type==='range'?<input type="range" min={c.min} max={c.max} step={c.step} value={state[c.key]} onChange={e=>setState({...state,[c.key]:Number(e.target.value)})}/>:<select value={state[c.key]} onChange={e=>setState({...state,[c.key]:e.target.value})}>{c.options.map(o=><option key={o.value} value={o.value}>{text(o.label,lang)}</option>)}</select>}
      </label>)}<button type="button" onClick={()=>setState(defaults())}>{lang==='ar'?'إعادة القيم':'Reset values'}</button><button type="button" onClick={exportJSON}>{lang==='ar'?'تنزيل JSON':'Download JSON'}</button></form></div>
      <p className="source">{lang==='ar'?'الرسم مبني على':'Figure based on'} {cfg.source.pdf} · {lang==='ar'?'الصفحات الفعلية':'Physical pages'} {cfg.source.physicalPages.join(', ')}.</p>
    </motion.article>
  </MotionConfig>;
}

export function App(){
  const params=new URLSearchParams(location.search);
  const initial=figures.some(f=>f.id===params.get('figure'))?params.get('figure'):figures[0].id;
  const [id,setId]=useState(initial),[lang,setLang]=useState(params.get('lang')==='en'?'en':'ar'),[dark,setDark]=useState(false);
  const cfg=figures.find(f=>f.id===id),theme=cfg.theme[dark?'dark':'light'];
  const style={'--paper':theme.paper,'--ink':theme.ink,'--accent':theme.accent,'--pencil':theme.pencil,'--secondary':theme.secondary,'--olive':cfg.theme.additional_plot_color.olive,'--gold':cfg.theme.additional_plot_color.gold};
  function update(nextId,nextLang){setId(nextId);setLang(nextLang);const p=new URLSearchParams({figure:nextId,lang:nextLang});try{history.replaceState(null,'','?'+p);}catch{} }
  return <main dir={lang==='ar'?'rtl':'ltr'} lang={lang} style={style}>
    <header><a className="wordmark" href="https://www.mzfortech.com/research" target="_blank" rel="noreferrer">MZ · THE NULL HYPOTHESIS</a><div className="header-actions"><button onClick={()=>update(id,lang==='ar'?'en':'ar')}>{lang==='ar'?'English':'العربية'}</button><button onClick={()=>setDark(!dark)}>{lang==='ar'?(dark?'فاتح':'داكن'):(dark?'Light':'Dark')}</button></div></header>
    <nav aria-label={lang==='ar'?'اختيار الرسم':'Figure selection'}><label>{lang==='ar'?'استكشف الرسومات':'Explore the figures'}<select value={id} onChange={e=>update(e.target.value,lang)}>{figures.map((f,i)=><option key={f.id} value={f.id}>{String(i+1).padStart(2,'0')} · {text(f.title,lang)}</option>)}</select></label><span>{figures.findIndex(f=>f.id===id)+1} / {figures.length}</span></nav>
    <AnimatePresence mode="wait"><Viewer key={id} cfg={cfg} lang={lang}/></AnimatePresence>
    <footer>{lang==='ar'?'ألوان مأخوذة من صفحة البحث في MZ. حرّك عناصر التحكم لتتغير الحسابات والرسمة معا.':'Colors taken from the MZ research page. Controls update both the calculations and the figure.'}</footer>
  </main>;
}
class Boundary extends React.Component{constructor(p){super(p);this.state={error:null};}static getDerivedStateFromError(error){return {error};}render(){return this.state.error?<main><h1>Figure error</h1><p>{this.state.error.message}</p></main>:this.props.children;}}
if(typeof document!=='undefined') createRoot(document.getElementById('root')).render(<Boundary><App/></Boundary>);
