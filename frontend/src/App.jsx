import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./theme/ThemeContext";

// Lazy loaded components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RepoDetails = lazy(() => import("./components/RepoDetails"));
const CreateRepo = lazy(() => import("./components/CreateRepo"));
const Issues = lazy(() => import("./components/Issues"));
const Collaborators = lazy(() => import("./components/Collaborators"));
const CreateOrg = lazy(() => import("./components/CreateOrg"));
const CreateIssue = lazy(() => import("./components/CreateIssue"));
const NewIssueForm = lazy(() => import("./components/NewIssueForm"));
const IssueDetails = lazy(() => import("./components/IssueDetails"));
const ImportRepo = lazy(() => import("./components/ImportRepo"));
const CreateProject = lazy(() => import("./components/CreateProject"));
const CreateGist = lazy(() => import("./components/CreateGist"));
const Codespaces = lazy(() => import("./components/Codespaces"));
const CreateCodespace = lazy(() => import("./components/CreateCodespace"));
const Changelog = lazy(() => import("./components/Changelog"));
const OrgDashboard = lazy(() => import("./components/OrgDashboard"));
const Notifications = lazy(() => import("./components/Notifications"));
const Invitations = lazy(() => import("./components/Invitations"));
const ManageOrgs = lazy(() => import("./components/ManageOrgs"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));
const GlobalIssues = lazy(() => import("./components/GlobalIssues"));
const GlobalPulls = lazy(() => import("./components/GlobalPulls"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AgentPage = lazy(() => import("./pages/AgentPage"));
const SpacesPage = lazy(() => import("./pages/SpacesPage"));
const SpaceDetailsPage = lazy(() => import("./pages/SpaceDetailsPage"));
const RepositoriesPage = lazy(() => import("./pages/RepositoriesPage"));
const GitHubCompanion = lazy(() => import("./pages/GitHubCompanion"));
const DiscussionsPage = lazy(() => import("./pages/DiscussionsPage"));
const CreateForkPage = lazy(() => import("./pages/CreateForkPage"));



// New Pull Request components
const RepoPulls = lazy(() => import("./components/RepoPulls"));
const CreatePullRequest = lazy(() => import("./components/CreatePullRequest"));
const PullRequestDetails = lazy(() => import("./components/PullRequestDetails"));
const RepoSettings = lazy(() => import("./components/RepoSettings"));

// Loading fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f78166] border-t-transparent"></div>
  </div>
);


import NotificationProvider from "./components/NotificationProvider";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <NotificationProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repo/:id" element={<RepoDetails />} />
          <Route path="/create-repo" element={<CreateRepo />} />
          <Route path="/org" element={<CreateOrg />} />
          <Route path="/org/:id" element={<OrgDashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/repo/:id/issues" element={<Issues />} />
          <Route path="/repo/:id/pulls" element={<RepoPulls />} />
          <Route path="/repo/:id/pull/new" element={<CreatePullRequest />} />
          <Route path="/repo/:id/pull/:prId" element={<PullRequestDetails />} />
          <Route path="/repo/:id/settings" element={<RepoSettings />} />
          <Route path="/repo/:id/collaborators" element={<Collaborators />} />
          <Route path="/new-issue" element={<CreateIssue />} />
          <Route path="/repo/:id/new-issue" element={<NewIssueForm />} />
          <Route path="/repo/:repoId/issues/:issueId" element={<IssueDetails />} />
          <Route path="/import" element={<ImportRepo />} />
          <Route path="/new-project" element={<CreateProject />} />
          <Route path="/gist" element={<CreateGist />} />
          <Route path="/codespaces" element={<Codespaces />} />
          <Route path="/codespaces/new" element={<CreateCodespace />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/organizations" element={<ManageOrgs />} />
          <Route path="/issues" element={<GlobalIssues />} />
          <Route path="/pulls" element={<GlobalPulls />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/copilot" element={<AgentPage />} />
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="/spaces/:id" element={<SpaceDetailsPage />} />

          <Route path="/repos" element={<RepositoriesPage />} />
          <Route path="/companion" element={<GitHubCompanion />} />
          <Route path="/discussions" element={<DiscussionsPage />} />
          <Route path="/fork/:repoId" element={<CreateForkPage />} />

        </Routes>
      </Suspense>
    </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>

  );
}

export default App;