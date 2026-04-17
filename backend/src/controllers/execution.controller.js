const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const executeCode = async (language, code, input = '') => {
  const requestId = uuidv4();
  const tempDir = path.join(__dirname, '../../temp');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  return new Promise((resolve, reject) => {
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
        args = ['--max-old-space-size=256', path.join(tempDir, fileName)];
        break;
      case 'java':
        fileName = 'Main.java';
        const requestDir = path.join(tempDir, requestId);
        if (!fs.existsSync(requestDir)) fs.mkdirSync(requestDir);
        const javaPath = path.join(requestDir, fileName);
        fs.writeFileSync(javaPath, code);

        const compiler = spawn('javac', [javaPath]);
        let compileError = '';
        compiler.stderr.on('data', (data) => compileError += data.toString());
        compiler.on('close', (code) => {
          if (code !== 0) {
            try { fs.rmSync(requestDir, { recursive: true, force: true }); } catch(e) {}
            return resolve({ output: '', error: `Compilation Error:\n${compileError}`, exitCode: code });
          }
          
          const process = spawn('java', ['-cp', requestDir, 'Main']);
          handleProcessInternal(process, input, (res) => {
             try { fs.rmSync(requestDir, { recursive: true, force: true }); } catch(e) {}
             resolve(res);
          });
        });
        return;

      default:
        return resolve({ error: `Language ${language} not supported yet.` });
    }

    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    const process = spawn(command, args);
    handleProcessInternal(process, input, (res) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      resolve(res);
    });
  });
};

function handleProcessInternal(process, input, callback) {
  let output = '';
  let errorOutput = '';

  if (input) {
    process.stdin.write(input);
    process.stdin.end();
  }

  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  const timeout = setTimeout(() => {
    try {
      process.kill();
      callback({ error: "Execution timed out (10s limit exceeded)." });
    } catch (e) {}
  }, 10000);

  process.on('close', (code) => {
    clearTimeout(timeout);
    callback({
      output: output.trim(),
      error: errorOutput,
      exitCode: code
    });
  });
}

exports.executeCode = executeCode;

exports.runCode = async (req, res) => {
  try {
    const { language, code, input } = req.body;
    const result = await executeCode(language, code, input || '');
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
