import express from 'express';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { config, discoverCategories, SRC_DIR } from './config.ts';

const PORT = config.notesServer.port;
const TEMPLATES_DIR = path.join(import.meta.dirname, 'templates');
const PAGE_TEMPLATE = fs.readFileSync(path.join(TEMPLATES_DIR, 'page.html'), 'utf-8');

interface NoteEntry { name: string; relativePath: string }
interface Category { label: string; prefix: string; entries: NoteEntry[] }

function scanNotes(): { categories: Category[]; rootFiles: NoteEntry[] } {
  const categories: Category[] = [];
  const rootFiles: NoteEntry[] = [];
  const cats = discoverCategories();

  for (const { prefix, folder, label } of cats) {
    const catDir = path.join(SRC_DIR, folder);
    if (!fs.existsSync(catDir)) continue;
    const entries: NoteEntry[] = [];
    const subDirs = fs.readdirSync(catDir, { withFileTypes: true });

    for (const sub of subDirs) {
      if (!sub.isDirectory() || sub.name.startsWith('.')) continue;
      const mdFiles = findMarkdownFiles(path.join(catDir, sub.name));
      if (mdFiles.length === 0) continue;
      entries.push({ name: sub.name, relativePath: mdFiles[0] });
    }

    if (entries.length > 0) {
      entries.sort((a, b) => a.name.localeCompare(b.name));
      categories.push({ label, prefix, entries });
    }
  }

  try {
    const srcItems = fs.readdirSync(SRC_DIR, { withFileTypes: true });
    for (const item of srcItems) {
      if (item.isFile() && item.name.endsWith('.md')) {
        rootFiles.push({ name: item.name.replace('.md', ''), relativePath: item.name });
      }
    }
  } catch { /* ignore */ }

  return { categories, rootFiles };
}

function findMarkdownFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.relative(SRC_DIR, path.join(dir, f)));
  } catch { return []; }
}

function renderMarkdown(relativePath: string): string {
  const fullPath = path.join(SRC_DIR, relativePath);
  if (!fs.existsSync(fullPath)) return '<p>Note not found.</p>';
  return marked.parse(fs.readFileSync(fullPath, 'utf-8')) as string;
}

function buildPage(sidebarHtml: string, contentHtml: string, activeNote: string): string {
  const title = activeNote ? `DSA Notes — ${activeNote}` : 'DSA Notes';
  const replacements: Record<string, string> = { '{{TITLE}}': title, '{{SIDEBAR}}': sidebarHtml, '{{CONTENT}}': contentHtml };
  return PAGE_TEMPLATE.replace(/\{\{TITLE\}\}|\{\{SIDEBAR\}\}|\{\{CONTENT\}\}/g, (m) => replacements[m]);
}

function buildSidebar(categories: Category[], rootFiles: NoteEntry[], activeNote: string): string {
  let html = '';
  if (rootFiles.length > 0) {
    const hasActive = rootFiles.some(f => f.relativePath === activeNote);
    const cls = hasActive ? '' : ' collapsed';
    html += `<div class="category"><div class="category-header${cls}"><span class="chevron">▼</span> 📄 Root Notes <span class="count">${rootFiles.length}</span></div><ul class="category-list${cls}">`;
    for (const f of rootFiles) {
      const act = f.relativePath === activeNote ? ' active' : '';
      html += `<li><a class="note-link${act}" href="/view?path=${encodeURIComponent(f.relativePath)}">${escapeHtml(f.name)}</a></li>`;
    }
    html += '</ul></div>';
  }
  for (const cat of categories) {
    const hasActive = cat.entries.some(e => e.relativePath === activeNote);
    const cls = hasActive ? '' : ' collapsed';
    html += `<div class="category"><div class="category-header${cls}"><span class="chevron">▼</span> ${cat.label} <span class="count">${cat.entries.length}</span></div><ul class="category-list${cls}">`;
    for (const entry of cat.entries) {
      const act = entry.relativePath === activeNote ? ' active' : '';
      html += `<li><a class="note-link${act}" href="/view?path=${encodeURIComponent(entry.relativePath)}">${escapeHtml(entry.name)}</a></li>`;
    }
    html += '</ul></div>';
  }
  return html;
}

function buildWelcome(categories: Category[], rootFiles: NoteEntry[]): string {
  const totalNotes = categories.reduce((sum, c) => sum + c.entries.length, 0) + rootFiles.length;
  const totalCats = categories.length + (rootFiles.length > 0 ? 1 : 0);
  let statsHtml = `<div class="stat-card"><div class="number">${totalNotes}</div><div class="label">Total Notes</div></div>`;
  statsHtml += `<div class="stat-card"><div class="number">${totalCats}</div><div class="label">Categories</div></div>`;
  for (const cat of categories) {
    statsHtml += `<div class="stat-card"><div class="number">${cat.entries.length}</div><div class="label">${cat.label}</div></div>`;
  }

  let readmeHtml = '';
  const readmePath = path.join(import.meta.dirname, '..', 'README.md');
  if (fs.existsSync(readmePath)) {
    readmeHtml = marked.parse(fs.readFileSync(readmePath, 'utf-8')) as string;
    readmeHtml = readmeHtml.replace(/href="\.\/src\/([^"]+\.md)"/g, (_m, fp) => `href="/view?path=${encodeURIComponent(fp)}"`);
  }

  return `<div class="welcome"><h2>Welcome to your DSA Notes</h2><p>Browse your notes from the sidebar.</p><div class="stats">${statsHtml}</div></div>${readmeHtml ? `<div class="readme-section markdown-body" style="border-top:1px solid var(--border);margin-top:32px;padding-top:32px">${readmeHtml}</div>` : ''}`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const app = express();
app.use('/assets', express.static(path.join(import.meta.dirname, '..', 'assets')));
app.use('/templates', express.static(TEMPLATES_DIR));

app.get('/', (_req, res) => {
  const { categories, rootFiles } = scanNotes();
  res.send(buildPage(buildSidebar(categories, rootFiles, ''), buildWelcome(categories, rootFiles), ''));
});

app.get('/view', (req, res) => {
  const notePath = req.query.path as string;
  if (!notePath) { res.redirect('/'); return; }
  const resolved = path.resolve(SRC_DIR, notePath);
  if (!resolved.startsWith(SRC_DIR)) { res.status(403).send('Forbidden'); return; }
  const { categories, rootFiles } = scanNotes();
  res.send(buildPage(buildSidebar(categories, rootFiles, notePath), renderMarkdown(notePath), path.basename(notePath, '.md')));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   📚 DSA Notes Server is running!        ║');
  console.log(`  ║   Local:  http://localhost:${PORT}          ║`);
  console.log('  ║   Press Ctrl+C to stop                   ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
