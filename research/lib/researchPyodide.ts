export type ResearchPythonOutput = { type: 'text'; value: string } | { type: 'plot'; value: string } | { type: 'file'; name: string; dataUrl: string };
export type ResearchPythonFile = { name: string; content: Uint8Array };

type PyodideRuntime = {
  loadPackagesFromImports: (code: string) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (message: string) => void }) => void;
  FS: {
    writeFile: (path: string, content: Uint8Array) => void;
    readFile: (path: string) => Uint8Array;
  };
};

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideRuntime>;
  }
}

const pyodideVersion = 'v314.0.7';
const pyodideBaseUrl = `https://cdn.jsdelivr.net/pyodide/${pyodideVersion}/full/`;
let runtimePromise: Promise<PyodideRuntime> | undefined;
let runQueue: Promise<void> = Promise.resolve();

function loadPyodideRuntime(): Promise<PyodideRuntime> {
  if (runtimePromise) return runtimePromise;

  const pendingRuntime = new Promise<void>((resolve, reject) => {
    if (window.loadPyodide) {
      resolve();
      return;
    }

    const existing = document.getElementById('research-pyodide-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Could not load the Python runtime.')), { once: true });
      if (window.loadPyodide) resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'research-pyodide-script';
    script.src = `${pyodideBaseUrl}pyodide.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the Python runtime.'));
    document.head.appendChild(script);
  }).then(async () => {
    if (!window.loadPyodide) throw new Error('The Python runtime did not initialize.');
    return window.loadPyodide({ indexURL: pyodideBaseUrl });
  });
  runtimePromise = pendingRuntime.catch((error: unknown) => {
    runtimePromise = undefined;
    document.getElementById('research-pyodide-script')?.remove();
    throw error;
  });

  return runtimePromise;
}

async function execute(code: string, files: ResearchPythonFile[]): Promise<ResearchPythonOutput[]> {
  const pyodide = await loadPyodideRuntime();
  const output: ResearchPythonOutput[] = [];
  pyodide.setStdout({
    batched: (message) => {
      if (message.startsWith('__RESEARCH_PLOT__:')) {
        output.push({ type: 'plot', value: message.slice('__RESEARCH_PLOT__:'.length) });
      } else if (message.trim()) {
        output.push({ type: 'text', value: message });
      }
    },
  });

  await pyodide.loadPackagesFromImports(code);
  for (const file of files) pyodide.FS.writeFile(file.name, file.content);

  if (/\bmatplotlib\b/.test(code)) {
    await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import io, base64
def _research_capture_show(*args, **kwargs):
    for _research_number in plt.get_fignums():
        _research_buffer = io.BytesIO()
        plt.figure(_research_number).savefig(
            _research_buffer, format="png", bbox_inches="tight", dpi=140,
            transparent=True
        )
        _research_buffer.seek(0)
        print("__RESEARCH_PLOT__:" + base64.b64encode(_research_buffer.read()).decode("ascii"))
        plt.close(_research_number)
plt.show = _research_capture_show
`);
  }

  await pyodide.runPythonAsync(code);
  const savedPaths = [...code.matchAll(/\.save\(\s*["']([^"']+\.(?:png|jpe?g|csv))["']/gi)].map((match) => match[1]);
  for (const path of savedPaths) {
    try {
      const bytes = pyodide.FS.readFile(path);
      let binary = '';
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      }
      const mime = path.toLowerCase().endsWith('.png') ? 'image/png' : path.toLowerCase().endsWith('.csv') ? 'text/csv' : 'image/jpeg';
      output.push({ type: 'file', name: path.split('/').pop() || path, dataUrl: `data:${mime};base64,${btoa(binary)}` });
    } catch {
      // Only surface files that the code actually created in the current run.
    }
  }
  return output;
}

export function runResearchPython(code: string, files: ResearchPythonFile[] = []): Promise<ResearchPythonOutput[]> {
  const currentRun = runQueue.then(() => execute(code, files));
  runQueue = currentRun.then(() => undefined, () => undefined);
  return currentRun;
}
