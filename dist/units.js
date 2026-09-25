// Source: presentation pages 6–14. Interpretative coordinates, not surveyed dimensions.
export const levels=[0,3.7,6.6,9.5,12.4,15.3];
export const types={A:{area:72,page:10,rooms:'3 ambientes'},B:{area:55,page:11,rooms:'3 ambientes'},C:{area:36,page:12,rooms:'1 ambiente'},D:{area:96,page:13,rooms:'Dúplex · 3 ambientes'},E:{area:86,page:14,rooms:'Dúplex · 3 ambientes'}};
export const units=[];
for(let floor=1;floor<=4;floor++)(floor===4?['D','D','E','E']:['A','A','B','C','B']).forEach((type,i)=>units.push({id:String(floor*100+i+1),floor,type,...types[type],side:i<2?'Frente':'Contrafrente',upper:floor===4,slot:i+1}));
export function placement(unit,upper=false){
 const rear=unit.side==='Contrafrente';let sign=unit.slot===1?1:-1,offset=0,width=9.01,depth=9.64;
 if(rear){if(unit.floor===4)sign=unit.slot===4?1:-1;else if(unit.type==='C'){sign=1;offset=-2.5;width=5;depth=8.07;}else{sign=unit.slot===5?1:-1;offset=sign*2.5;width=6.51;depth=9.825;}}
 return {point:(u,v)=>[offset+sign*u*width,rear?-29.565+v*depth:-1.3-v*depth],width,depth,y:levels[upper?5:unit.floor]+.08,rear};
}
