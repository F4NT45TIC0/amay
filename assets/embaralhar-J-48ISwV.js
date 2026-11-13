function e(r,n=Math.random){const o=[...r];for(let t=o.length-1;t>0;t--){const a=Math.floor(n()*(t+1));[o[t],o[a]]=[o[a],o[t]]}return o}export{e};
