import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {Monitor, Moon, Sun} from 'lucide-react';

type Theme='light'|'dark'|'system';
const key='trazal-theme-v1';
function readTheme():Theme {try{const value=localStorage.getItem(key);if(value==='light'||value==='dark')return value;}catch{/* Storage can be unavailable in a private session. */}return 'system';}
function apply(theme:Theme){document.documentElement.dataset.theme=theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;}

// Apply before React paints, including in the standalone demo.
apply(readTheme());
const ThemeContext=createContext<{theme:Theme;setTheme:(theme:Theme)=>void}>({theme:'system',setTheme:()=>{}});
export function ThemeProvider({children}:{children:ReactNode}){
  const [theme,setTheme]=useState<Theme>(readTheme);
  useEffect(()=>{
    apply(theme);
    const preference=matchMedia('(prefers-color-scheme: dark)');
    const update=()=>{if(theme==='system')apply(theme);};
    const sync=(event:StorageEvent)=>{if(event.key===key||event.key===null)setTheme(readTheme());};
    preference.addEventListener('change',update);window.addEventListener('storage',sync);
    return()=>{preference.removeEventListener('change',update);window.removeEventListener('storage',sync);};
  },[theme]);
  function choose(next:Theme){apply(next);setTheme(next);try{localStorage.setItem(key,next);}catch{/* Keep the current theme for this session. */}}
  return <ThemeContext.Provider value={{theme,setTheme:choose}}>{children}</ThemeContext.Provider>;
}
export function ThemeSelect(){
  const {theme,setTheme}=useContext(ThemeContext);
  const Icon=theme==='dark'?Moon:theme==='light'?Sun:Monitor;
  return <label className="theme-select"><Icon size={18} aria-hidden="true"/><select aria-label="Tema de la interfaz" value={theme} onChange={event=>setTheme(event.target.value as Theme)}><option value="light">Claro</option><option value="dark">Oscuro</option><option value="system">Sistema</option></select></label>;
}
