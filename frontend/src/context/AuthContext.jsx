import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import axios from 'axios'

const AuthContext = createContext()
const BASE = 'http://localhost:3000/api'

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Busca o perfil completo do backend e mescla com dados do auth
  const loadProfile = async (authUser, accessToken) => {
    try {
      const res = await axios.get(`${BASE}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const full = {
        id:    authUser.id,
        email: authUser.email,
        ...res.data          // name, role, company, avatar, etc.
      }
      setUser(full)
      setToken(accessToken)
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(full))
      return full
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      return null
    }
  }

  useEffect(() => {
    // 1. Verifica sessão atual (funciona mesmo após refresh de página)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await loadProfile(session.user, session.access_token)
      } else {
        // Sem sessão válida — limpa tudo
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
      }
      setLoading(false)
    })

    // 2. Escuta mudanças de sessão (login, logout, renovação de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadProfile(session.user, session.access_token)
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setToken(null)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Login via backend (que usa supabase.auth.signInWithPassword)
  // Após o backend logar, o cliente Supabase no frontend também
  // precisa saber da sessão — por isso logamos aqui também
  const login = async (userData, accessToken) => {
    // Salva o token imediatamente para uso nas requisições
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)

    // Sincroniza a sessão no cliente Supabase do frontend
    // para que onAuthStateChange/renovação automática funcione
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Força a sessão usando o token retornado pelo backend
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: userData.refresh_token || ''
        })
      }
    } catch {}
  }

  const refreshUser = async () => {
    const tk = localStorage.getItem('token')
    if (!tk) return
    try {
      const res = await axios.get(`${BASE}/users/me`, {
        headers: { Authorization: `Bearer ${tk}` }
      })
      const saved = JSON.parse(localStorage.getItem('user') || '{}')
      const full = { ...saved, ...res.data }
      setUser(full)
      localStorage.setItem('user', JSON.stringify(full))
    } catch {}
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
