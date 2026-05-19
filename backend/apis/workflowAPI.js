import exp from "express";
import { WorkflowRunModel } from "../models/WorkflowRunModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const workflowApp = exp.Router();

/* ---------------- GET RUNS OF REPO ---------------- */
workflowApp.get("/:repoId", verifyToken, async (req, res) => {
  try {
    const runs = await WorkflowRunModel.find({ repoId: req.params.repoId })
      .populate("triggeredBy", "username profileImageUrl")
      .sort({ createdAt: -1 });
    res.status(200).json(runs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- GET SINGLE RUN DETAILS WITH LOGS ---------------- */
workflowApp.get("/run/:runId", verifyToken, async (req, res) => {
  try {
    const run = await WorkflowRunModel.findById(req.params.runId)
      .populate("triggeredBy", "username profileImageUrl");
    if (!run) {
      return res.status(404).json({ message: "Workflow run not found" });
    }
    res.status(200).json(run);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- TRIGGER WORKFLOW RUN ---------------- */
workflowApp.post("/:repoId/trigger", verifyToken, async (req, res) => {
  try {
    const { workflowName, workflowFile } = req.body;
    const { repoId } = req.params;

    const commitSha = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);

    // Initial queued status
    const run = await WorkflowRunModel.create({
      repoId,
      name: workflowName || "Build, Test and Deploy CI/CD",
      workflowFile: workflowFile || ".github/workflows/build.yml",
      status: "queued",
      triggeredBy: req.user.id,
      commitSha,
      logs: "Initializing workflow runner...\nWaiting for available slot..."
    });

    // Simulate run execution in the background asynchronously
    setTimeout(async () => {
      try {
        // Step 1: Running
        const activeRun = await WorkflowRunModel.findById(run._id);
        if (!activeRun) return;

        activeRun.status = "running";
        activeRun.logs = `[SYSTEM] Picked up job on runner node-${Math.floor(Math.random() * 1000)}...\n` +
          `[SYSTEM] Environment: Ubuntu-latest\n` +
          `[INFO]   Triggered by: ${req.user.username || "Developer"}\n` +
          `[INFO]   Commit SHA: ${commitSha}\n\n` +
          `========================================\n` +
          `STEP 1: Checking out repository code...\n` +
          `========================================\n` +
          `Cloning repository...\n` +
          `Switched to branch 'main'\n` +
          `SUCCESS: Checkout complete.\n\n` +
          `========================================\n` +
          `STEP 2: Setting up Node.js v20.x...\n` +
          `========================================\n` +
          `Downloading Node.js binary...\n` +
          `Verifying checksum...\n` +
          `Setting up env path...\n` +
          `SUCCESS: Node.js set up.\n\n` +
          `========================================\n` +
          `STEP 3: Installing dependencies...\n` +
          `========================================\n` +
          `npm ci --prefer-offline\n` +
          `added 842 packages in 4.21s\n` +
          `SUCCESS: Packages installed.\n\n` +
          `========================================\n` +
          `STEP 4: Linting code quality...\n` +
          `========================================\n` +
          `npm run lint\n` +
          `All files passed styling rules.\n` +
          `SUCCESS: Lint checks completed.\n\n` +
          `========================================\n` +
          `STEP 5: Running Unit & Integration Tests...\n` +
          `========================================\n` +
          `npm run test\n` +
          `> jest --passWithNoTests\n` +
          ` PASS  tests/auth.test.js (5.42s)\n` +
          ` PASS  tests/repository.test.js (3.81s)\n` +
          `Test Suites: 2 passed, 2 total\n` +
          `Tests:       18 passed, 18 total\n` +
          `SUCCESS: Test suites passed cleanly.\n\n` +
          `========================================\n` +
          `STEP 6: Building Production Bundle...\n` +
          `========================================\n` +
          `npm run build\n` +
          `vite v5.0.0 building for production...\n` +
          `transforming...\n` +
          `✓ 142 modules transformed.\n` +
          `dist/assets/index-b482ca1.js   142.41 kB │ gzip: 42.12 kB\n` +
          `dist/index.html                1.02 kB\n` +
          `SUCCESS: Production assets compiled successfully.\n\n` +
          `========================================\n` +
          `STEP 7: Deploying to Staging & Production...\n` +
          `========================================\n` +
          `Uploading build assets to cloud bucket...\n` +
          `Syncing edge servers...\n` +
          `SUCCESS: Deployment complete. Live at https://staging-antigravity.dev\n\n` +
          `========================================\n` +
          `CI/CD WORKFLOW SUITE PASSED SUCCESSFULLY!\n` +
          `========================================`;
        activeRun.status = "success";
        await activeRun.save();
      } catch (err) {
        console.error("Workflow simulation failed:", err);
      }
    }, 3500);

    res.status(202).json({
      message: "Workflow run triggered and queued",
      run,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
