import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "antd/dist/reset.css"; // CSS của Ant Design v5+
import "./index.css";         // CSS gốc của Tailwind (bạn tự tạo file này)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
