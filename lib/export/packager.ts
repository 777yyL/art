import JSZip from 'jszip';
import { ExportData } from '@/types';

export async function createExportPackage(data: ExportData): Promise<Blob> {
  const zip = new JSZip();

  // Add markdown file
  zip.file('requirement-spec.md', data.markdown);

  // Add flowchart SVG
  if (data.flowchartSvg) {
    zip.file('flowchart.svg', data.flowchartSvg);
  }

  // Add metadata
  const metadata = {
    exportedAt: data.timestamp,
    version: '1.0.0',
    tool: 'AI Requirement Transformer (ART)',
  };
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  // Generate zip blob
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateMarkdownWithFrontmatter(
  content: string,
  title: string
): string {
  const timestamp = new Date().toISOString();
  const frontmatter = `---
title: ${title}
generated_at: ${timestamp}
generator: AI Requirement Transformer (ART)
version: 1.0.0
---

`;
  return frontmatter + content;
}

export async function svgToPng(svgElement: SVGElement): Promise<Blob> {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  // Get SVG dimensions
  const svgRect = svgElement.getBoundingClientRect();
  canvas.width = svgRect.width * 2; // High DPI
  canvas.height = svgRect.height * 2;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create PNG blob'));
        }, 'image/png');
      } else {
        reject(new Error('Canvas context not available'));
      }
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  });
}
