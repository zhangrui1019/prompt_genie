import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "./i18n";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterSuccess from "@/pages/RegisterSuccess";
import Dashboard from "@/pages/Dashboard";
import PromptsList from "@/pages/PromptsList";
import PromptEditor from "@/pages/PromptEditor";
import Optimizer from "@/pages/Optimizer";
import Playground from "@/pages/Playground";
import Templates from "@/pages/Templates";
import TemplateManagement from "@/pages/TemplateManagement";
import AgentsList from "@/pages/AgentsList";
import AgentBuilder from "@/pages/AgentBuilder";
import Marketplace from "@/pages/Marketplace";
import PrivateModels from "@/pages/PrivateModels";
import Community from "@/pages/Community";
import AdminDashboard from "@/pages/AdminDashboard";
import Monitoring from "@/pages/Monitoring";
import IndustryKnowledgeBase from "@/pages/IndustryKnowledgeBase";
import RoleConsistency from "@/pages/RoleConsistency";
import AgentEcosystem from "@/pages/AgentEcosystem";
import AnalyticsReporting from "@/pages/AnalyticsReporting";
import SecurityCompliance from "@/pages/SecurityCompliance";
import AdvancedWorkflows from "@/pages/AdvancedWorkflows";
import ThirdPartyIntegrations from "@/pages/ThirdPartyIntegrations";
import V2Dashboard from "@/pages/V2Dashboard";
import AdvancedAIAssist from "@/pages/AdvancedAIAssist";
import CrossPlatformCollaboration from "@/pages/CrossPlatformCollaboration";
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
import WorkspaceSettings from "@/pages/WorkspaceSettings";
import { useAuthStore } from "@/store/authStore";

import { Toaster } from 'react-hot-toast';
import PageTitleUpdater from "@/components/PageTitleUpdater";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
        <Route path="/register/success" element={<RegisterSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prompts" element={<PromptsList />} />
        <Route path="/prompts/new" element={<PromptEditor />} />
        <Route path="/prompts/:id" element={<PromptEditor />} />
        <Route path="/optimizer" element={<Optimizer />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/templates/management" element={<TemplateManagement />} />
        <Route path="/agents" element={<AgentsList />} />
        <Route path="/agents/new" element={<AgentBuilder />} />
        <Route path="/agents/:id" element={<AgentBuilder />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/private-models" element={<PrivateModels />} />
        <Route path="/community" element={<Community />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/industry-knowledge" element={<IndustryKnowledgeBase />} />
        <Route path="/role-consistency" element={<RoleConsistency />} />
        <Route path="/agent-ecosystem" element={<AgentEcosystem />} />
        <Route path="/analytics" element={<AnalyticsReporting />} />
        <Route path="/security" element={<SecurityCompliance />} />
        <Route path="/workflows" element={<AdvancedWorkflows />} />
        <Route path="/integrations" element={<ThirdPartyIntegrations />} />
        <Route path="/v2/dashboard" element={<V2Dashboard />} />
        <Route path="/v2/ai-assist" element={<AdvancedAIAssist />} />
        <Route path="/v2/collaboration" element={<CrossPlatformCollaboration />} />
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
        <Route path="/workspace/:id/settings" element={<WorkspaceSettings />} />
      </Routes>
    </Router>
  );
}
