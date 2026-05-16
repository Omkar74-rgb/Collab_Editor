interface ExecutionResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: { description: string };
  time: string;
  memory: number;
}

export async function runCode(code: string, language: string): Promise<ExecutionResult> {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:5000/api/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) throw new Error(`Server error: ${response.status}`);

  const data = await response.json();

  return {
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    compile_output: '',
    status: { description: data.status || 'Accepted' },
    time: '0',
    memory: 0,
  };
}