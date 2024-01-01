import { Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import Home from './Pages/Home'
import Chat from './Pages/Chat'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Routes>
        <Route path="/" Component={Home}></Route>
        <Route path="/chat" Component={Chat}></Route>
      </Routes>
    </div>
  )
}

export default App
