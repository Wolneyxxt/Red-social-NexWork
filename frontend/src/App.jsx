import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Rede from './pages/Rede'
import Vagas from './pages/Vagas'
import Mensagens from './pages/Mensagens'
import Perfil from './pages/Perfil'
import './styles/global.css'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--text-muted)',fontFamily:'var(--font-sans)'}}>
      Carregando...
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/feed" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/feed" /> : <Register />} />
        <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
        <Route path="/rede" element={<PrivateRoute><Rede /></PrivateRoute>} />
        <Route path="/vagas" element={<PrivateRoute><Vagas /></PrivateRoute>} />
        <Route path="/mensagens" element={<PrivateRoute><Mensagens /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={user ? '/feed' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
