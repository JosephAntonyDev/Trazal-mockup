import {distributeDaily,freezeProject} from './project-core.mjs';
import type {Project} from './Works';
export function demoWork():Project {
 const id=()=>crypto.randomUUID();
 const finish=new Date();finish.setDate(finish.getDate()-1);const end=finish.toISOString().slice(0,10);
 const begin=new Date(finish);begin.setUTCDate(begin.getUTCDate()-13);const start=begin.toISOString().slice(0,10);
 const cut=new Date(begin);cut.setUTCDate(cut.getUTCDate()+6);const date=cut.toISOString().slice(0,10);
 const concepts=[{id:id(),code:'EXC-01',description:'Excavación para desplante de banqueta',unit:'m³',quantity:40,price:250},{id:id(),code:'CON-01',description:'Construcción de banqueta de concreto de 10 cm',unit:'m²',quantity:200,price:650}].map(c=>({...c,pricing:'quoted',indirect:0,profit:0,charges:0,start,end,daily:distributeDaily(c.quantity,start,end)}));
 const draft:Project={id:id(),name:'Banqueta en calle Reforma · ejemplo',type:'Banquetas y urbanización',dimensions:'200 m²',start,end,iva:16,concepts,notes:['Obra ficticia para recorrer materiales, presupuesto, programa, avances, gastos y reportes.'],progress:[],expenses:[],resources:[{id:id(),name:'Concreto para banqueta',kind:'Material',unit:'m³',quantity:20,price:2600,notes:'Precio de referencia de esta obra',imageId:'concreto'},{id:id(),name:'Varilla corrugada de 3/8',kind:'Material',unit:'kg',quantity:300,price:24,notes:'Sin conversión automática a piezas',imageId:'varillas'},{id:id(),name:'Excavación',kind:'Servicio / trabajo',unit:'m³',quantity:40,price:250,notes:'Trabajo contratado',imageId:'excavacion'}],cash:[{id:id(),date:start,label:'Anticipo recibido · ejemplo',kind:'income',amount:80000},{id:id(),date,label:'Pago a proveedor de concreto · ejemplo',kind:'payment',amount:45000}]};
 const fixed=freezeProject(draft) as Project;
 return {...fixed,progress:concepts.map(c=>({id:id(),conceptId:c.id,start,end:date,percent:60})),expenses:[{id:id(),conceptId:concepts[1].id,date,label:'Compra de concreto · ejemplo',amount:75000,iva:16,quantity:20,unit:'m³',category:'Materiales'},{id:id(),conceptId:'',date,label:'Servicio topográfico · ejemplo',amount:12000,iva:0,quantity:0,unit:'',category:'Servicios'}]};
}
