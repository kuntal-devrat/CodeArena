const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpDir = path.join(os.tmpdir(), 'test_py');
fs.mkdirSync(tmpDir, { recursive: true });
const pyFile = path.join(tmpDir, 'test.py');
let codeToWrite = `
class Solution:
    def twoSum(self, nums, target):
        m = {}
        for i, n in enumerate(nums):
            if target - n in m:
                return [m[target - n], i]
            m[n] = i
        return []
`;

codeToWrite += `\n\n# --- CodeArena LeetCode Test Harness ---
if __name__ == '__main__':
    import sys, json, ast, re
    raw = sys.stdin.read().strip()
    if raw:
        args = []
        if '=' in raw and not (raw.startswith('{') and raw.endswith('}')):
            parts = re.split(r',\\s*(?=[a-zA-Z_]\\w*\\s*=)|\\n+', raw)
            for p in parts:
                p = p.strip()
                if '=' in p:
                    p = p.split('=', 1)[1].strip()
                try:
                    args.append(json.loads(p))
                except Exception:
                    try:
                        args.append(ast.literal_eval(p))
                    except Exception:
                        args.append(p)
        else:
            lines = [l.strip() for l in raw.split('\\n') if l.strip()]
            for line in lines:
                if '=' in line and not (line.startswith('{') and line.endswith('}')):
                    line = line.split('=', 1)[1].strip()
                try:
                    args.append(json.loads(line))
                except Exception:
                    try:
                        args.append(ast.literal_eval(line))
                    except Exception:
                        args.append(line)
        fn = None
        if 'Solution' in globals():
            sol = Solution()
            methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
            if methods:
                fn = getattr(sol, methods[0])
        if not fn:
            callables = [f for f in globals().values() if callable(f) and not getattr(f, '__name__', '').startswith('_')]
            if callables:
                fn = callables[-1]
        if fn:
            res = fn(*args)
            if res is not None:
                if isinstance(res, bool):
                    print("true" if res else "false")
                else:
                    print(json.dumps(res, separators=(',', ':')))
`;

fs.writeFileSync(pyFile, codeToWrite);


const start = Date.now();
const child = execFile('python', ['-u', pyFile], { cwd: tmpDir, timeout: 3000 }, (err, stdout, stderr) => {
  console.log('DONE in', Date.now() - start, 'ms');
  console.log('STDOUT:', stdout);
  console.log('STDERR:', stderr);
  console.log('ERR:', err);
});

child.stdin.write('[2,7,11,15]\n9');
child.stdin.end();
