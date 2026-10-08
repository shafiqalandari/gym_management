import {useEffect,useRef,useState} from 'react'
import {CalendarDays,ChevronLeft,ChevronRight,X} from 'lucide-react'
import {calendarDateToIso,calendarMonthLabel,calendarPartsFromIso,calendarValueLabel,daysInCalendarMonth,firstWeekdayOffset,gregorianWeekdays,jalaliWeekdays,shiftCalendarMonth,type CalendarDateParts,type CalendarMode} from './calendar'
import {getIsoDay} from './gymData'
import {text,useLanguage} from './i18n'

type Props={value:string;onChange:(value:string)=>void;calendar:CalendarMode;required?:boolean}

export default function DateField({value,onChange,calendar,required}:Props){
  const language=useLanguage()
  const root=useRef<HTMLDivElement>(null)
  const initial=calendarPartsFromIso(value,calendar)||calendarPartsFromIso(getIsoDay(),calendar)!
  const [open,setOpen]=useState(false)
  const [view,setView]=useState({year:initial.year,month:initial.month})
  const selected=calendarPartsFromIso(value,calendar)
  const today=calendarPartsFromIso(getIsoDay(),calendar)
  const weekdays=language==='English'?(calendar==='jalali'?['Sat','Sun','Mon','Tue','Wed','Thu','Fri']:gregorianWeekdays):language==='پښتو'?(calendar==='jalali'?['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه']:['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه']):(calendar==='jalali'?jalaliWeekdays:gregorianWeekdays)
  const offset=firstWeekdayOffset(calendar,view.year,view.month)
  const days=daysInCalendarMonth(calendar,view.year,view.month)

  useEffect(()=>{
    if(!open)return
    const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)}
    document.addEventListener('pointerdown',close)
    return()=>document.removeEventListener('pointerdown',close)
  },[open])

  useEffect(()=>{
    const next=calendarPartsFromIso(value,calendar)||calendarPartsFromIso(getIsoDay(),calendar)!
    setView({year:next.year,month:next.month})
  },[calendar,value])

  function openPicker(){
    const next=calendarPartsFromIso(value,calendar)||calendarPartsFromIso(getIsoDay(),calendar)!
    setView({year:next.year,month:next.month})
    setOpen(true)
  }
  function choose(day:number){
    const iso=calendarDateToIso(calendar,{year:view.year,month:view.month,day})
    if(iso){onChange(iso);setOpen(false)}
  }
  function move(delta:number){setView(current=>shiftCalendarMonth(calendar,current.year,current.month,delta))}
  function isSelected(day:number){return !!selected&&selected.year===view.year&&selected.month===view.month&&selected.day===day}
  function isToday(day:number){return !!today&&today.year===view.year&&today.month===view.month&&today.day===day}

  return <div ref={root} className="relative min-w-0" dir={calendar==='jalali'?'rtl':'ltr'}>
    <button type="button" onClick={openPicker} className="flex min-h-[46px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-start text-sm text-slate-900 outline-none transition hover:border-emerald-300 focus:border-emerald-400 dark:border-white/10 dark:bg-[#0f1d32] dark:text-white" aria-haspopup="dialog" aria-expanded={open}>
      <CalendarDays size={17} className="shrink-0 text-slate-400"/>
      <span className={value?'font-semibold':'text-slate-400'}>{calendarValueLabel(value,calendar)||text(language,'choose','انتخاب تاریخ')}</span>
      {value&&<span role="button" tabIndex={0} aria-label={text(language,'clear','پاک کردن تاریخ')} onClick={event=>{event.stopPropagation();onChange('')}} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onChange('')}}} className="ms-auto grid size-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-rose-500 dark:hover:bg-white/10"><X size={15}/></span>}
    </button>
    {open&&<div role="dialog" aria-label={calendar==='jalali'?text(language,'jalaliCalendar','تقویم جلالی'):text(language,'gregorianCalendar','تقویم میلادی')} className="absolute inset-x-0 top-[calc(100%+8px)] z-[120] min-w-[278px] rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-[#101c2e] dark:text-white">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" onClick={()=>move(-1)} className="grid size-8 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" aria-label={text(language,'previousMonth','ماه قبلی')}><ChevronLeft size={17}/></button>
        <span className="text-sm font-black">{calendarMonthLabel(calendar,view.year,view.month)}</span>
        <button type="button" onClick={()=>move(1)} className="grid size-8 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" aria-label={text(language,'nextMonth','ماه بعدی')}><ChevronRight size={17}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">{weekdays.map(day=><span key={day} className={day==='جمعه'||day==='Fri'||day==='Sun'?'text-rose-400':''}>{day}</span>)}</div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({length:offset},(_,index)=><span key={`empty-${index}`} className="size-8"/>)}
        {Array.from({length:days},(_,index)=>{const day=index+1;const active=isSelected(day);const current=isToday(day);return <button key={day} type="button" onClick={()=>choose(day)} className={`grid size-8 place-items-center rounded-lg text-xs font-bold transition ${active?'bg-emerald-500 text-white shadow-md shadow-emerald-500/25':current?'ring-1 ring-emerald-400 text-emerald-600 dark:text-emerald-300':'hover:bg-emerald-500/10'} ${(day===6||day===7)&&calendar==='gregorian'?'text-rose-500':''}`}>{day}</button>})}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-white/10">
        <span>{calendar==='jalali'?text(language,'jalaliCalendar','تقویم جلالی'):text(language,'gregorianCalendar','تقویم میلادی')}</span>
        <button type="button" onClick={()=>{onChange(getIsoDay());setOpen(false)}} className="font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-300">{text(language,'today','امروز')}</button>
      </div>
    </div>}
    <input type="date" value={value} onChange={event=>onChange(event.target.value)} required={required} tabIndex={-1} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-0"/>
  </div>
}
