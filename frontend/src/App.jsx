
import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import NotificationsPage from './pages/NotificationsPage'
import CallPage from './pages/callPage'
import ChatPage from "./pages/ChatPage"
import OnboardingPage from './pages/OnboardingPage'
import toast, { Toaster } from 'react-hot-toast'
import { axiosInstance } from './lib/axios.js'
import { useQuery } from '@tanstack/react-query'
import PageLoader from './components/PageLoader.jsx'
import { getAuthUser } from './lib/api.js'
import useAuthUser from './hook/useAuthUser.js'
import Layout from './components/Layout.jsx'
import { useThemeStore } from './store/useThemeStore.js'
const App = () => {
  console.log("App component mounted"); // ✅ Should appear no matter what
  
 const{isLoading,authUser} =useAuthUser()
 const isAuthenticated = Boolean(authUser)
 const {theme}= useThemeStore()
 const isOnboarded = authUser?.isOnboarded

  if(isLoading) return <PageLoader/>
  return (
    <div className='h-screen' data-theme={theme}>
      <Routes>
        <Route path='/' element={ isAuthenticated && isOnboarded ?(<Layout><HomePage/></Layout>):(
          <Navigate to={!isAuthenticated ?"/login":"/onboarding"}/>
        )} />
        <Route path="/signup" element={!isAuthenticated?<SignUpPage />:<Navigate to={isOnboarded?"/":"/onboarding"}/>}/>
        <Route path='/login' element={!isAuthenticated?<LoginPage />:<Navigate to={isOnboarded?"/":"/onboarding"}/>} />
        <Route path="/notifications" element={ isAuthenticated && isOnboarded ?(<Layout showSidebar={true}><NotificationsPage/></Layout>):(
          <Navigate to={!isAuthenticated ?"/login":"/onboarding"}/>
        )} />
        <Route path='/call/:id' element={ isAuthenticated && isOnboarded ?(<CallPage/>):(
          <Navigate to={!isAuthenticated ?"/login":"/onboarding"}/>
        )}  />
        <Route path='/chat/:id' element={ isAuthenticated && isOnboarded ?(<Layout showSidebar={false}><ChatPage/></Layout>):(
          <Navigate to={!isAuthenticated ?"/login":"/onboarding"}/>
        )}  />
        <Route path='/onboarding' element={ isAuthenticated ?(
          !isOnboarded?(<OnboardingPage/>):(<Navigate to="/"/>)
        ):(
          <Navigate to="/login"/>
        )} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App