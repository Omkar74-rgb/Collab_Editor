import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const TEMP_DIR = path.join(__dirname, '../../temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const runCommand = (cmd: string, timeout = 5000): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve) => {
    exec(cmd, { timeout, cwd: TEMP_DIR }, (err, stdout, stderr) => {
      resolve({
        stdout: stdout || '',
        stderr: stderr || (err?.message || '')
      });
    });
  });
};

router.post('/', async (req: Request, res: Response) => {
  const { code, language } = req.body;
  const id = uuidv4();
  let result = { stdout: '', stderr: '', status: 'Accepted' };

  try {
    if (language === 'javascript') {
      const file = path.join(TEMP_DIR, `${id}.js`);
      fs.writeFileSync(file, code);
      const out = await runCommand(`node "${file}"`);
      result.stdout = out.stdout;
      result.stderr = out.stderr;
      if (fs.existsSync(file)) fs.unlinkSync(file);

    } else if (language === 'python') {
      const file = path.join(TEMP_DIR, `${id}.py`);
      fs.writeFileSync(file, code);
      // try python3 first, fall back to python
      let out = await runCommand(`python3 "${file}"`);
      if (out.stderr && out.stderr.includes('not recognized')) {
        out = await runCommand(`python "${file}"`);
      }
      result.stdout = out.stdout;
      result.stderr = out.stderr;
      if (fs.existsSync(file)) fs.unlinkSync(file);

    } else if (language === 'typescript') {
      const file = path.join(TEMP_DIR, `${id}.ts`);
      fs.writeFileSync(file, code);
      const out = await runCommand(`npx ts-node "${file}"`);
      result.stdout = out.stdout;
      result.stderr = out.stderr;
      if (fs.existsSync(file)) fs.unlinkSync(file);

    } else if (language === 'java') {
      const file = path.join(TEMP_DIR, `Main_${id}.java`);
      fs.writeFileSync(file, code);
      const compile = await runCommand(`javac "${file}"`);
      if (compile.stderr) {
        result.stderr = compile.stderr;
      } else {
        const run = await runCommand(`java -cp "${TEMP_DIR}" Main_${id}`);
        result.stdout = run.stdout;
        result.stderr = run.stderr;
      }
      if (fs.existsSync(file)) fs.unlinkSync(file);

    } else if (language === 'cpp') {
      const file = path.join(TEMP_DIR, `${id}.cpp`);
      const outFile = path.join(TEMP_DIR, `${id}.exe`);
      fs.writeFileSync(file, code);
      const compile = await runCommand(`g++ "${file}" -o "${outFile}"`);
      if (compile.stderr) {
        result.stderr = compile.stderr;
      } else {
        const run = await runCommand(`"${outFile}"`);
        result.stdout = run.stdout;
        result.stderr = run.stderr;
      }
      if (fs.existsSync(file)) fs.unlinkSync(file);
      if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

    } else if (language === 'go') {
      const file = path.join(TEMP_DIR, `${id}.go`);
      fs.writeFileSync(file, code);
      const out = await runCommand(`go run "${file}"`);
      result.stdout = out.stdout;
      result.stderr = out.stderr;
      if (fs.existsSync(file)) fs.unlinkSync(file);

    } else {
      result.stderr = `Language "${language}" is not supported yet.`;
    }

    if (result.stderr) result.status = 'Runtime Error';
    res.json(result);

  } catch (err: any) {
    res.status(500).json({ stdout: '', stderr: err.message, status: 'Error' });
  }
});

export default router;