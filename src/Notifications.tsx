import {useEffect,useMemo,useRef,useState} from 'react'
import {AlertTriangle,Bell,CheckCheck,Clock3,Wallet,X} from 'lucide-react'
import {buildNotifications} from './notificationData'
import type {NotificationItem} from './notificationData'
import type {CalendarMode} from './calendar'
import type {GymData,Page} from './gymData'
import type {Language} from './i18n'
import {text} from './i18n'

type Props={data:GymData;calendar:CalendarMode;language:Language;onNavigate:(page:Page)=>void}
const readKey='gympro-notifications-read'

export default function Notifications({data,calendar,language,onNavigate}:Props){
  const root=useRef<HTMLDivElement>(null)
  const [open,setOpen]=useState(false)
  const [readIds,setReadIds]=useState<string[]>(()=>{try{const raw=JSON.parse(localStorage.getItem(readKey)||'[]');return Array.isArray(raw)?raw.filter(x=>typeof x==='string'):[]}catch{return []}})
  const notifications=useMemo(()=>buildNotifications(data,calendar,language),[data,calendar,language])
  const unread=notifications.filter(item=>!readIds.includes(item.id)).length

  useEffect(()=>{localStorage.setItem(readKey,JSON.stringify(readIds))},[readIds])
  useEffect(()=>{const ids=new Set(notifications.map(item=>item.id));setReadIds(current=>current.filter(id=>ids.has(id)))},[notifications])
  useEffect(()=>{if(!open)return;const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[open])

  const markRead=(item:NotificationItem)=>{setReadIds(current=>current.includes(item.id)?current:[...current,item.id]);onNavigate(item.page);setOpen(false)}
  const markAll=()=>setReadIds(current=>Array.from(new Set([...current,...notifications.map(item=>item.id)])))
  const icon=(item:NotificationItem)=>item.kind==='due'||item.kind==='equipment'?<Wallet size={17}/>:item.kind==='expired'?<AlertTriangle size={17}/>:<Clock3 size={17}/>

  return <div ref={root} className="relative shrink-0">
    <button type="button" onClick={()=>setOpen(value=>!value)} className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10" aria-label={text(language,'notifications','Notifications')} aria-expanded={open}><Bell size={19}/>{unread>0&&<span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black leading-[18px] text-white">{unread>99?'99+':unread}</span>}</button>
    {open&&<div className="absolute end-0 top-[calc(100%+10px)] z-[120] w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-[#101c2e] dark:text-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10"><div><h3 className="text-sm font-black">{text(language,'notifications','نوتیفکیشن‌ها')}</h3><p className="mt-1 text-[10px] text-slate-500">{unread?`${unread} ${text(language,'unread','هشدار خوانده‌نشده')}`:text(language,'allRead','همه هشدارها خوانده شده')}</p></div><div className="flex items-center gap-1">{notifications.length>0&&<button type="button" onClick={markAll} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300" title={text(language,'markAll','خوانده‌شدن همه')}><CheckCheck size={17}/></button>}<button type="button" onClick={()=>setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10" aria-label={text(language,'cancel','بستن')}><X size={17}/></button></div></div>
      <div className="max-h-[min(65vh,430px)] overflow-y-auto p-2">{notifications.length?notifications.map(item=><button type="button" key={item.id} onClick={()=>markRead(item)} className={`flex w-full items-start gap-3 rounded-xl p-3 text-start transition hover:bg-slate-50 dark:hover:bg-white/5 ${readIds.includes(item.id)?'opacity-65':'bg-emerald-500/5'}`}><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${item.urgent?'bg-rose-500/10 text-rose-500':'bg-amber-500/10 text-amber-500'}`}>{icon(item)}</span><span className="min-w-0"><span className="block text-xs font-black">{item.title}</span><span className="mt-1 block text-[11px] leading-5 text-slate-500 dark:text-slate-400">{item.message}</span></span></button>):<div className="px-4 py-12 text-center text-sm text-slate-500"><Bell className="mx-auto mb-3 text-emerald-500" size={30}/><p>{text(language,'noNotifications','فعلاً نوتیفکیشن مهمی وجود ندارد.')}</p></div>}</div>
    </div>}
  </div>
}
