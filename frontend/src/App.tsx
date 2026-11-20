import { useEffect, useMemo, useState } from 'react'
import { Bike, CalendarDays, CreditCard, LayoutDashboard, LogOut, Plus, Search, Settings, Users, X, CheckCircle2, Clock3, Menu } from 'lucide-react'
import api from './api'

type User = { id:number; name:string; email:string; role:string }
type BikeItem = { id:number; name:string; type:string; description?:string; price_per_hour:number; status:'available'|'maintenance'|'unavailable'; image_url?:string }
type Booking = { id:number; customer?:{name:string}; bike?:BikeItem; start_at:string; end_at:string; total_amount:number; status:string; payment_status:string }
type Payment = { id:number; booking_id:number; amount:number; method:string; status:string; reference?:string }
type Tab = 'Dashboard'|'Bikes'|'Bookings'|'Payments'|'Customers'

const money = (n:number|string) => `₱${Number(n || 0).toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2})}`
const initialForm = { name:'', type:'Mountain Bike', description:'', price_per_hour:'100', status:'available', image_url:'' }

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('cordova_token') || '')
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<Tab>('Dashboard')
  const [bikes, setBikes] = useState<BikeItem[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [customers, setCustomers] = useState<User[]>([])
  const [stats, setStats] = useState({ bikes:0, bookings:0, revenue:0, customers:0 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'bike'|'booking'|'payment'|null>(null)
  const [editing, setEditing] = useState<BikeItem|null>(null)
  const [bikeForm, setBikeForm] = useState(initialForm)
  const [bookingForm, setBookingForm] = useState({ bike_id:'', start_at:'', end_at:'', customer_name:'', customer_email:'' })
  const [paymentForm, setPaymentForm] = useState({ booking_id:'', amount:'', method:'Cash', reference:'' })
  const [authMode, setAuthMode] = useState<'login'|'register'>('login')
  const [authForm, setAuthForm] = useState({ name:'', email:'admin@cordova.test', password:'Password123!' })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function loadAll() {
    try {
      const [me, dash, bikeRes, bookingRes, paymentRes, customerRes] = await Promise.all([
        api.get('/me'), api.get('/dashboard'), api.get('/bikes'), api.get('/bookings'), api.get('/payments'), api.get('/customers')
      ])
      setUser(me.data.user); setStats(dash.data); setBikes(bikeRes.data.data ?? bikeRes.data)
      setBookings(bookingRes.data.data ?? bookingRes.data); setPayments(paymentRes.data.data ?? paymentRes.data)
      setCustomers(customerRes.data.data ?? customerRes.data)
    } catch (e:any) {
      if (e?.response?.status === 401) { localStorage.removeItem('cordova_token'); setToken('') }
      else setError(e?.response?.data?.message || 'Could not load data. Check the Laravel API and database.')
    }
  }
  useEffect(() => { if (token) loadAll() }, [token])
  const filteredBikes = useMemo(() => bikes.filter(b => `${b.name} ${b.type} ${b.status}`.toLowerCase().includes(search.toLowerCase())), [bikes, search])

  async function submitAuth(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const endpoint = authMode === 'login' ? '/login' : '/register'
      const response = await api.post(endpoint, authForm)
      localStorage.setItem('cordova_token', response.data.token); setToken(response.data.token)
    } catch (e:any) { setError(e?.response?.data?.message || 'Authentication failed. Check your details.') }
    finally { setBusy(false) }
  }
  async function logout() {
    try { await api.post('/logout') } catch {}
    localStorage.removeItem('cordova_token'); setToken(''); setUser(null)
  }
  function openBike(bike?:BikeItem) {
    setEditing(bike || null)
    setBikeForm(bike ? { name:bike.name, type:bike.type, description:bike.description || '', price_per_hour:String(bike.price_per_hour), status:bike.status, image_url:bike.image_url || '' } : initialForm)
    setModal('bike')
  }
  async function saveBike(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    const payload = { ...bikeForm, price_per_hour:Number(bikeForm.price_per_hour) }
    try {
      if (editing) await api.put(`/bikes/${editing.id}`, payload); else await api.post('/bikes', payload)
      setModal(null); setNotice(editing ? 'Bike updated.' : 'Bike created.'); await loadAll()
    } catch (e:any) { setError(e?.response?.data?.message || 'Unable to save bike.') }
    finally { setBusy(false) }
  }
  async function deleteBike(bike:BikeItem) {
    if (!confirm(`Delete "${bike.name}"?`)) return
    try { await api.delete(`/bikes/${bike.id}`); setNotice('Bike deleted.'); await loadAll() }
    catch (e:any) { setError(e?.response?.data?.message || 'Unable to delete bike.') }
  }
  async function saveBooking(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await api.post('/bookings', { ...bookingForm, bike_id:Number(bookingForm.bike_id) })
      setModal(null); setNotice('Booking created.'); await loadAll()
    } catch (e:any) { setError(e?.response?.data?.message || 'Unable to create booking. Check dates and availability.') }
    finally { setBusy(false) }
  }
  async function changeBookingStatus(booking:Booking, status:string) {
    try { await api.patch(`/bookings/${booking.id}/status`, { status }); setNotice('Booking status updated.'); await loadAll() }
    catch (e:any) { setError(e?.response?.data?.message || 'Unable to update booking.') }
  }
  async function savePayment(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await api.post('/payments', { ...paymentForm, booking_id:Number(paymentForm.booking_id), amount:Number(paymentForm.amount) })
      setModal(null); setNotice('Payment record saved. No money was charged.'); await loadAll()
    } catch (e:any) { setError(e?.response?.data?.message || 'Unable to save payment record.') }
    finally { setBusy(false) }
  }
  const navItems = [
    { label:'Dashboard' as Tab, icon:LayoutDashboard }, { label:'Bikes' as Tab, icon:Bike },
    { label:'Bookings' as Tab, icon:CalendarDays }, { label:'Payments' as Tab, icon:CreditCard },
    { label:'Customers' as Tab, icon:Users }
  ]

  if (!token) return <main className="auth-shell">
    <section className="auth-card"><div className="brand-mark"><Bike size={25}/></div><p className="eyebrow">CORDOVA BIKE RENTAL</p>
      <h1>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p className="muted">Manage rentals, bookings, and payments in one place.</p>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submitAuth} className="form-stack">
        {authMode === 'register' && <label>Full name<input required value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your name"/></label>}
        <label>Email address<input type="email" required value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label>
        <label>Password<input type="password" required minLength={8} value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})}/></label>
        <button className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="auth-switch">{authMode === 'login' ? 'New to the system?' : 'Already have an account?'} <button className="text-button" onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setError('')}}>{authMode==='login'?'Create account':'Sign in'}</button></p>
      <p className="tiny">Demo: admin@cordova.test · Password123!</p>
    </section>
  </main>

  return <div className="app-shell">
    {sidebarOpen && <button aria-label="Close menu" className="mobile-backdrop" onClick={()=>setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Bike size={23}/></div><div><strong>Cordova</strong><span>BIKE RENTAL</span></div><button className="icon-button mobile-close" onClick={()=>setSidebarOpen(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.label} className={`nav-item ${tab===item.label?'active':''}`} onClick={()=>{setTab(item.label);setSidebarOpen(false)}}><item.icon size={18}/><span>{item.label}</span>{item.label==='Bookings' && <span className="nav-count">{bookings.filter(b=>b.status==='pending').length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18}/><span>Settings</span></button><div className="profile-mini"><div className="avatar">{(user?.name||'A').slice(0,1).toUpperCase()}</div><div className="profile-text"><strong>{user?.name||'Administrator'}</strong><span>{user?.email}</span></div><button className="icon-button" title="Log out" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-title"><button className="icon-button menu-trigger" onClick={()=>setSidebarOpen(true)}><Menu/></button><div><span className="eyebrow">CORDOVA / MANAGEMENT</span><h2>{tab}</h2></div></div><div className="topbar-right"><span className="online-dot"/> System online <div className="avatar">{(user?.name||'A').slice(0,1).toUpperCase()}</div></div></header>
      <div className="page-content">
        {error && <div className="alert error">{error}<button onClick={()=>setError('')}><X size={15}/></button></div>}
        {notice && <div className="alert success">{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
        {tab==='Dashboard' && <Dashboard stats={stats} bookings={bookings} bikes={bikes} setTab={setTab}/>}
        {tab==='Bikes' && <section className="panel"><div className="panel-heading"><div><h3>Bike inventory</h3><p>Manage your rental fleet and hourly rates.</p></div><button className="btn primary" onClick={()=>openBike()}><Plus size={17}/> Add bike</button></div><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bikes…"/></div><span className="muted small">{filteredBikes.length} bikes</span></div><BikeTable bikes={filteredBikes} onEdit={openBike} onDelete={deleteBike}/></section>}
        {tab==='Bookings' && <section className="panel"><div className="panel-heading"><div><h3>Bookings</h3><p>Track reservations and rental status.</p></div><button className="btn primary" onClick={()=>{setBookingForm({bike_id:String(bikes.find(b=>b.status==='available')?.id||''),start_at:'',end_at:'',customer_name:'',customer_email:''});setModal('booking')}}><Plus size={17}/> New booking</button></div><BookingTable bookings={bookings} onStatus={changeBookingStatus}/></section>}
        {tab==='Payments' && <section className="panel"><div className="panel-heading"><div><h3>Payment records</h3><p>Manual payment tracking. No real charges are processed.</p></div><button className="btn primary" onClick={()=>{setPaymentForm({booking_id:String(bookings[0]?.id||''),amount:String(bookings[0]?.total_amount||''),method:'Cash',reference:''});setModal('payment')}}><Plus size={17}/> Record payment</button></div><PaymentTable payments={payments}/></section>}
        {tab==='Customers' && <section className="panel"><div className="panel-heading"><div><h3>Customers</h3><p>Registered accounts that can sign in to the system.</p></div><span className="pill">{customers.length} customers</span></div><div className="table-wrap"><table><thead><tr><th>Customer</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td><div className="person-cell"><div className="avatar pale">{c.name.slice(0,1).toUpperCase()}</div><strong>{c.name}</strong></div></td><td>{c.email}</td><td><span className="status-pill">{c.role}</span></td><td>—</td></tr>)}</tbody></table></div></section>}
        <footer className="footer"><span>© 2026 Cordova Bike Rental</span><span>Rental operations made simpler.</span></footer>
      </div>
    </main>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><section className="modal-card"><div className="modal-heading"><div><span className="eyebrow">CORDOVA / MANAGEMENT</span><h3>{modal==='bike'?(editing?'Edit bike':'Add a bike'):modal==='booking'?'Create booking':'Record payment'}</h3></div><button className="icon-button" onClick={()=>setModal(null)}><X/></button></div>
      {modal==='bike' && <form className="form-stack" onSubmit={saveBike}><label>Bike name<input required value={bikeForm.name} onChange={e=>setBikeForm({...bikeForm,name:e.target.value})} placeholder="e.g. Trail Explorer 29"/></label><div className="form-row"><label>Bike type<select value={bikeForm.type} onChange={e=>setBikeForm({...bikeForm,type:e.target.value})}><option>Mountain Bike</option><option>Road Bike</option><option>City Bike</option><option>Folding Bike</option><option>Electric Bike</option><option>Kids Bike</option></select></label><label>Hourly rate (₱)<input type="number" min="1" step=".01" required value={bikeForm.price_per_hour} onChange={e=>setBikeForm({...bikeForm,price_per_hour:e.target.value})}/></label></div><label>Status<select value={bikeForm.status} onChange={e=>setBikeForm({...bikeForm,status:e.target.value})}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="unavailable">Unavailable</option></select></label><label>Image URL (optional)<input value={bikeForm.image_url} onChange={e=>setBikeForm({...bikeForm,image_url:e.target.value})} placeholder="https://…"/></label><label>Description<textarea rows={3} value={bikeForm.description} onChange={e=>setBikeForm({...bikeForm,description:e.target.value})} placeholder="Bike details…"/></label><button className="btn primary full" disabled={busy}>{busy?'Saving…':editing?'Save changes':'Add bike'}</button></form>}
      {modal==='booking' && <form className="form-stack" onSubmit={saveBooking}><label>Bike<select required value={bookingForm.bike_id} onChange={e=>setBookingForm({...bookingForm,bike_id:e.target.value})}><option value="">Choose available bike</option>{bikes.filter(b=>b.status==='available').map(b=><option key={b.id} value={b.id}>{b.name} · {money(b.price_per_hour)}/hr</option>)}</select></label><div className="form-row"><label>Start date/time<input type="datetime-local" required value={bookingForm.start_at} onChange={e=>setBookingForm({...bookingForm,start_at:e.target.value})}/></label><label>End date/time<input type="datetime-local" required value={bookingForm.end_at} onChange={e=>setBookingForm({...bookingForm,end_at:e.target.value})}/></label></div><label>Customer name<input required value={bookingForm.customer_name} onChange={e=>setBookingForm({...bookingForm,customer_name:e.target.value})}/></label><label>Customer email<input type="email" required value={bookingForm.customer_email} onChange={e=>setBookingForm({...bookingForm,customer_email:e.target.value})}/></label><button className="btn primary full" disabled={busy}>{busy?'Creating…':'Create booking'}</button></form>}
      {modal==='payment' && <form className="form-stack" onSubmit={savePayment}><label>Booking<select required value={paymentForm.booking_id} onChange={e=>{const b=bookings.find(x=>String(x.id)===e.target.value);setPaymentForm({...paymentForm,booking_id:e.target.value,amount:String(b?.total_amount||'')})}}><option value="">Choose booking</option>{bookings.map(b=><option key={b.id} value={b.id}>#{b.id} · {b.customer?.name||'Customer'} · {money(b.total_amount)}</option>)}</select></label><label>Amount (₱)<input type="number" min=".01" step=".01" required value={paymentForm.amount} onChange={e=>setPaymentForm({...paymentForm,amount:e.target.value})}/></label><label>Payment method<select value={paymentForm.method} onChange={e=>setPaymentForm({...paymentForm,method:e.target.value})}><option>Cash</option><option>GCash (manual record)</option><option>Bank transfer</option><option>Card (manual record)</option></select></label><label>Reference / receipt number<input value={paymentForm.reference} onChange={e=>setPaymentForm({...paymentForm,reference:e.target.value})}/></label><p className="tiny">This creates a record only; it does not process a charge.</p><button className="btn primary full" disabled={busy}>{busy?'Saving…':'Save payment record'}</button></form>}
    </section></div>}
  </div>
}

function Dashboard({stats,bookings,bikes,setTab}:{stats:any;bookings:Booking[];bikes:BikeItem[];setTab:(t:Tab)=>void}) {
  const recent = [...bookings].sort((a,b)=>b.id-a.id).slice(0,5)
  return <><div className="welcome-row"><div><p className="eyebrow">OVERVIEW</p><h1>Good day, welcome back 👋</h1><p className="muted">Here’s what’s happening with your bike rental business.</p></div><button className="btn secondary" onClick={()=>setTab('Bookings')}><CalendarDays size={17}/> View bookings</button></div>
    <div className="stats-grid"><StatCard label="Total bikes" value={stats.bikes??bikes.length} note="In your fleet" icon={<Bike/>} tone="green"/><StatCard label="Total bookings" value={stats.bookings??bookings.length} note="All reservations" icon={<CalendarDays/>} tone="blue"/><StatCard label="Recorded revenue" value={money(stats.revenue||0)} note="Paid records only" icon={<CreditCard/>} tone="orange"/><StatCard label="Customers" value={stats.customers||0} note="Registered users" icon={<Users/>} tone="purple"/></div>
    <div className="dashboard-grid"><section className="panel recent-panel"><div className="panel-heading"><div><h3>Recent bookings</h3><p>Latest reservations across your fleet.</p></div><button className="text-button" onClick={()=>setTab('Bookings')}>View all →</button></div><BookingTable bookings={recent} compact/></section><section className="panel fleet-panel"><div className="panel-heading"><div><h3>Fleet status</h3><p>Availability at a glance.</p></div><button className="text-button" onClick={()=>setTab('Bikes')}>Manage →</button></div><div className="fleet-stats"><div><span className="fleet-dot available-dot"/><span>Available</span><strong>{bikes.filter(b=>b.status==='available').length}</strong></div><div><span className="fleet-dot maintenance-dot"/><span>Maintenance</span><strong>{bikes.filter(b=>b.status==='maintenance').length}</strong></div><div><span className="fleet-dot unavailable-dot"/><span>Unavailable</span><strong>{bikes.filter(b=>b.status==='unavailable').length}</strong></div></div><div className="fleet-bar"><span style={{width:`${bikes.length?bikes.filter(b=>b.status==='available').length/bikes.length*100:0}%`}}/></div><p className="tiny">Keep your bike status updated so customers know what they can book.</p></section></div>
  </>
}
function StatCard({label,value,note,icon,tone}:{label:string;value:any;note:string;icon:any;tone:string}) { return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></article> }
function BikeTable({bikes,onEdit,onDelete}:{bikes:BikeItem[];onEdit:(b:BikeItem)=>void;onDelete:(b:BikeItem)=>void}) { return <div className="table-wrap"><table><thead><tr><th>Bike</th><th>Category</th><th>Hourly rate</th><th>Status</th><th>Actions</th></tr></thead><tbody>{bikes.map(b=><tr key={b.id}><td><div className="bike-cell"><div className="bike-thumb">{b.image_url?<img src={b.image_url} alt={b.name}/>:<Bike size={22}/>}</div><div><strong>{b.name}</strong><span>{b.description||'Rental bike'}</span></div></div></td><td>{b.type}</td><td className="price-cell">{money(b.price_per_hour)}<small>/ hour</small></td><td><Status value={b.status}/></td><td><div className="actions"><button className="btn small-btn secondary" onClick={()=>onEdit(b)}>Edit</button><button className="btn small-btn danger" onClick={()=>onDelete(b)}>Delete</button></div></td></tr>)}{!bikes.length&&<EmptyRow text="No bikes yet. Add your first bike to get started." cols={5}/>}</tbody></table></div> }
function BookingTable({bookings,onStatus,compact=false}:{bookings:Booking[];onStatus?:(b:Booking,s:string)=>void;compact?:boolean}) { return <div className="table-wrap"><table><thead><tr><th>Booking</th><th>Bike</th><th>Schedule</th><th>Amount</th><th>Status</th>{!compact&&<th>Update</th>}</tr></thead><tbody>{bookings.map(b=><tr key={b.id}><td><div className="booking-id">#{String(b.id).padStart(4,'0')}</div><span className="sub-cell">{b.customer?.name||'Customer'}</span></td><td>{b.bike?.name||'Bike'}</td><td><span>{new Date(b.start_at).toLocaleString()}</span><span className="sub-cell">to {new Date(b.end_at).toLocaleString()}</span></td><td className="price-cell">{money(b.total_amount)}</td><td><Status value={b.status}/></td>{!compact&&<td><select className="inline-select" value={b.status} onChange={e=>onStatus?.(b,e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td>}</tr>)}{!bookings.length&&<EmptyRow text="No bookings to show." cols={compact?5:6}/>}</tbody></table></div> }
function PaymentTable({payments}:{payments:Payment[]}) { return <div className="table-wrap"><table><thead><tr><th>Payment</th><th>Booking</th><th>Method</th><th>Reference</th><th>Amount</th><th>Status</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td>#{String(p.id).padStart(4,'0')}</td><td>Booking #{p.booking_id}</td><td>{p.method}</td><td>{p.reference||'—'}</td><td className="price-cell">{money(p.amount)}</td><td><Status value={p.status}/></td></tr>)}{!payments.length&&<EmptyRow text="No payment records yet." cols={6}/>}</tbody></table></div> }
function Status({value}:{value:string}) { const cls=value.toLowerCase().replaceAll(' ','-'); return <span className={`status-pill ${cls}`}><span/> {value}</span> }
function EmptyRow({text,cols}:{text:string;cols:number}) { return <tr><td colSpan={cols} className="empty-row"><div><Clock3 size={22}/><span>{text}</span></div></td></tr> }
