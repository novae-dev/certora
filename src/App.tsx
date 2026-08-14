import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { VerifyPage } from './pages/VerifyPage'
import { AuthProvider } from './auth/AuthProvider'
import { RedirectIfAuthenticated, RequireAuth } from './auth/RequireAuth'
import { DashboardLayout } from './dashboard/DashboardLayout'
import { CertificatesPage } from './pages/dashboard/CertificatesPage'
import { IssueCertificatePage } from './pages/dashboard/IssueCertificatePage'
import { VerificationPage } from './pages/dashboard/VerificationPage'
import { OrganizationPage } from './pages/dashboard/OrganizationPage'
import { SettingsPage } from './pages/dashboard/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
          <Route path="/signup" element={<RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>} />
          <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<DashboardPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="certificates/new" element={<IssueCertificatePage />} />
            <Route path="verification" element={<VerificationPage />} />
            <Route path="organization" element={<OrganizationPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/verify/:certificateId" element={<VerifyPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
