import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import WebRouter from "./pages/router.tsx"

const root = ReactDOM.createRoot(document.getElementById("root")!)

root.render(
    <StrictMode>
        <BrowserRouter>
            <WebRouter />
        </BrowserRouter>
    </StrictMode>
)
