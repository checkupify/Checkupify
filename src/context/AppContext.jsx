import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Auth
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ck_user') || 'null') } catch { return null }
  })
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('ck_token') || null)

  // City
  const [city, setCity] = useState(() => localStorage.getItem('ck_city') || 'Hyderabad')

  // Modals
  const [modal, setModal] = useState(null) // 'login' | 'city' | 'booking' | 'account' | 'drawer'

  // Booking context
  const [bookingItem, setBookingItem] = useState(null)

  // Toast
  const [toasts, setToasts] = useState([])

  const openModal = useCallback((name, data = null) => {
    setModal(name)
    if (data) setBookingItem(data)
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  const selectCity = useCallback((c) => {
    setCity(c)
    localStorage.setItem('ck_city', c)
    setModal(null)
    addToast('success', `City set to ${c}`)
  }, [])

  const addToast = useCallback((type, msg) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, msg }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const login = useCallback((userData, token) => {
    setUser(userData)
    setAuthToken(token)
    localStorage.setItem('ck_user', JSON.stringify(userData))
    localStorage.setItem('ck_token', token)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('ck_user')
    localStorage.removeItem('ck_token')
    addToast('info', 'Signed out successfully')
  }, [addToast])

  const startBooking = useCallback((type, item) => {
    setBookingItem({ type, ...item })
    setModal('booking')
  }, [])

  return (
    <AppContext.Provider value={{
      user, authToken, login, logout,
      city, selectCity,
      modal, openModal, closeModal,
      bookingItem, startBooking,
      toasts, addToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
