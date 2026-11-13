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
      <div className="works-heading"><div><div className="title-with-help"><h1>Mi perfil</h1><Help title="Mi perfil">Estos datos se guardan solo en este navegador. El acceso con una cuenta se integrará en la aplicación de escritorio. El perfil no se incluye en los respaldos de obras.</Help></div><p>Administra tus datos personales y de contacto.</p></div></div>
      <section className="profile-panel" aria-label="Editar mi perfil">
        <header className="profile-identity-bar"><span className="works-avatar">{(profile.firstName[0]+(profile.lastName[0]||'')).toLocaleUpperCase()}</span><div><h2>{profile.firstName} {profile.lastName}</h2><p>{profile.company||'Tu espacio en Trazal'}</p></div><span className="pill yellow"><UserRound size={14}/> Perfil local</span></header>
        <div className="profile-details">
          <ReadyForm key={JSON.stringify(profile)} editing onSubmit={save} onCancel={onBack} saveLabel="Guardar cambios">
            <p className="form-required-note"><Required/> Campos obligatorios</p>
            <div className="profile-field-groups">
              <section aria-labelledby="personal-title"><h2 id="personal-title">Información personal</h2>
                <div className="form-grid"><label><span className="field-label">Nombre<Required/></span><input name="firstName" required maxLength={80} defaultValue={profile.firstName} autoComplete="given-name"/></label><label>Apellido<input name="lastName" maxLength={100} defaultValue={profile.lastName} autoComplete="family-name" placeholder="Tu apellido"/></label></div>
                <label>Empresa<input name="company" maxLength={140} defaultValue={profile.company} autoComplete="organization" placeholder="Nombre de tu empresa"/></label>
              </section>
              <section aria-labelledby="contact-title"><h2 id="contact-title">Contacto</h2>
                <label>Correo electrónico<input name="email" type="email" maxLength={180} defaultValue={profile.email} autoComplete="email" placeholder="nombre@empresa.com"/></label>
                <label>Teléfono<input name="phone" type="tel" maxLength={30} defaultValue={profile.phone} autoComplete="tel" placeholder="Tu número de contacto"/></label>
              </section>
            </div>
            {error&&<p className="form-error" role="alert">{error}</p>}
            {saved&&<p className="profile-saved" role="status"><Check size={17}/> Perfil guardado.</p>}
          </ReadyForm>
        </div>
      </section>
    </main>
  </div>;
}
