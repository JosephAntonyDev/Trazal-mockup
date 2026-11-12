import {useLayoutEffect, useRef, useState, type FormEvent, type ReactNode} from 'react';

// Read the rendered controls, so native constraints and conditional fields stay in sync.
export function ReadyForm({children,onSubmit,onCancel,editing=false,extra='',ready=true,showSave=true,saveLabel='Guardar'}:{children:ReactNode;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;editing?:boolean;extra?:string;ready?:boolean;showSave?:boolean;saveLabel?:string}) {
  const form=useRef<HTMLFormElement>(null);
  const initial=useRef<string|null>(null);
  const [enabled,setEnabled]=useState(false);
  const [,refresh]=useState(0);
  function inspect() {
    const node=form.current;
    if(!node)return false;
    const controls=Array.from(node.elements).filter((el):el is HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement=>el instanceof HTMLInputElement||el instanceof HTMLSelectElement||el instanceof HTMLTextAreaElement);
    const snapshot=JSON.stringify([Array.from(new FormData(node).entries()).map(([key,value])=>[key,typeof value==='string'?(controls.some(el=>el.name===key&&el instanceof HTMLInputElement&&el.type==='number')&&value.trim()!==''?String(Number(value)):value.trim()):value]),extra]);
    if(initial.current===null)initial.current=snapshot;
    const valid=controls.every(el=>el.disabled||el.validity.valid&&(!el.required||el.value.trim().length>0));
    const data=new FormData(node),start=data.get('start'),end=data.get('end');
    return ready&&valid&&(!start||!end||String(start)<=String(end))&&(!editing||snapshot!==initial.current);
  }
  useLayoutEffect(()=>{setEnabled(inspect());});
  return <form ref={form} onInput={()=>refresh(v=>v+1)} onChange={()=>refresh(v=>v+1)} onSubmit={event=>{if(!inspect()){event.preventDefault();return;}onSubmit(event);}}>
    <fieldset className="ready-form-fields">{children}</fieldset>
    <div className="modal-actions"><button className="button" type="button" onClick={onCancel}>{showSave?'Cancelar':'Cerrar detalle'}</button>{showSave&&<button className="button primary" type="submit" disabled={!enabled}>{saveLabel}</button>}</div>
  </form>;
}

export function Required(){return <span className="required-mark" aria-hidden="true"> *</span>;}
