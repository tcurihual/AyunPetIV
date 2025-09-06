import React from "react"
import { Routes, Route } from "react-router-dom"
import App from "../App.tsx"

const WebRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<h1>Ayün Pet</h1>} />
            <Route path="/example" element={<App />} />
        </Routes>
    )
}

export default WebRouter
