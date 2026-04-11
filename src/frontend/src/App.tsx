import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components'
import Home from './pages/Home/Home'
import Interview from './pages/Interview/Interview'
import Chat from './pages/Chat/Chat'

function ReportPlaceholder() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1120, margin: '0 auto' }}>
      <h1>Отчёт</h1>
      <p style={{ color: '#908d85', marginTop: '0.5rem' }}>Будет реализовано в коммите #8</p>
    </div>
  )
}

function HistoryPlaceholder() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1120, margin: '0 auto' }}>
      <h1>История</h1>
      <p style={{ color: '#908d85', marginTop: '0.5rem' }}>Будет реализовано в коммите #9</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/interview/chat" element={<Chat />} />
          <Route path="/report/:sessionId" element={<ReportPlaceholder />} />
          <Route path="/history" element={<HistoryPlaceholder />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
