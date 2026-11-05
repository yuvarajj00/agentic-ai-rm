import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked, Renderer } from 'marked';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Lightweight, safe Python & code syntax highlighter using single-pass tokenization
 */
export function highlightCode(code: string, lang: string = 'python'): string {
  if (!code) return '';
  const isPython = !lang || lang === 'python' || lang === 'py';
  if (!isPython) {
    return escapeHtml(code);
  }

  // Single-pass regex matches tokens in order of precedence:
  // 1: Comments (#...)
  // 2: Strings (triple-quoted, single/double quoted, f-strings, r-strings)
  // 3: Decorators (@...)
  // 4: Keywords (def, class, for, while, in, if, etc.)
  // 5: Constants (True, False, None)
  // 6: Builtins & Common Types (print, len, int, float, range, zip, Counter, unicodedata, etc.)
  // 7: Numbers (integers, floats, hex, scientific notation)
  const TOKEN_REGEX = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|[frbFRB]?"(?:[^"\\]|\\.)*"|[frbFRB]?'(?:[^'\\]|\\.)*')|(@[a-zA-Z_]\w*)|\b(def|class|return|if|elif|else|for|while|try|except|finally|with|as|import|from|lambda|yield|async|await|pass|break|continue|assert|in|is|not|and|or|raise|global|nonlocal)\b|\b(True|False|None)\b|\b(print|len|range|int|float|str|bool|list|dict|set|tuple|isinstance|issubclass|type|id|sum|min|max|abs|round|zip|enumerate|map|filter|all|any|open|super|self|cls|Counter|defaultdict|deque|re|unicodedata|StringIO|BytesIO|sys|os|math|time)\b|\b(0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/gm;

  let lastIndex = 0;
  let html = '';
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(code)) !== null) {
    // Output any escaped text before this token
    if (match.index > lastIndex) {
      html += escapeHtml(code.slice(lastIndex, match.index));
    }
    lastIndex = TOKEN_REGEX.lastIndex;

    const [full, comment, str, decorator, kw, constVal, builtin, num] = match;

    if (comment) {
      html += `<span class="tok-comm">${escapeHtml(comment)}</span>`;
    } else if (str) {
      html += `<span class="tok-str">${escapeHtml(str)}</span>`;
    } else if (decorator) {
      html += `<span class="tok-dec">${escapeHtml(decorator)}</span>`;
    } else if (kw) {
      html += `<span class="tok-keyword">${escapeHtml(kw)}</span>`;
    } else if (constVal) {
      html += `<span class="tok-const">${escapeHtml(constVal)}</span>`;
    } else if (builtin) {
      html += `<span class="tok-builtin">${escapeHtml(builtin)}</span>`;
    } else if (num) {
      html += `<span class="tok-num">${escapeHtml(num)}</span>`;
    }
  }

  if (lastIndex < code.length) {
    html += escapeHtml(code.slice(lastIndex));
  }

  return html;
}

// Configure custom marked renderer
const customRenderer = new Renderer();

customRenderer.code = function ({ text, lang }: { text: string; lang?: string }): string {
  const language = (lang || 'python').toLowerCase();
  const highlighted = highlightCode(text, language);

  return `
<div class="chatgpt-code-box">
  <div class="chatgpt-code-header">
    <div class="chatgpt-code-lang">
      <span class="chatgpt-lang-tag">${escapeHtml(language)}</span>
    </div>
    <button type="button" class="chatgpt-code-copy-btn" title="Copy code">
      <svg class="copy-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span class="copy-btn-text">Copy code</span>
    </button>
  </div>
  <pre class="chatgpt-code-pre"><code class="language-${escapeHtml(language)}">${highlighted}</code></pre>
</div>`;
};

// Set marked options
marked.use({
  renderer: customRenderer,
  gfm: true,
  breaks: true
});

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer: DomSanitizer;

  constructor(sanitizer?: DomSanitizer) {
    this.sanitizer = sanitizer || inject(DomSanitizer);
  }

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';

    try {
      const rawHtml = marked.parse(String(value).trim()) as string;
      const wrapped = `<div class="chatgpt-markdown">${rawHtml}</div>`;
      return this.sanitizer.bypassSecurityTrustHtml(wrapped);
    } catch (e) {
      console.error('Error parsing markdown:', e);
      return this.sanitizer.bypassSecurityTrustHtml(escapeHtml(String(value)));
    }
  }
}
