import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../.github/workflows/personal-experience-qa.yml", import.meta.url), "utf8");
const profile = readFileSync(new URL("./personal-experience-qa-profile.mjs", import.meta.url), "utf8");
const browserAudit = readFileSync(new URL("./personal-experience-qa.mjs", import.meta.url), "utf8");
const aiReview = readFileSync(new URL("./ai-visual-review.mjs", import.meta.url), "utf8");

test("workflow has a manual opt-in audit and a separate lightweight QA tool test job", () => {
  assert.ok(workflow.includes("run_personal_experience_qa:"));
  assert.ok(workflow.includes("qa-tool-tests:"));
  assert.ok(workflow.includes("personal-experience-audit:"));
  assert.ok(workflow.includes("github.event_name == 'workflow_dispatch'"));
  assert.ok(workflow.includes("node qa/personal-experience-qa.mjs"));
  assert.ok(workflow.includes("personal-experience-qa-evidence"));
});

test("browser audit is bound to the published Declaraci-n URL and read-only requests", () => {
  assert.ok(profile.includes('https://jasbh121101.github.io/Declaraci-n/'));
  assert.ok(browserAudit.includes('PERSONAL_EXPERIENCE_PROFILE.defaultUrl'));
  assert.ok(browserAudit.includes('request.method().toUpperCase()'));
  assert.ok(browserAudit.includes('blockedWrites'));
  assert.ok(browserAudit.includes('fullPage: true'));
});

test("AI review uses only the dedicated experience profile and produces the scorecard", () => {
  assert.ok(aiReview.includes('QA_PROFILE'));
  assert.ok(aiReview.includes('personal-experience'));
  assert.ok(aiReview.includes('calculateExperienceScores'));
  assert.ok(aiReview.includes('experience-qa-evaluation.md'));
  assert.ok(profile.includes('expectedAiReviews'));
  assert.ok(profile.includes('expectedAxeScans'));
});
