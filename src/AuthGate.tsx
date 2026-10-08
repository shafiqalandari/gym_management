import {useEffect,useState,type FormEvent,type ReactNode} from 'react'
import {Dumbbell,Eye,EyeOff,KeyRound,Lock,LogIn,Mail,ShieldCheck,Sparkles} from 'lucide-react'
import {text,useLanguage} from './i18n'

const authKey='gympro-authenticated'
const introKey='gympro-intro-seen'
const adminEmail='admin@gmail.com'
const adminPassword='mynameisadmin'

type Props={children:ReactNode}
type GateState='intro'|'login'|'authenticated'

export default function AuthGate({children}:Props){
  const language=useLanguage()
  const [state,setState]=useState<GateState>(()=>localStorage.getItem(authKey)==='true'?'authenticated':localStorage.getItem(introKey)==='true'?'login':'intro')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [showPassword,setShowPassword]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{
    if(state!=='intro')return
    const timer=window.setTimeout(()=>{localStorage.setItem(introKey,'true');setState('login')},3200)
    return()=>window.clearTimeout(timer)
  },[state])

  function login(event:FormEvent){
    event.preventDefault()
    if(email.trim().toLowerCase()!==adminEmail||password!==adminPassword){setError(text(language,'invalidCredentials','ایمیل یا رمز عبور درست نیست.'));return}
    localStorage.setItem(authKey,'true')
    setError('')
    setState('authenticated')
  }

  if(state==='authenticated')return <>{children}</>
  if(state==='intro')return <div className="startup-screen" dir={language==='English'?'ltr':'rtl'}><div className="startup-grid"/><div className="startup-orb startup-orb-one"/><div className="startup-orb startup-orb-two"/><div className="startup-glow startup-glow-one"/><div className="startup-glow startup-glow-two"/><div className="startup-content"><div className="startup-logo"><Dumbbell size={34}/><span className="startup-spark startup-spark-one"><Sparkles size={15}/></span><span className="startup-spark startup-spark-two"><Sparkles size={12}/></span></div><p className="startup-kicker">GYM PRO MANAGEMENT</p><h1>Gym<span>Pro</span></h1><p className="startup-tagline">{text(language,'startupTagline','مرکز هوشمند مدیریت باشگاه شما')}</p><div className="startup-loader"><span/></div><p className="startup-loading"><i/> {text(language,'starting','در حال آماده‌سازی سیستم')}</p></div><div className="startup-footer"><ShieldCheck size={14}/> {text(language,'secureWorkspace','محیط مدیریت امن و سریع')}</div></div>

  return <div className="login-screen" dir={language==='English'?'ltr':'rtl'}><div className="login-backdrop login-backdrop-one"/><div className="login-backdrop login-backdrop-two"/><div className="login-grid"/><div className="login-layout"><div className="login-brand-panel"><div className="login-brand-mark"><Dumbbell size={29}/></div><p className="login-eyebrow">GYM PRO MANAGEMENT</p><h1>{text(language,'loginWelcome','به GymPro خوش آمدید')}</h1><p>{text(language,'loginWelcomeText','باشگاه خود را با نظم، سرعت و دقت مدیریت کنید.')}</p><div className="login-feature"><ShieldCheck size={18}/><span>{text(language,'secureWorkspace','محیط مدیریت امن و سریع')}</span></div></div><section className="login-card"><div className="login-card-icon"><Lock size={22}/></div><div className="login-card-heading"><p>{text(language,'adminAccess','دسترسی مدیر سیستم')}</p><h2>{text(language,'loginTitle','ورود به سیستم')}</h2><span>{text(language,'loginSubtitle','برای ادامه، معلومات ورود مدیر را وارد کنید.')}</span></div><form onSubmit={login} className="login-form"><label><span>{text(language,'email','ایمیل')}</span><div className="login-input"><Mail size={18}/><input type="email" value={email} onChange={event=>{setEmail(event.target.value);setError('')}} autoComplete="off" required/></div></label><label><span>{text(language,'password','رمز عبور')}</span><div className="login-input"><KeyRound size={18}/><input type={showPassword?'text':'password'} value={password} onChange={event=>{setPassword(event.target.value);setError('')}} autoComplete="off" required/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?text(language,'hidePassword','پنهان کردن رمز'):text(language,'showPassword','نمایش رمز')}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>{error&&<p className="login-error" role="alert">{error}</p>}<button type="submit" className="login-submit"><LogIn size={18}/>{text(language,'signIn','ورود به سیستم')}</button></form></section></div></div>
}
