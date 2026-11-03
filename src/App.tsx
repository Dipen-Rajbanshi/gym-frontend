import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import CustomerList from "./components/CustomerList";
import TrainingList from "./components/TrainingList";

export default function App() {
  return (
    <BrowserRouter>
      <AppBar
            position="static"
            elevation={3}
            sx={{ background: "linear-gradient(90deg, #0d47a1 0%, #1976d2 100%)" }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gym Training Manager
          </Typography>

          <Button
            component={NavLink}
            to="/customers"
            className="nav-link"
            startIcon={<PeopleIcon />}
          >
            Customers
          </Button>
          <Button
            component={NavLink}
            to="/trainings"
            className="nav-link"
            startIcon={<EventIcon />}
          >
            Trainings
          </Button>
        </Toolbar>
      </AppBar>

      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/customers" />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/trainings" element={<TrainingList />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}