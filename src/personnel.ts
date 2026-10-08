import {getIsoDay,num,type RecordItem} from './gymData'

export type PersonnelKind='trainer'|'employee'
export type PersonnelActionType='salary'|'bonus'|'penalty'
export type PersonnelAction={id:string;type:PersonnelActionType;date:string;amount:string;note:string}
export type PersonnelEntry={record:RecordItem;kind:PersonnelKind}

export function actionsOf(record:RecordItem):PersonnelAction[]{try{const parsed=JSON.parse(record.payHistory||'[]');return Array.isArray(parsed)?parsed:[]}catch{return []}}
export function roleOf(person:PersonnelEntry){return person.kind==='trainer'?person.record.specialty||'استاد':person.record.role||'کارمند'}
export function typeLabel(kind:PersonnelKind){return kind==='trainer'?'استاد':'کارمند'}
export function currentMonth(){return getIsoDay().slice(0,7)}
export function actionTotal(actions:PersonnelAction[],type:PersonnelActionType,month?:string){return actions.filter(action=>action.type===type&&(!month||action.date.startsWith(month))).reduce((sum,action)=>sum+num(action.amount),0)}
export function workDuration(joined?:string){
  if(!joined)return 'ثبت نشده'
  const days=Math.max(0,Math.floor((new Date(`${getIsoDay()}T12:00:00`).getTime()-new Date(`${joined}T12:00:00`).getTime())/86400000))
  const years=Math.floor(days/365);const months=Math.floor((days%365)/30);const rest=days%30
  return [years&&`${years} سال`,months&&`${months} ماه`,rest&&`${rest} روز`].filter(Boolean).join(' و ')||'کمتر از یک روز'
}
