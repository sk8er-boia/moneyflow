// 빌드할 때 실제로 앱에 들어간 오픈소스 패키지의 이름·버전·라이선스 전문을 모아
// licenses.json으로 내보내요. 앱의 "오픈소스 라이선스" 화면이 이 파일을 읽어요.
import fs from 'node:fs';
import path from 'node:path';

const LICENSE_FILE = /^(licen[cs]e|copying|notice)(\.(md|txt))?$/i;

export default function ossLicenses() {
  return {
    name: 'oss-licenses',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const dirs = new Set();
      for (const out of Object.values(bundle)) {
        if (out.type !== 'chunk') continue;
        for (const [id, info] of Object.entries(out.modules)) {
          if (!info.renderedLength) continue;
          const m = id.replace(/\\/g, '/').match(/^(?:\0)?(.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\//);
          if (m) dirs.add(m[1]);
        }
      }
      const seen = new Map();
      for (const dir of dirs) {
        let pj;
        try { pj = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')); } catch { continue; }
        if (!pj.name || seen.has(`${pj.name}@${pj.version}`)) continue;
        const files = fs.readdirSync(dir).filter(f => LICENSE_FILE.test(f)).sort();
        const text = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8').trim()).join('\n\n');
        const license = typeof pj.license === 'string' ? pj.license : pj.license?.type || 'UNKNOWN';
        seen.set(`${pj.name}@${pj.version}`, { name: pj.name, version: pj.version, license, text });
      }
      const list = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
      this.emitFile({ type: 'asset', fileName: 'licenses.json', source: JSON.stringify(list) });
    },
  };
}
