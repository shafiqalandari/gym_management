import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AuthGate from './AuthGate'
import './index.css'

class ErrorBoundary extends React.Component<{children:React.ReactNode},{hasError:boolean;message:string}> {
  state={hasError:false,message:''}
  static getDerivedStateFromError(error:Error){return {hasError:true,message:error.message}}
  render(){if(this.state.hasError)return <div style={{minHeight:'100vh',padding:40,fontFamily:'sans-serif',direction:'rtl',background:'#09111f',color:'#fff'}}><h1>GymPro: خطا در اجرای برنامه</h1><p>لطفاً خطای زیر را برای رفع مشکل ارسال کنید.</p><pre style={{whiteSpace:'pre-wrap',color:'#fca5a5'}}>{this.state.message}</pre><button onClick={()=>location.reload()} style={{padding:12,background:'#10b981',border:0,borderRadius:8}}>بارگذاری دوباره</button></div>;return this.props.children}
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><AuthGate><App/></AuthGate></ErrorBoundary></React.StrictMode>)
