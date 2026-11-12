export const materials = [
  {id:'concreto',name:'Concreto',kind:'Material',unit:'m³',code:'CON',image:'/materials/concreto.jpg',author:'Pollinator',source:'https://commons.wikimedia.org/wiki/File:Concrete_pouring_0020.jpg',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
  {id:'blocks',name:'Blocks de concreto',kind:'Material',unit:'pieza',code:'BLK',image:'/materials/blocks.jpg',author:'Salil Kumar Mukherjee',source:'https://commons.wikimedia.org/wiki/File:Concrete_Masonry_blocks.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
  {id:'varillas',name:'Varillas',kind:'Material',unit:'kg',code:'VAR',image:'/materials/varillas.jpg',author:'MarnixR',source:'https://commons.wikimedia.org/wiki/File:Rebar.jpg',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'},
  {id:'excavacion',name:'Excavación',kind:'Servicio / trabajo',unit:'m³',code:'EXC',image:'/materials/excavacion.jpg',author:'NCDOTcommunications',source:'https://commons.wikimedia.org/wiki/File:Excavator_digging_trench.jpg',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/'},
] as const;
export type Material = typeof materials[number];
export function MaterialCredit({material}:{material:Material}) {
  return <span className="material-credit">Foto: <a href={material.source} target="_blank" rel="noreferrer">{material.author}</a> · <a href={material.licenseUrl} target="_blank" rel="noreferrer">{material.license}</a>. Imagen de referencia, encuadrada en pantalla.</span>;
}
