import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components'
import Home from './pages/Home/Home'
import Interview from './pages/Interview/Interview'

function ChatPlaceholder() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1120, margin: '0 auto' }}>
      <h1>Чат-интервью</h1>
      <p style={{ color: '#908d85', marginTop: '0.5rem' }}>В разработке</p>
    </div>
  )
}

function HistoryPlaceholder() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1120, margin: '0 auto' }}>
      <h1>История</h1>
      <p style={{ color: '#908d85', marginTop: '0.5rem' }}>В разработке</p>
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
          <Route path="/interview/chat" element={<ChatPlaceholder />} />
          <Route path="/history" element={<HistoryPlaceholder />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
