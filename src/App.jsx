import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { signOutUser } from "./lib/firebase/auth";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOutUser();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream font-body text-navy gap-4">
      <h1 className="text-3xl font-display tracking-wide">
        Welcome, {user?.email}
      </h1>
      <button
        onClick={handleLogout}
        className="bg-navy text-cream rounded px-4 py-2 font-body font-semibold"
      >
        Uitloggen
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
