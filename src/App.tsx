import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import CustomerList from "./components/CustomerList";
import TrainingList from "./components/TrainingList";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  marginRight: 16,
  textDecoration: "none",
  fontWeight: isActive ? "bold" : "normal",
  color: isActive ? "#1976d2" : "#333",
});

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
        <NavLink to="/customers" style={linkStyle}>Customers</NavLink>
        <NavLink to="/trainings" style={linkStyle}>Trainings</NavLink>
      </nav>

      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/customers" />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/trainings" element={<TrainingList />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}