import {useLayoutEffect} from 'react';

/** Freeze the document while the native dialog scrolls, including mobile browsers. */
export function useModalScrollLock(open:boolean) {
  useLayoutEffect(()=>{
    if(!open)return;
    const root=document.documentElement, body=document.body;
    const x=window.scrollX,y=window.scrollY;
    const previous={position:body.style.position,top:body.style.top,left:body.style.left,width:body.style.width,overflow:body.style.overflow,rootOverflow:root.style.overflow};
    root.style.overflow='hidden';
    Object.assign(body.style,{position:'fixed',top:`-${y}px`,left:`-${x}px`,width:'100%',overflow:'hidden'});
    return ()=>{
      Object.assign(body.style,{position:previous.position,top:previous.top,left:previous.left,width:previous.width,overflow:previous.overflow});
      root.style.overflow=previous.rootOverflow;
      window.scrollTo({left:x,top:y,behavior:'instant'});
    };
  },[open]);
}
