export type CalendarMode = 'jalali' | 'gregorian'
export type CalendarDateParts = {year:number; month:number; day:number}

export const jalaliMonths = ['حمل','ثور','جوزا','سرطان','اسد','سنبله','میزان','عقرب','قوس','جدی','دلو','حوت']
export const gregorianMonths = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const jalaliWeekdays = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه']
export const gregorianWeekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const formatterCache=new Map<CalendarMode,Intl.DateTimeFormat>()
const isoPartsCache=new Map<string,CalendarDateParts|null>()
const calendarDateCache=new Map<string,string|null>()
const monthDaysCache=new Map<string,number>()
const weekdayOffsetCache=new Map<string,number>()

function getFormatter(calendar:CalendarMode){
  let formatter=formatterCache.get(calendar)
  if(!formatter){
    formatter=new Intl.DateTimeFormat(calendar==='jalali'?'en-US-u-ca-persian':'en-US',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'})
    formatterCache.set(calendar,formatter)
  }
  return formatter
}

function readParts(date:Date, calendar:CalendarMode):CalendarDateParts{
  const key=`${calendar}:${date.toISOString().slice(0,10)}`
  const cached=isoPartsCache.get(key)
  if(cached)return cached
  const parts=getFormatter(calendar).formatToParts(date)
  const result={
    year:Number(parts.find(p=>p.type==='year')?.value),
    month:Number(parts.find(p=>p.type==='month')?.value),
    day:Number(parts.find(p=>p.type==='day')?.value),
  }
  isoPartsCache.set(key,result)
  return result
}

export function calendarPartsFromIso(iso:string|undefined,calendar:CalendarMode):CalendarDateParts|null{
  if(!iso)return null
  const key=`${calendar}:${iso}`
  if(isoPartsCache.has(key))return isoPartsCache.get(key)||null
  const date=new Date(`${iso}T12:00:00Z`)
  return Number.isNaN(date.getTime())?null:readParts(date,calendar)
}

export function calendarDateToIso(calendar:CalendarMode,parts:CalendarDateParts):string|null{
  const key=`${calendar}:${parts.year}-${parts.month}-${parts.day}`
  if(calendarDateCache.has(key))return calendarDateCache.get(key)||null
  if(calendar==='gregorian'){
    const date=new Date(Date.UTC(parts.year,parts.month-1,parts.day,12))
    if(date.getUTCFullYear()!==parts.year||date.getUTCMonth()!==parts.month-1||date.getUTCDate()!==parts.day){calendarDateCache.set(key,null);return null}
    const iso=date.toISOString().slice(0,10)
    calendarDateCache.set(key,iso)
    return iso
  }
  // Find the Gregorian date for the selected Solar Hijri date. The search is
  // small, deterministic, and avoids shipping a second calendar library.
  const approximate=Date.UTC(parts.year+621,2,20,12)
  for(let offset=-10;offset<=380;offset++){
    const date=new Date(approximate+offset*86400000)
    const found=readParts(date,calendar)
    if(found.year===parts.year&&found.month===parts.month&&found.day===parts.day){const iso=date.toISOString().slice(0,10);calendarDateCache.set(key,iso);return iso}
  }
  calendarDateCache.set(key,null)
  return null
}

export function daysInCalendarMonth(calendar:CalendarMode,year:number,month:number){
  const key=`${calendar}:${year}-${month}`
  const cached=monthDaysCache.get(key)
  if(cached)return cached
  if(calendar==='gregorian')return new Date(Date.UTC(year,month,0,12)).getUTCDate()
  let days=29
  for(let day=30;day<=31;day++)if(calendarDateToIso(calendar,{year,month,day}))days=day
  monthDaysCache.set(key,days)
  return days
}

export function firstWeekdayOffset(calendar:CalendarMode,year:number,month:number){
  const key=`${calendar}:${year}-${month}`
  const cached=weekdayOffsetCache.get(key)
  if(cached!==undefined)return cached
  const iso=calendarDateToIso(calendar,{year,month,day:1})
  if(!iso)return 0
  const weekday=new Date(`${iso}T00:00:00Z`).getUTCDay()
  const weekStartsOn=calendar==='jalali'?6:0
  const offset=(weekday-weekStartsOn+7)%7
  weekdayOffsetCache.set(key,offset)
  return offset
}

export function calendarMonthLabel(calendar:CalendarMode,year:number,month:number){
  return calendar==='jalali'?`${jalaliMonths[month-1]} ${year}`:`${gregorianMonths[month-1]} ${year}`
}

export function calendarValueLabel(iso:string|undefined,calendar:CalendarMode){
  const parts=calendarPartsFromIso(iso,calendar)
  if(!parts)return ''
  return calendar==='jalali'?`${parts.day} ${jalaliMonths[parts.month-1]} ${parts.year}`:`${gregorianMonths[parts.month-1]} ${parts.day}, ${parts.year}`
}

export function shiftCalendarMonth(calendar:CalendarMode,year:number,month:number,delta:number){
  const index=year*12+(month-1)+delta
  return {year:Math.floor(index/12),month:index%12+1}
}
