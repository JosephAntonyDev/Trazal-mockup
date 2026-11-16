import {useEffect, useRef, useState, type FormEvent} from 'react';
import {ArrowLeft, ArrowRight, Check, Cloud, Eye, EyeOff, HardDrive, KeyRound, Mail, ShieldCheck, UserRound} from 'lucide-react';
import {ThemeSelect} from './Theme';
import {Help} from './Help';
import './account-preview.css';

type Screen = 'login'|'register'|'reset'|'sent'|'change'|'changed'|'account';
function PasswordField({label,value,onChange,confirmation=false}:{label:string;value:string;onChange:(value:string)=>void;confirmation?:boolean}) {
  const [visible,setVisible]=useState(false);
  return <label className="account-field"><span>{label} <span className="required-mark" aria-hidden="true">*</span></span>
    <span className="account-password"><input required type={visible?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} minLength={8} maxLength={128} aria-describedby={confirmation?'account-form-note':undefined} autoComplete="off" placeholder={confirmation?'Repite la contraseña de ejemplo':'Mínimo 8 caracteres de ejemplo'}/>
      <button type="button" aria-label={`${visible?'Ocultar':'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button>
    </span>
  </label>;
}

// Deliberately no Firebase, network, storage, analytics or real session. Inputs live only in this view.
export function AccountPreview({onBack}:{onBack:()=>void}) {
  const [screen,setScreen]=useState<Screen>('login');
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirmation,setConfirmation]=useState('');
  const [provider,setProvider]=useState<'email'|'google'>('email');
  const [cloud,setCloud]=useState<'active'|'expired'|'local'>('local');
  const title=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{title.current?.focus();window.scrollTo({top:0,behavior:'instant'});},[screen]);
  function go(next:Screen){setPassword('');setConfirmation('');setScreen(next);}
  const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const matches=password===confirmation;
  const ready=screen==='change'?password.length>=8&&matches:validEmail&&(screen==='reset'||password.length>=8&&(screen!=='register'||!!name.trim()&&matches));
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!ready)return;setProvider('email');go(screen==='reset'?'sent':screen==='change'?'changed':'account');}
  function fillExample(){setName('Joseph');setEmail('joseph@ejemplo.com');setPassword('ObraDemo2026!');setConfirmation('ObraDemo2026!');}
  const heading={login:'Bienvenido a Trazal',register:'Crea tu cuenta',reset:'Recupera tu acceso',sent:'Revisa tu correo',change:'Elige una nueva contraseña',changed:'Tu contraseña, actualizada',account:'Mi cuenta'}[screen];
  const subtitle={login:'Tu cuenta, tus equipos y tus obras.',register:'Un solo acceso para administrar tu licencia y conectar tus equipos.',reset:'Te mostraremos cómo sería recibir el enlace para cambiar tu contraseña.',sent:'Esta es la confirmación que verá el usuario después de solicitar el enlace.',change:'Vista de ejemplo del paso que se abre desde el enlace seguro del correo.',changed:'Así se verá la confirmación al terminar el cambio.',account:'Administra tu acceso y consulta tus servicios.'}[screen];
  const formScreen=['login','register','reset','change'].includes(screen);
  return <div className="works-app account-preview" data-screen={screen}>
    <header className="works-topbar"><img src="/brand/horizontal-mono.svg" alt="Trazal"/><div><ThemeSelect/><button className="text-button" onClick={onBack}><ArrowLeft size={18}/>Volver a mis obras</button></div></header>
    <main className="account-layout">
      <aside className="account-intro">
        <span className="account-kicker">TU ESPACIO EN TRAZAL</span>
        <h2>Tu trabajo.<br/>Siempre contigo.</h2>
        <p>El control de tu obra empieza aquí.</p>
        <div className="account-benefit"><HardDrive size={23}/><div><strong>Trabaja en tu equipo</strong><span>Consulta y guarda tus obras sin conexión.</span></div></div>
        <div className="account-benefit"><KeyRound size={23}/><div><strong>Tu licencia, a la mano</strong><span>Un lugar para revisar el acceso a Trazal.</span></div></div>
        <div className="account-benefit"><Cloud size={23}/><div><strong>Nube cuando la necesites</strong><span>Sincronización opcional para conectar tus equipos.</span></div></div>
        <div className="account-intro-foot"><span className="account-line"/> Menos pendientes. Más obra.</div>
      </aside>
      <section className="account-content" aria-labelledby="account-title">
        <div className="account-heading"><div className="account-demo-note"><span>Recorrido de ejemplo</span><Help title="Solo demostración">No crea cuentas, no envía correos, no cobra ni activa licencias. Los datos de estos formularios no se guardan ni se envían. Utiliza datos de ejemplo. Volver a tus obras conserva tu trabajo en el navegador.</Help></div>
        <h1 id="account-title" ref={title} tabIndex={-1}>{heading}</h1><p className="account-subtitle">{subtitle}</p></div>
        {formScreen?<>
          {(screen==='login'||screen==='register')&&<>
            <nav className="account-tabs" aria-label="Acceso a la cuenta"><button aria-current={screen==='login'?'page':undefined} onClick={()=>go('login')}>Iniciar sesión</button><button aria-current={screen==='register'?'page':undefined} onClick={()=>go('register')}>Registrarme</button></nav>
            <button className="button account-google" onClick={()=>{setProvider('google');setName('Joseph');setEmail('joseph@ejemplo.com');go('account');}}><span aria-hidden="true" className="account-google-g">G</span>Continuar con Google<span className="account-example-tag">Ejemplo</span></button>
            <div className="account-divider"><span/>o utiliza tu correo<span/></div>
          </>}
          <form key={screen} onSubmit={submit} className="account-form" autoComplete="off">
            <div className="account-form-heading"><p id="account-form-note" className={confirmation&&!matches?'account-field-note account-error':'account-field-note'} role="status">{confirmation&&!matches?'Las contraseñas todavía no coinciden.':'* Campos obligatorios · Usa datos de ejemplo'}</p>{screen==='login'&&<button className="text-button account-forgot" type="button" onClick={()=>go('reset')}>Olvidé mi contraseña</button>}</div>
            <div className="account-fields">
            {screen==='register'&&<label className="account-field"><span>Nombre <span className="required-mark" aria-hidden="true">*</span></span><input required value={name} onChange={e=>setName(e.target.value)} maxLength={80} placeholder="Ej. Joseph"/></label>}
            {screen!=='change'&&<label className="account-field"><span>Correo electrónico <span className="required-mark" aria-hidden="true">*</span></span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={180} placeholder="nombre@ejemplo.com" spellCheck={false}/></label>}
            {screen!=='reset'&&<PasswordField label={screen==='change'?'Nueva contraseña':'Contraseña'} value={password} onChange={setPassword}/>}
            {(screen==='register'||screen==='change')&&<><PasswordField label="Confirmar contraseña" value={confirmation} onChange={setConfirmation} confirmation/></>}
            </div>
            <div className="account-form-actions">
            <button className="button primary account-submit" type="submit" disabled={!ready}>{screen==='register'?'Crear cuenta de ejemplo':screen==='reset'?'Ver envío del enlace':screen==='change'?'Ver confirmación del cambio':'Entrar a la cuenta de ejemplo'}<ArrowRight size={18}/></button>
            <button className="text-button account-fill" type="button" onClick={fillExample}>Rellenar con datos de ejemplo</button></div>
          </form>
          {(screen==='reset'||screen==='change')&&<button className="text-button" onClick={()=>go('login')}><ArrowLeft size={16}/>Volver al inicio de sesión</button>}
        </>:screen==='sent'||screen==='changed'?<div className="account-confirmation" role="status">
          <span className="account-confirm-icon">{screen==='sent'?<Mail size={30}/>:<Check size={30}/>}</span>
          <h2>{screen==='sent'?'El siguiente paso está en tu correo':'Listo para volver a entrar'}</h2>
          <p>{screen==='sent'?<>En la aplicación, si <strong>{email||'nombre@ejemplo.com'}</strong> tiene una cuenta, recibirá un enlace seguro.</>:'En la aplicación, el usuario podrá iniciar sesión con su nueva contraseña.'}</p>
          <p className="account-simulation">Simulación: no se envió ningún correo ni se cambió ninguna contraseña.</p>
          <button className="button primary" onClick={()=>go(screen==='sent'?'change':'login')}>{screen==='sent'?'Ver pantalla de nueva contraseña':'Volver al inicio de sesión'}<ArrowRight size={18}/></button>
        </div>:<>
          <div className="account-identity"><span className="works-avatar">{(name.trim()[0]||'J').toUpperCase()}</span><div><h2>{name.trim()||'Joseph'}</h2><p>{email||'joseph@ejemplo.com'}</p></div><span className="account-example-tag">Cuenta de ejemplo</span></div>
          <div className="account-services"><div className="account-security"><div><UserRound size={22}/><div><h2>Acceso y seguridad</h2><p>{provider==='google'?'Acceso con Google':'Acceso con correo y contraseña'}</p></div></div>{provider==='email'?<button className="button" onClick={()=>go('reset')}>Cambiar contraseña</button>:<p className="account-google-info">Tu contraseña se administra en tu cuenta de Google.</p>}</div>
          <div className="account-license"><div className="title-with-help"><ShieldCheck size={22}/><h2>Licencia de escritorio</h2><Help title="Cuenta y licencia">La cuenta identifica a la persona. La licencia autoriza el uso del programa y se verificará por separado. Esta pantalla solo representa la propuesta; no activa una licencia real.</Help></div><div className="account-license-value"><strong>Licencia activa</strong><span>Estado de ejemplo</span></div><p>Uso del programa en tu equipo. El alcance comercial está por definir.</p></div>
          <div className="account-cloud"><div className="title-with-help"><Cloud size={22}/><h2>Sincronización en la nube</h2></div><label>Escenario para revisar<select aria-label="Escenario de suscripción de ejemplo" value={cloud} onChange={e=>setCloud(e.target.value as typeof cloud)}><option value="local">Solo trabajo local</option><option value="active">Suscripción activa</option><option value="expired">Suscripción vencida</option></select></label><p aria-live="polite">{cloud==='local'?'Tus obras se guardan en este equipo. La nube es un servicio opcional.':cloud==='active'?'Podrás enviar cambios y recuperar lo sincronizado en otros equipos. Solo datos de obra; sin fotos, PDF ni Excel originales.':'Lo que ya se sincronizó se conserva para consultar y descargar. Las nuevas obras y cambios quedan solo en este equipo hasta renovar.'}</p></div>
          </div><div className="account-bottom"><button className="button primary" onClick={onBack}>Volver a mis obras<ArrowRight size={18}/></button><button className="text-button" onClick={()=>{setName('');setEmail('');go('login');}}>Cerrar sesión de ejemplo</button></div>
        </>}
        {screen!=='account'&&<footer className="account-footer"><button className="text-button" onClick={onBack}><HardDrive size={16}/>Seguir con mis obras locales</button><button className="text-button" onClick={()=>{fillExample();go('account');}}>Ver cuenta y licencia de ejemplo</button></footer>}
      </section>
    </main>
  </div>;
}
