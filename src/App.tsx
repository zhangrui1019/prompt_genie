import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import PromptsList from "@/pages/PromptsList";
import PromptEditor from "@/pages/PromptEditor";
import Optimizer from "@/pages/Optimizer";
import Playground from "@/pages/Playground";
import Templates from "@/pages/Templates";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prompts" element={<PromptsList />} />
        <Route path="/prompts/new" element={<PromptEditor />} />
        <Route path="/prompts/:id" element={<PromptEditor />} />
        <Route path="/optimizer" element={<Optimizer />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
