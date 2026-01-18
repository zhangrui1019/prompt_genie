import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import PromptsList from "@/pages/PromptsList";
import PromptEditor from "@/pages/PromptEditor";
import Optimizer from "@/pages/Optimizer";
import Playground from "@/pages/Playground";
import Templates from "@/pages/Templates";
import Profile from "@/pages/Profile";
import PublicProfile from "@/pages/PublicProfile";
import BatchRun from "@/pages/BatchRun";
import ChainsList from "@/pages/ChainsList";
import ChainEditor from "@/pages/ChainEditor";
import ChainRunner from "@/pages/ChainRunner";
import KnowledgeBase from "@/pages/KnowledgeBase";
import EvaluationList from "@/pages/EvaluationList";
import EvaluationCreate from "@/pages/EvaluationCreate";
import EvaluationReport from "@/pages/EvaluationReport";
import { useAuthStore } from "@/store/authStore";

import { Toaster } from 'react-hot-toast';
import PageTitleUpdater from "@/components/PageTitleUpdater";

export default function App() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Router>
      <PageTitleUpdater />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prompts" element={<PromptsList />} />
        <Route path="/prompts/new" element={<PromptEditor />} />
        <Route path="/prompts/:id" element={<PromptEditor />} />
        <Route path="/optimizer" element={<Optimizer />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/u/:id" element={<PublicProfile />} />
        <Route path="/batch" element={<BatchRun />} />
        <Route path="/chains" element={<ChainsList />} />
        <Route path="/chains/new" element={<ChainEditor />} />
        <Route path="/chains/:id" element={<ChainEditor />} />
        <Route path="/chains/:id/run" element={<ChainRunner />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/evaluations" element={<EvaluationList />} />
        <Route path="/evaluations/new" element={<EvaluationCreate />} />
        <Route path="/evaluations/:id" element={<EvaluationReport />} />
      </Routes>
    </Router>
  );
}
