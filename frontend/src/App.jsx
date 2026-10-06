import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AppProvider } from './context/AppContext'
import { PlanProvider } from './context/PlanContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppProvider>
          <PlanProvider>
            <AppRoutes />
          </PlanProvider>
        </AppProvider>
      </BrowserRouter>
    </ToastProvider>
  )
}
