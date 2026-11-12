import {useState, type FormEvent} from 'react';
import {ArrowLeft, Check, UserRound} from 'lucide-react';
import {ReadyForm, Required} from './ReadyForm';
import {Help} from './Help';

export type Profile={firstName:string;lastName:string;email:string;phone:string;company:string};

export function ProfileView({profile,onSave,onBack,backLabel}:{profile:Profile;onSave:(value:Profile)=>void;onBack:()=>void;backLabel:string}) {
  const [error,setError]=useState('');
  const [saved,setSaved]=useState(false);
  function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const value=(key:string)=>String(data.get(key)||'').trim();
    try{
      const next={firstName:value('firstName'),lastName:value('lastName'),email:value('email'),phone:value('phone'),company:value('company')};
      if(!next.firstName)throw new Error('Escribe tu nombre.');
      onSave(next);setError('');setSaved(true);
    }catch{setSaved(false);setError('No se pudo guardar el perfil. Revisa los datos y el almacenamiento del navegador.');}
  }
  return <div className="works-app profile-page">
    <header className="works-topbar"><img src="/brand/horizontal-mono.svg" alt="Trazal"/><button className="text-button" onClick={onBack}><ArrowLeft size={18}/>{backLabel}</button></header>
    <main className="profile-main">
      <div className="works-heading"><div><span className="eyebrow">TU ESPACIO PERSONAL</span><div className="title-with-help"><h1>Mi perfil</h1><Help title="Mi perfil">Estos datos se guardan solo en este navegador. El acceso con una cuenta se integrará en la aplicación de escritorio. El perfil no se incluye en los respaldos de obras.</Help></div><p>Tu información de contacto, en un solo lugar.</p></div></div>
      <div className="profile-layout">
        <aside className="profile-card"><span className="works-avatar">{(profile.firstName[0]+(profile.lastName[0]||'')).toLocaleUpperCase()}</span><h2>{profile.firstName} {profile.lastName}</h2><p>{profile.company||'Tu espacio en Trazal'}</p><span className="pill yellow"><UserRound size={14}/> Perfil local</span></aside>
        <section className="profile-details" aria-label="Datos personales">
          <h2>Datos personales</h2><p className="form-required-note"><Required/> Campos obligatorios</p>
          <ReadyForm key={JSON.stringify(profile)} editing onSubmit={save} onCancel={onBack}>
            <div className="form-grid"><label><span className="field-label">Nombre<Required/></span><input name="firstName" required maxLength={80} defaultValue={profile.firstName} autoComplete="given-name"/></label><label>Apellido<input name="lastName" maxLength={100} defaultValue={profile.lastName} autoComplete="family-name"/></label></div>
            <label>Correo electrónico<input name="email" type="email" maxLength={180} defaultValue={profile.email} autoComplete="email" placeholder="nombre@empresa.com"/></label>
            <div className="form-grid"><label>Teléfono<input name="phone" type="tel" maxLength={30} defaultValue={profile.phone} autoComplete="tel"/></label><label>Empresa<input name="company" maxLength={140} defaultValue={profile.company} autoComplete="organization"/></label></div>
            {error&&<p className="form-error" role="alert">{error}</p>}
          </ReadyForm>
          {saved&&<p className="profile-saved" role="status"><Check size={17}/> Perfil guardado.</p>}
        </section>
      </div>
    </main>
  </div>;
}
