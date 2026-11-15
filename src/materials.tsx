export const materials = [
  {id:'cemento',name:'Cemento',kind:'Material',unit:'bulto',code:'CEM',image:'/materials/cemento.jpg',author:'StaraBlazkova',source:'https://commons.wikimedia.org/wiki/File:Cement_bags.jpg',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
  {id:'arena',name:'Arena',kind:'Material',unit:'m³',code:'ARE',image:'/materials/arena.jpg',author:'Johnnybam',source:'https://commons.wikimedia.org/wiki/File:Building_Foundation_Site_Sand_Filling.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
  {id:'grava',name:'Grava',kind:'Material',unit:'m³',code:'GRA',image:'/materials/grava.jpg',author:'BobbbyLight',source:'https://commons.wikimedia.org/wiki/File:Gravel_pile_at_the_Old_Stone_Quarry,_Sevastopol,_Door_County,_Wisconsin.jpg',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/'},
  {id:'tubo-cobre',name:'Tubo de cobre',kind:'Material',unit:'m',code:'TUB',image:'/materials/tubo-cobre.jpg',author:'Santeri Viinamäki',source:'https://commons.wikimedia.org/wiki/File:Copper_water_pipes.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
  {id:'concreto',name:'Concreto',kind:'Material',unit:'m³',code:'CON',image:'/materials/concreto.jpg',author:'Pollinator',source:'https://commons.wikimedia.org/wiki/File:Concrete_pouring_0020.jpg',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
  {id:'blocks',name:'Blocks de concreto',kind:'Material',unit:'pieza',code:'BLK',image:'/materials/blocks.jpg',author:'Salil Kumar Mukherjee',source:'https://commons.wikimedia.org/wiki/File:Concrete_Masonry_blocks.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
  {id:'varillas',name:'Varillas',kind:'Material',unit:'kg',code:'VAR',image:'/materials/varillas.jpg',author:'MarnixR',source:'https://commons.wikimedia.org/wiki/File:Rebar.jpg',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'},
  {id:'excavacion',name:'Excavación',kind:'Servicio / trabajo',unit:'m³',code:'EXC',image:'/materials/excavacion.jpg',author:'NCDOTcommunications',source:'https://commons.wikimedia.org/wiki/File:Excavator_digging_trench.jpg',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/'},
] as const;
export type Material = typeof materials[number];
export function MaterialCredit({material}:{material:Material}) {
  return <span className="material-credit">Foto: <a href={material.source} target="_blank" rel="noreferrer">{material.author}</a> · <a href={material.licenseUrl} target="_blank" rel="noreferrer">{material.license}</a>. Imagen de referencia, encuadrada en pantalla.</span>;
}
