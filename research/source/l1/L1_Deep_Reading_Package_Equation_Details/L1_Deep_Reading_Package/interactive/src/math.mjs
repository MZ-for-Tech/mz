export const soft = (a, t) => Math.sign(a)*Math.max(Math.abs(a)-t, 0);
export const linspace = (a,b,n=161) => Array.from({length:n}, (_,i)=>a+(b-a)*i/(n-1));
export const sum = a => a.reduce((s,x)=>s+x,0);
export const dot = (a,b) => sum(a.map((x,i)=>x*b[i]));
export const norm1 = a => sum(a.map(Math.abs));
export const norm2 = a => Math.sqrt(dot(a,a));
export const matvec = (A,b) => A.map(row=>dot(row,b));
export function solve(A,b) {
  const n=b.length, m=A.map((row,i)=>[...row,b[i]]);
  for(let k=0;k<n;k++) {
    let pivot=k;
    for(let i=k+1;i<n;i++) if(Math.abs(m[i][k])>Math.abs(m[pivot][k])) pivot=i;
    [m[k],m[pivot]]=[m[pivot],m[k]];
    if(Math.abs(m[k][k])<1e-14) throw Error('Singular system');
    const q=m[k][k]; for(let j=k;j<=n;j++) m[k][j]/=q;
    for(let i=0;i<n;i++) if(i!==k) {
      const c=m[i][k]; for(let j=k;j<=n;j++) m[i][j]-=c*m[k][j];
    }
  }
  return m.map(row=>row[n]);
}
export function ridge(X,y,lambda) {
  const n=y.length,p=X[0].length;
  const gram=Array.from({length:p},(_,j)=>Array.from({length:p},(_,k)=>sum(X.map(row=>row[j]*row[k]))+(j===k?n*lambda:0)));
  return solve(gram,Array.from({length:p},(_,j)=>sum(X.map((row,i)=>row[j]*y[i]))));
}
export function lasso(X,y,lambda,tolerance=1e-10) {
  const n=y.length,p=X[0].length,b=Array(p).fill(0),r=[...y];
  const q=Array.from({length:p},(_,j)=>sum(X.map(row=>row[j]**2))/n);
  for(let step=0;step<50000;step++) {
    const prev=[...b];
    for(let j=0;j<p;j++) {
      for(let i=0;i<n;i++) r[i]+=X[i][j]*b[j];
      b[j]=soft(sum(X.map((row,i)=>row[j]*r[i]))/n,lambda)/q[j];
      for(let i=0;i<n;i++) r[i]-=X[i][j]*b[j];
    }
    if(Math.max(...b.map((x,i)=>Math.abs(x-prev[i])))<tolerance) return b;
  }
  throw Error('Coordinate descent did not converge');
}
export function bisect(f,a,b) {
  for(let k=0;k<90;k++) {const m=(a+b)/2;if(f(m)>0) a=m;else b=m;}
  return (a+b)/2;
}
export const loss = b => ((b[0]-2)**2+2*(b[1]-.3)**2)/2;
export function contact(t,kind) {
  if(kind==='l1') {
    if(t>=2.3) return [2,.3];
    const z=bisect(z=>Math.max(2-z,0)+Math.max(.3-z/2,0)-t,0,3);
    return [Math.max(2-z,0),Math.max(.3-z/2,0)];
  }
  if(t>=Math.hypot(2,.3)) return [2,.3];
  const z=bisect(z=>Math.hypot(2/(1+z),.6/(2+z))-t,0,100);
  return [2/(1+z),.6/(2+z)];
}
export function reconstruct(U,s,Vt) {
  return U.map(row=>Vt[0].map((_,j)=>sum(s.map((x,k)=>row[k]*x*Vt[k][j]))));
}
