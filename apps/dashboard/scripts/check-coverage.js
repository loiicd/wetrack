#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const coveragePath = path.join(process.cwd(), 'apps', 'dashboard', 'coverage', 'coverage-final.json');

if (!fs.existsSync(coveragePath)) {
  console.error('Coverage file not found:', coveragePath);
  process.exit(1);
}

let raw = fs.readFileSync(coveragePath, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('Failed to parse coverage file:', err);
  process.exit(1);
}

let totalStatements = 0, coveredStatements = 0;
let totalFunctions = 0, coveredFunctions = 0;
let totalBranches = 0, coveredBranches = 0;

for (const key of Object.keys(data)) {
  const file = data[key];
  const s = file.s || {};
  const f = file.f || {};
  const b = file.b || {};

  totalStatements += Object.keys(s).length;
  coveredStatements += Object.values(s).filter(v => v > 0).length;

  totalFunctions += Object.keys(f).length;
  coveredFunctions += Object.values(f).filter(v => v > 0).length;

  for (const arr of Object.values(b)) {
    if (!Array.isArray(arr)) continue;
    totalBranches += arr.length;
    coveredBranches += arr.filter(v => v > 0).length;
  }
}

const pct = (covered, total) => total === 0 ? 100 : (covered / total) * 100;

const statementsPct = pct(coveredStatements, totalStatements);
const functionsPct = pct(coveredFunctions, totalFunctions);
const branchesPct = pct(coveredBranches, totalBranches);

const thresholds = {
  statements: 98,
  functions: 98,
  branches: 90
};

console.log('Coverage summary:');
console.log(`Statements: ${coveredStatements}/${totalStatements} (${statementsPct.toFixed(2)}%)`);
console.log(`Functions: ${coveredFunctions}/${totalFunctions} (${functionsPct.toFixed(2)}%)`);
console.log(`Branches: ${coveredBranches}/${totalBranches} (${branchesPct.toFixed(2)}%)`);

let failed = false;
if (statementsPct < thresholds.statements) {
  console.error(`Statements coverage ${statementsPct.toFixed(2)}% < ${thresholds.statements}%`);
  failed = true;
}
if (functionsPct < thresholds.functions) {
  console.error(`Functions coverage ${functionsPct.toFixed(2)}% < ${thresholds.functions}%`);
  failed = true;
}
if (branchesPct < thresholds.branches) {
  console.error(`Branches coverage ${branchesPct.toFixed(2)}% < ${thresholds.branches}%`);
  failed = true;
}

if (failed) {
  console.error('Coverage thresholds not met.');
  process.exit(1);
} else {
  console.log('Coverage thresholds met.');
  process.exit(0);
}
