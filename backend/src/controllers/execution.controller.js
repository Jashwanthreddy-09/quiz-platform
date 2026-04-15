const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

exports.runCode = async (req, res) => {
  const { language, code } = req.body;
  const requestId = uuidv4();
  const tempDir = path.join(__dirname, '../../temp');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  let fileName, command, args;

  switch (language) {
    case 'python':
      fileName = `script_${requestId}.py`;
      command = 'python';
      args = [path.join(tempDir, fileName)];
      break;
    case 'javascript':
      fileName = `script_${requestId}.js`;
      command = 'node';
      args = [path.join(tempDir, fileName)];
      break;
    default:
      return res.status(400).json({ error: `Language ${language} not supported yet.` });
  }

  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, code);

  const process = spawn(command, args);
  
  let output = '';
  let errorOutput = '';

  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  const timeout = setTimeout(() => {
    process.kill();
    res.status(408).json({ error: "Execution timed out (10s limit exceeded)." });
    cleanup();
  }, 10000);

  process.on('close', (code) => {
    clearTimeout(timeout);
    res.json({
      output,
      error: errorOutput,
      exitCode: code
    });
    cleanup();
  });

  function cleanup() {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Cleanup failed", err);
      }
    }
  }
};
