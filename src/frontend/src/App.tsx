import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components'
import Home from './pages/Home/Home'

function InterviewPage() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1120, margin: '0 auto' }}>
      <h1>Интервью</h1>
      <p style={{ color: '#908d85', marginTop: '0.5rem' }}>В разработке...</p>
    </div>
  )
}

function HistoryPage() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1120, margin: '0 auto' }}>
      <h1>История</h1>
      <p style={{ color: '#908d85', marginTop: '0.5rem' }}>В разработке...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
