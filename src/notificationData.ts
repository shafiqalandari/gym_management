import {equipmentTotal,formatDay,getIsoDay,num,type GymData,type Page} from './gymData'
import type {Language} from './i18n'
import type {CalendarMode} from './calendar'

export type NotificationItem={id:string;kind:'expired'|'expiring'|'due'|'equipment';title:string;message:string;page:Page;recordId:string;urgent:boolean}
const daysBetween=(from:string,to:string)=>Math.floor((new Date(`${to}T12:00:00`).getTime()-new Date(`${from}T12:00:00`).getTime())/86400000)

export function buildNotifications(data:GymData,calendar:CalendarMode,language:Language):NotificationItem[]{
  const today=getIsoDay()
  const words=language==='English'?{expired:'Expired membership',expiring:'Membership renewal soon',due:'Outstanding student fee',equipment:'Outstanding equipment payment',renew:'Renew now',remaining:'Remaining',expiredAt:'expired on',equipmentDue:'is still unpaid'}:language==='پښتو'?{expired:'د غړیتوب موده ختمه ده',expiring:'د غړیتوب د نوي کولو وخت نږدې دی',due:'د زده کوونکي پاتې فیس',equipment:'د وسایلو پاتې پیسې',renew:'اوس نوی کړئ',remaining:'پاتې',expiredAt:'ختم شوی په',equipmentDue:'لا نه دي ورکړل شوي'}:{expired:'اشتراک ختم شده',expiring:'وقت تمدید اشتراک نزدیک است',due:'باقی فیس شاگرد',equipment:'باقی پرداخت وسیله',renew:'همین حالا تمدید کنید',remaining:'باقی',expiredAt:'در تاریخ',equipmentDue:'هنوز پرداخت نشده است'}
  const result:NotificationItem[]=[]
  for(const student of data.records.students){
    const name=student.name||'شاگرد'
    if(student.end){const days=daysBetween(today,student.end);if(days<=0)result.push({id:`student-expired-${student.id}-${student.end}`,kind:'expired',title:words.expired,message:`${name} — ${words.expiredAt} ${formatDay(student.end,calendar)}. ${words.renew}`,page:'students',recordId:student.id,urgent:true});else if(days<=7)result.push({id:`student-expiring-${student.id}-${student.end}`,kind:'expiring',title:words.expiring,message:`${name} — ${formatDay(student.end,calendar)}. ${words.renew}`,page:'students',recordId:student.id,urgent:false})}
    const remaining=Math.max(0,num(student.fee)-num(student.paid));if(remaining>0)result.push({id:`student-due-${student.id}-${student.fee}-${student.paid}`,kind:'due',title:words.due,message:`${name} — ${words.remaining}: ${remaining.toLocaleString('en-US')} AFN`,page:'students',recordId:student.id,urgent:false})
  }
  for(const equipment of data.records.equipment){const remaining=Math.max(0,equipmentTotal(equipment)-num(equipment.paid));if(remaining>0)result.push({id:`equipment-due-${equipment.id}-${remaining}`,kind:'equipment',title:words.equipment,message:`${equipment.name||'وسیله'} — ${remaining.toLocaleString('en-US')} AFN ${words.equipmentDue}`,page:'equipment',recordId:equipment.id,urgent:false})}
  return result.sort((a,b)=>Number(b.urgent)-Number(a.urgent)||a.title.localeCompare(b.title))
}
