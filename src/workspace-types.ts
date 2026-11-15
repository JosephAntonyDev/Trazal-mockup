export type Resource={id:string;name:string;kind:'Material'|'Servicio / trabajo'|'Equipo';unit:string;quantity:number|null;price:number|null;notes:string;imageId?:string};
export type CashEntry={id:string;date:string;label:string;kind:'income'|'payment';amount:number};
