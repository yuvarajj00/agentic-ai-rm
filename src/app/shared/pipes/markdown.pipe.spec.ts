import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownPipe } from './markdown.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;
  let mockSanitizer: DomSanitizer;

  beforeEach(() => {
    mockSanitizer = {
      bypassSecurityTrustHtml: (val: string) => val
    } as unknown as DomSanitizer;

    pipe = new MarkdownPipe(mockSanitizer);
  });

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should format headings and bold text', () => {
    const md = '### Core Concept\nThis is **very important** in ML.';
    const result = pipe.transform(md) as string;

    expect(result).toContain('<h3');
    expect(result).toContain('Core Concept</h3>');
    expect(result).toContain('<strong>very important</strong>');
    expect(result).toContain('chatgpt-markdown');
  });

  it('should format inline code properly without weird breaks', () => {
    const md = 'In Python, `str`, `int`, and `float` are types.';
    const result = pipe.transform(md) as string;

    expect(result).toContain('<code>str</code>');
    expect(result).toContain('<code>int</code>');
    expect(result).toContain('<code>float</code>');
  });

  it('should format code blocks into Minn.AI-style code box with copy button', () => {
    const md = `\`\`\`python
raw_input = '42.5'
# Convert to float
parsed_float = float(raw_input)
print(f"Result: {parsed_float}")
\`\`\``;
    const result = pipe.transform(md) as string;

    expect(result).toContain('chatgpt-code-box');
    expect(result).toContain('chatgpt-code-header');
    expect(result).toContain('chatgpt-code-copy-btn');
    expect(result).toContain('chatgpt-code-pre');
    expect(result).toContain('language-python');
    // Verify syntax highlighting tokens
    expect(result).toContain('tok-str'); // string
    expect(result).toContain('tok-comm'); // comment
    expect(result).toContain('tok-builtin'); // float, print
  });

  it('should highlight numeric lists and keywords without token corruption or class leaking', () => {
    const md = `\`\`\`python
y_true = [1, 0, 1, 1]
class ModelTrainer:
    def __init__(self):
        self.count = 42
\`\`\``;
    const result = pipe.transform(md) as string;

    // Verify numbers are highlighted properly
    expect(result).toContain('<span class="tok-num">1</span>');
    expect(result).toContain('<span class="tok-num">0</span>');
    expect(result).toContain('<span class="tok-num">42</span>');
    // Verify keyword class is highlighted properly
    expect(result).toContain('<span class="tok-keyword">class</span>');
    // Must NOT contain leaked or malformed class attributes
    expect(result).not.toContain('[class="tok-num">');
    expect(result).not.toContain('<span <span');
  });

  it('should format ordered and unordered lists', () => {
    const md = `### Key Takeaways
1. First rule of casting
2. Second rule of truncation

### Common Bugs
- ❌ int('3.14') raises error
- ❌ float conversion edge case`;

    const result = pipe.transform(md) as string;
    expect(result).toContain('<ol>');
    expect(result).toContain('<li>First rule of casting</li>');
    expect(result).toContain('<ul>');
    expect(result).toContain('int(&#39;3.14&#39;) raises error');
  });
});
