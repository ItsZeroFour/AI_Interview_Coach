import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components'
import Home from './pages/Home/Home'
import Interview from './pages/Interview/Interview'
import Chat from './pages/Chat/Chat'
import Report from './pages/Report/Report'
import History from './pages/History/History'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/interview/chat" element={<Chat />} />
          <Route path="/report/:sessionId" element={<Report />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
