import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Production Build - GitHub Pages Compatibility', () => {
  const distPath = path.resolve(__dirname, '../dist');
  const indexPath = path.join(distPath, 'index.html');

  it('should have generated the dist/index.html file', () => {
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  it('should use relative or correct absolute paths for assets', () => {
    const content = fs.readFileSync(indexPath, 'utf-8');
    
    // Check for the known subpath or relative paths
    // If base is /baseball-balatro/, paths should start with it
    const scriptSrcMatch = content.match(/src="([^"]+)"/);
    const linkHrefMatch = content.match(/href="([^"]+)"/);

    if (scriptSrcMatch) {
      const src = scriptSrcMatch[1];
      console.log('Detected script src:', src);
      // Valid paths for GitHub Pages subpath 'baseball-balatro':
      // 1. /baseball-balatro/assets/...
      // 2. assets/... (if base was './')
      const isValid = src.startsWith('/baseball-balatro/') || !src.startsWith('/');
      expect(isValid).toBe(true);
    }

    if (linkHrefMatch) {
      const href = linkHrefMatch[1];
      console.log('Detected link href:', href);
      const isValid = href.startsWith('/baseball-balatro/') || !href.startsWith('/');
      expect(isValid).toBe(true);
    }
  });

  it('should NOT have broken absolute paths (like /assets/)', () => {
    const content = fs.readFileSync(indexPath, 'utf-8');
    // Common error: Vite defaults to /assets/ which fails on GH Pages subpaths
    expect(content.includes('src="/assets/')).toBe(false);
    expect(content.includes('href="/assets/')).toBe(false);
  });
});
