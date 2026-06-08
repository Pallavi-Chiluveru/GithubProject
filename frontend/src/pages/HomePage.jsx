import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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
  GitCommit,
  FolderGit2
} from "lucide-react";
import Github from "../components/GithubIcon";
import dashboardImage from "../assets/dashboardimage.png";

const highlights = [
  {
    icon: GitBranch,
    title: "Repository workspace",
    text: "Create, import, fork, and organize project work from one focused place.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: GitPullRequest,
    title: "Pull request flow",
    text: "Track reviews, inspect changes, and keep collaboration moving with less context switching.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Bell,
    title: "Activity alerts",
    text: "Stay current on invitations, mentions, issue updates, and team activity.",
    color: "from-indigo-500 to-blue-500",
  },
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <header className="fixed top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group" aria-label="RepoSphere home">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
              <Github className="h-9 w-9 text-indigo-600 transition-colors group-hover:text-cyan-500" />
            </motion.div>
            <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              RepoSphere
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-[var(--text-secondary)] md:flex">
            <a href="#features" className="transition-colors hover:text-indigo-500">Features</a>
            <a href="#workflow" className="transition-colors hover:text-purple-500">Workflow</a>
            <a href="#security" className="transition-colors hover:text-cyan-500">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold transition-colors hover:text-indigo-500 hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-[var(--text-primary)] px-6 font-medium text-[var(--bg-primary)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <span className="mr-2">Register</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 w-full h-full max-w-7xl opacity-50 blur-[100px] pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-20 h-72 w-72 rounded-full bg-indigo-500/30"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                y: [0, 50, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-40 right-20 h-96 w-96 rounded-full bg-purple-500/20"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4],
                x: [0, -50, 0]
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-cyan-500/20"
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-2xl"
              >
                <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-600 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built for modern repository teams
                </motion.div>
                <motion.h1 variants={fadeInUp} className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6">
                  Plan, build, and <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
                    review code
                  </span>
                  <br /> in one calm workspace.
                </motion.h1>
                <motion.p variants={fadeInUp} className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]">
                  RepoSphere brings repositories, pull requests, issues, organizations, and developer assistance into a polished workflow your team can scan quickly and use every day.
                </motion.p>
                <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/register"
                    className="group relative inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-black shadow-[0_0_40px_rgba(79,70,229,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)]"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10 pointer-events-none" />
                    <span className="relative z-10 flex items-center gap-2">
                       Get Started
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/50 backdrop-blur-md px-8 text-sm font-semibold transition-all hover:bg-[var(--bg-secondary)] hover:scale-105"
                  >
                    View Features
                  </a>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="relative hidden lg:block perspective-1000"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 blur-3xl rounded-[2rem] -z-10 transform scale-95 translate-y-4" />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/50 p-2 shadow-[0_20px_50px_rgba(8,112,184,0.15)] overflow-hidden backdrop-blur-xl"
                >
                  <img src={dashboardImage} alt="RepoSphere Collaborative Workflow" className="w-full h-auto rounded-xl object-cover shadow-sm border border-[var(--border-color)]" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-24 bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything starts from a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">useful home base.</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[var(--text-secondary)] text-lg">
                Move from planning to implementation without losing the thread of what changed, who is involved, or what needs review.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-3"
            >
              {highlights.map(({ icon: Icon, title, text, color }) => (
                <motion.article
                  key={title}
                  variants={fadeInUp}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 shadow-[var(--card-shadow)] transition-all hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{text}</p>
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 shadow-sm sm:grid-cols-2"
            >
              {featureDetails.map((feature, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl hover:bg-[var(--bg-secondary)] p-4 transition-colors">
                  <div className="rounded-full bg-green-500/10 p-1">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  </div>
                  <span className="text-sm leading-6 text-[var(--text-secondary)]">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Workflow Timeline Section */}
        <section id="workflow" className="py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-16 items-start">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="lg:sticky lg:top-32"
              >
                <motion.div variants={fadeInUp} className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Users className="h-6 w-6" />
                </motion.div>
                <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">Built for teams</motion.h2>
                <motion.p variants={fadeInUp} className="text-[var(--text-secondary)] leading-relaxed text-lg">
                  A simple path from idea to reviewed code, with each step connected to the same project context.
                </motion.p>
              </motion.div>

              <div className="lg:col-span-2 relative">
                <div className="absolute left-6 lg:left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-500 opacity-20" />

                <div className="space-y-12 relative">
                  {workflowSteps.map(({ icon: Icon, title, text }, index) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className="relative pl-16 lg:pl-24"
                    >
                      <div className="absolute left-0 lg:left-2 top-2 h-12 w-12 rounded-full border-4 border-[var(--bg-primary)] bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>

                      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 shadow-[var(--card-shadow)] hover:shadow-xl transition-shadow group">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-xl font-semibold">{title}</h3>
                        </div>
                        <p className="text-[var(--text-secondary)] leading-relaxed pl-14">
                          {text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section (Dark Contrast) */}
        <section id="security" className="py-24 bg-gray-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-800 bg-gray-900/50 backdrop-blur-xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full" />

              <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
                <div className="max-w-2xl relative z-10">
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 mb-4">
                    <ShieldCheck className="h-5 w-5" />
                    Enterprise-grade security
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                    Sign in, invite teammates, and keep permissions clear.
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Authentication, organization management, invitations, and repository permissions are ready when your project grows. Your code stays safe with granular access controls.
                  </p>
                </div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative w-full max-w-[320px] rounded-2xl border border-gray-800 bg-gray-900/50 shadow-[0_0_50px_rgba(6,182,212,0.15)] z-10 shrink-0 overflow-hidden lg:ml-8"
                >
                  <img src="/security-graphic.png" alt="Enterprise Security Graphic" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
                </motion.div>
              </div>

              <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
                {securityItems.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 transition-colors"
                  >
                    <div className="rounded-lg bg-gray-900 p-2 border border-gray-700">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Github className="h-8 w-8 text-indigo-600" />
            <span className="font-bold text-base text-[var(--text-primary)]">RepoSphere</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-purple-500 transition-colors">Workflow</a>
            <a href="#security" className="hover:text-cyan-500 transition-colors">Security</a>
          </div>
          <div className="text-xs opacity-70">
            &copy; {new Date().getFullYear()} RepoSphere. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
