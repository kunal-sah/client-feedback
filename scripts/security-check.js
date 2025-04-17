const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

function checkDependencies() {
  console.log('Checking dependencies for known vulnerabilities...');
  return runCommand('npm audit');
}

function checkEnvVariables() {
  console.log('Checking environment variables...');
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /api[_-]?key/i,
    ];

    let hasSensitiveData = false;
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(envContent)) {
        console.warn(`Warning: Possible sensitive data found in .env file matching pattern: ${pattern}`);
        hasSensitiveData = true;
      }
    });

    if (!hasSensitiveData) {
      console.log('No sensitive data patterns found in .env file');
    }
  } else {
    console.log('No .env file found');
  }
}

function checkFilePermissions() {
  console.log('Checking file permissions...');
  const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
  ];

  sensitiveFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const mode = stats.mode.toString(8);
      if (mode !== '600') {
        console.warn(`Warning: ${file} has incorrect permissions (${mode}). Should be 600`);
      }
    }
  });
}

function main() {
  console.log('Running security checks...\n');

  const checks = [
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Environment Variables', fn: checkEnvVariables },
    { name: 'File Permissions', fn: checkFilePermissions },
  ];

  let hasErrors = false;

  checks.forEach(check => {
    console.log(`\nRunning ${check.name} check...`);
    const success = check.fn();
    if (!success) {
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.error('\nSecurity checks failed! Please address the issues above.');
    process.exit(1);
  } else {
    console.log('\nAll security checks passed!');
  }
}

main(); 