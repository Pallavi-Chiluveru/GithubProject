import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Eye,
  FileCode,
  GitBranch,
  GitPullRequest,
  Lock,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import Github from "../components/GithubIcon";

const highlights = [
  {
    icon: GitBranch,
    title: "Repository workspace",
    text: "Create, import, fork, and organize project work from one focused place.",
  },
  {
    icon: GitPullRequest,
    title: "Pull request flow",
    text: "Track reviews, inspect changes, and keep collaboration moving with less context switching.",
  },
  {
    icon: Bell,
    title: "Activity alerts",
    text: "Stay current on invitations, mentions, issue updates, and team activity.",
  },
];

const stats = [
  ["Fast setup", "Start a project, import code, or create an organization in minutes."],
  ["Team ready", "Manage collaborators, members, roles, and repository access."],
  ["Guided work", "Use companion tools for issues, discussions, insights, and agents."],
];

const featureDetails = [
  "Issue tracking with labels, context, and project planning",
  "Repository importing, forking, syncing, and branch-aware work",
  "Profile, organization, and collaborator views for team clarity",
  "AI companion surfaces for learning, guidance, and repository help",
];

const workflowSteps = [
  {
    icon: FileCode,
    title: "Create or import",
    text: "Start from a new repository, bring in existing code, or fork a project into your own workspace.",
  },
  {
    icon: MessageSquare,
    title: "Discuss and plan",
    text: "Capture issues, project tasks, discussions, and team decisions close to the code.",
  },
  {
    icon: GitPullRequest,
    title: "Review and merge",
    text: "Open pull requests, inspect changes, and keep reviewers aligned before work lands.",
  },
];

const securityItems = [
  { icon: UserPlus, label: "Invitation-based team access" },
  { icon: Eye, label: "Clear repository visibility" },
  { icon: ShieldCheck, label: "Organization permission controls" },
  { icon: Lock, label: "Authenticated dashboard sessions" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="RepoSphere home">
            <Github className="h-11 w-11" />
            <span className="text-base font-bold tracking-tight">RepoSphere</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-[var(--text-secondary)] md:flex">
            <a href="#features" className="hover:text-[var(--text-primary)]">Features</a>
            <a href="#workflow" className="hover:text-[var(--text-primary)]">Workflow</a>
            <a href="#security" className="hover:text-[var(--text-primary)]">Security</a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Built for modern repository teams
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
                Plan, build, and review code in one calm workspace.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
                RepoSphere brings repositories, pull requests, issues, organizations, and developer assistance into a polished workflow your team can scan quickly and use every day.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[var(--text-secondary)]" />
                  <span className="text-sm font-semibold">Repository overview</span>
                </div>
                <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Live</span>
              </div>
              <div className="space-y-3 pt-4">
                {stats.map(([title, text]) => (
                  <div key={title} className="rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <div className="text-sm font-semibold">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Everything starts from a useful home base.</h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Move from planning to implementation without losing the thread of what changed, who is involved, or what needs review.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-[var(--card-shadow)]">
                <Icon className="h-6 w-6 text-blue-600" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:grid-cols-2">
            {featureDetails.map((feature) => (
              <div key={feature} className="flex items-start gap-3 rounded-md bg-[var(--bg-primary)] p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span className="text-sm leading-6 text-[var(--text-secondary)]">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div>
              <Users className="h-7 w-7 text-blue-600" />
              <h2 className="mt-4 text-2xl font-bold">Built for teams</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                A simple path from idea to reviewed code, with each step connected to the same project context.
              </p>
            </div>
            <div className="grid gap-4 lg:col-span-2">
              {workflowSteps.map(({ icon: Icon, title, text }, index) => (
                <div key={title} className="grid gap-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 shadow-[var(--card-shadow)] sm:grid-cols-[auto_1fr]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-blue-600">Step {index + 1}</span>
                      <h3 className="text-base font-semibold">{title}</h3>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 shadow-[var(--card-shadow)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                  Secure access
                </div>
                <h2 className="mt-3 text-2xl font-bold">Sign in, invite teammates, and keep permissions clear.</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Authentication, organization management, invitations, and repository permissions are ready when your project grows.
                </p>
              </div>
              <Lock className="h-14 w-14 text-[var(--text-muted)]" />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {securityItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                  <Icon className="h-4 w-4 shrink-0 text-blue-600" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Github className="h-8 w-8" />
            <span>RepoSphere</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="#features" className="hover:text-[var(--text-primary)]">Features</a>
            <a href="#workflow" className="hover:text-[var(--text-primary)]">Workflow</a>
            <a href="#security" className="hover:text-[var(--text-primary)]">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
