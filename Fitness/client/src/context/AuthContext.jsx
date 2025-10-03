import React, { createContext, useState, useContext, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
            try {
                api.defaults.headers.Authorization = `Bearer ${token}`
                setUser(JSON.parse(userData))
            } catch (error) {
                console.error('Error parsing user data:', error)
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password })
            
            if (response.data.success) {
                const { token, user: userData } = response.data
                
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(userData))
                api.defaults.headers.Authorization = `Bearer ${token}`
                setUser(userData)
                
                return { success: true, message: response.data.message }
            } else {
                return { 
                    success: false, 
                    message: response.data.message || 'Login failed' 
                }
            }
        } catch (error) {
            console.error('Login error:', error)
            const message = error.response?.data?.message || 'Login failed. Please try again.'
            return {
                success: false,
                message: message
            }
        }
    }

    const register = async (userData) => {
        try {
            // Remove confirmPassword if present, backend doesn't need it
            const { confirmPassword, ...registrationData } = userData;
            
            const response = await api.post('/auth/register', registrationData)
            
            if (response.data.success) {
                const { token, user: userInfo } = response.data

                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(userInfo))
                api.defaults.headers.Authorization = `Bearer ${token}`
                setUser(userInfo)
                
                return { 
                    success: true, 
                    message: response.data.message 
                }
            } else {
                return { 
                    success: false, 
                    message: response.data.message || 'Registration failed' 
                }
            }
        } catch (error) {
            console.error('Registration error:', error)
            const message = error.response?.data?.message || 'Registration failed. Please try again.'
            return {
                success: false,
                message: message
            }
        }
    }

    const demoLogin = async () => {
        try {
            const response = await api.post('/auth/demo-login')
            
            if (response.data.success) {
                const { token, user: userData } = response.data

                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(userData))
                api.defaults.headers.Authorization = `Bearer ${token}`
                setUser(userData)
                
                return { 
                    success: true, 
                    message: response.data.message 
                }
            } else {
                return { 
                    success: false, 
                    message: response.data.message || 'Demo login failed' 
                }
            }
        } catch (error) {
            console.error('Demo login error:', error)
            const message = error.response?.data?.message || 'Demo login failed. Please try again.'
            return {
                success: false,
                message: message
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.Authorization
        setUser(null)
    }

    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData)
            if (response.data.success) {
                setUser(response.data.user)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                return { success: true }
            } else {
                return {
                    success: false,
                    message: response.data.message
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed'
            return {
                success: false,
                message: message
            }
        }
    }

    const value = {
        user,
        login,
        register,
        logout,
        updateProfile,
        demoLogin,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
