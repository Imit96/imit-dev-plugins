#!/usr/bin/env node
/**
 * cinematic-web — Accessibility Auditor
 * =======================================
 * Runs axe-core accessibility checks against your local or production site.
 * Outputs a detailed report with violations and how to fix them.
 *
 * Usage:
 *   node scripts/audit-accessibility.js
 *   node scripts/audit-accessibility.js --url https://yourdomain.com
 *   node scripts/audit-accessibility.js --url http://localhost:3000 --pages /,/about,/contact
 *   node scripts/audit-accessibility.js --report html  (save HTML report)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname }            from 'path';
import { fileURLToPath }            from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const args      = process.argv.slice(2);

function getArg(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const BASE_URL = getArg('url',    'http://localhost:3000');
const PAGES    = getArg('pages',  '/,/about,/contact,/pricing').split(',');
const REPORT   = getArg('report', 'console'); // console | html | json
const OUTPUT   = getArg('output', 'reports/accessibility');

console.log(`\n♿ cinematic-web Accessibility Auditor`);
console.log(`   Base URL: ${BASE_URL}`);
console.log(`   Pages:    ${PAGES.join(', ')}`);
console.log(`   Report:   ${REPORT}\n`);

async function runAudit() {
  // Check playwright + axe are installed
  let playwright, AxeBuilder;
  try {
    playwright = await import('@playwright/test');
    const axeMod = await import('@axe-core/playwright');
    AxeBuilder = axeMod.default;
  } catch {
    console.error('❌ Missing dependencies. Install them with:');
    console.error('   npm install -D @playwright/test @axe-core/playwright');
    console.error('   npx playwright install chromium');
    process.exit(1);
  }

  const { chromium } = playwright;
  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  for (const page of PAGES) {
    const url      = `${BASE_URL}${page}`;
    const context  = await browser.newContext();
    const pwPage   = await context.newPage();

    console.log(`  Scanning: ${url}...`);
    try {
      await pwPage.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      await pwPage.waitForTimeout(1500); // Let animations settle

      const results = await new AxeBuilder({ page: pwPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      const critical = results.violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      );
      const moderate = results.violations.filter(v =>
        v.impact === 'moderate' || v.impact === 'minor'
      );

      allResults.push({ page, url, violations: results.violations,
                        critical, moderate, passes: results.passes.length });

      // Console summary per page
      if (critical.length === 0 && moderate.length === 0) {
        console.log(`    ✓ No violations found (${results.passes.length} checks passed)`);
      } else {
        if (critical.length > 0) console.log(`    ✗ ${critical.length} critical/serious violations`);
        if (moderate.length > 0) console.log(`    ⚠ ${moderate.length} moderate/minor violations`);
      }

    } catch (err) {
      console.error(`    ✗ Failed to scan ${url}: ${err.message}`);
      allResults.push({ page, url, error: err.message, violations: [], critical: [], moderate: [] });
    }

    await context.close();
  }

  await browser.close();

  // ── Generate Report ─────────────────────────────────────────────
  const totalCritical = allResults.reduce((n, r) => n + r.critical.length, 0);
  const totalModerate = allResults.reduce((n, r) => n + r.moderate.length, 0);

  console.log('\n═══════════════════════════════════════════');
  console.log('  ACCESSIBILITY AUDIT SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`  Pages scanned: ${PAGES.length}`);
  console.log(`  Critical/Serious violations: ${totalCritical}`);
  console.log(`  Moderate/Minor violations:   ${totalModerate}`);

  if (totalCritical > 0) {
    console.log('\n── CRITICAL VIOLATIONS (must fix) ──────────────');
    for (const result of allResults) {
      for (const v of result.critical) {
        console.log(`\n  [${result.page}] ${v.id}`);
        console.log(`  Impact:      ${v.impact}`);
        console.log(`  Description: ${v.description}`);
        console.log(`  Help:        ${v.helpUrl}`);
        console.log(`  Elements (${v.nodes.length}):`);
        for (const node of v.nodes.slice(0, 3)) {
          console.log(`    • ${node.html?.substring(0, 100)}...`);
          if (node.failureSummary) {
            console.log(`      Fix: ${node.failureSummary.split('\n')[0]}`);
          }
        }
      }
    }
  }

  if (REPORT === 'html') {
    const html = generateHTMLReport(allResults, { totalCritical, totalModerate });
    mkdirSync(join(ROOT, OUTPUT.split('/')[0]), { recursive: true });
    const outPath = join(ROOT, `${OUTPUT}.html`);
    writeFileSync(outPath, html);
    console.log(`\n  📄 HTML report saved: ${outPath}`);
  }

  if (REPORT === 'json') {
    const outPath = join(ROOT, `${OUTPUT}.json`);
    writeFileSync(outPath, JSON.stringify(allResults, null, 2));
    console.log(`\n  📄 JSON report saved: ${outPath}`);
  }

  console.log('\n  Resources:');
  console.log('  • axe DevTools: chrome.google.com/webstore/detail/axe-devtools');
  console.log('  • WAVE: wave.webaim.org');
  console.log('  • Contrast: webaim.org/resources/contrastchecker\n');

  // Exit code for CI
  process.exit(totalCritical > 0 ? 1 : 0);
}

function generateHTMLReport(results, { totalCritical, totalModerate }) {
  const timestamp = new Date().toLocaleString();
  const pageRows  = results.map(r => `
    <tr class="${r.critical.length > 0 ? 'critical' : r.moderate.length > 0 ? 'moderate' : 'pass'}">
      <td><a href="${r.url}">${r.page}</a></td>
      <td>${r.critical.length > 0 ? `<span class="badge critical">${r.critical.length} critical</span>` : '—'}</td>
      <td>${r.moderate.length > 0 ? `<span class="badge moderate">${r.moderate.length} moderate</span>` : '—'}</td>
      <td>${r.passes ?? 0}</td>
    </tr>
  `).join('');

  const violationDetails = results.flatMap(r =>
    r.violations.map(v => `
      <div class="violation ${v.impact}">
        <div class="violation-header">
          <span class="impact-badge ${v.impact}">${v.impact}</span>
          <strong>${v.id}</strong>
          <span class="page-label">${r.page}</span>
        </div>
        <p>${v.description}</p>
        <a href="${v.helpUrl}" target="_blank" rel="noopener">How to fix ↗</a>
        <details>
          <summary>Affected elements (${v.nodes.length})</summary>
          ${v.nodes.slice(0, 5).map(n =>
            `<pre><code>${n.html?.replace(/</g, '&lt;').substring(0, 200)}</code></pre>`
          ).join('')}
        </details>
      </div>
    `)
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Accessibility Report — cinematic-web</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; color: #111; }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .meta { color: #666; font-size: 0.875rem; margin-bottom: 2rem; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 2rem; }
    .stat { background: white; border-radius: 8px; padding: 20px; border-left: 4px solid #ddd; }
    .stat.critical-stat { border-color: #ef4444; }
    .stat.moderate-stat { border-color: #f59e0b; }
    .stat.pass-stat     { border-color: #22c55e; }
    .stat-num  { font-size: 2rem; font-weight: 700; }
    .stat-label{ font-size: 0.875rem; color: #666; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 2rem; }
    th { background: #f8f9fa; padding: 12px 16px; text-align: left; font-size: 0.875rem; }
    td { padding: 12px 16px; border-top: 1px solid #eee; font-size: 0.875rem; }
    tr.critical td:first-child { border-left: 3px solid #ef4444; }
    tr.moderate td:first-child { border-left: 3px solid #f59e0b; }
    tr.pass     td:first-child { border-left: 3px solid #22c55e; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .badge.critical { background: #fef2f2; color: #ef4444; }
    .badge.moderate { background: #fffbeb; color: #d97706; }
    .violation { background: white; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #ddd; }
    .violation.critical { border-color: #ef4444; }
    .violation.serious  { border-color: #f97316; }
    .violation.moderate { border-color: #f59e0b; }
    .violation.minor    { border-color: #6b7280; }
    .violation-header   { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .impact-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .impact-badge.critical { background: #fef2f2; color: #ef4444; }
    .impact-badge.serious  { background: #fff7ed; color: #ea580c; }
    .impact-badge.moderate { background: #fffbeb; color: #d97706; }
    .impact-badge.minor    { background: #f9fafb; color: #6b7280; }
    .page-label { font-size: 0.75rem; color: #999; margin-left: auto; }
    pre { background: #f8f9fa; padding: 8px; border-radius: 4px; overflow: auto; font-size: 0.8rem; }
    a { color: #6366f1; }
    h2 { margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>♿ Accessibility Audit Report</h1>
    <p class="meta">Generated: ${timestamp} · Base URL: ${results[0]?.url?.split('/').slice(0,3).join('/') ?? ''}</p>
    <div class="summary">
      <div class="stat critical-stat">
        <div class="stat-num">${totalCritical}</div>
        <div class="stat-label">Critical / Serious</div>
      </div>
      <div class="stat moderate-stat">
        <div class="stat-num">${totalModerate}</div>
        <div class="stat-label">Moderate / Minor</div>
      </div>
      <div class="stat pass-stat">
        <div class="stat-num">${results.reduce((n,r) => n + (r.passes ?? 0), 0)}</div>
        <div class="stat-label">Checks Passed</div>
      </div>
    </div>
    <h2>Pages Scanned</h2>
    <table>
      <thead><tr><th>Page</th><th>Critical</th><th>Moderate</th><th>Passing</th></tr></thead>
      <tbody>${pageRows}</tbody>
    </table>
    ${violationDetails ? `<h2>Violations</h2>${violationDetails}` : '<p>✅ No violations found!</p>'}
  </div>
</body>
</html>`;
}

runAudit().catch(err => {
  console.error('Audit failed:', err.message);
  process.exit(1);
});
