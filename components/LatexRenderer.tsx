
import React from 'react';
import KatexModule from 'react-katex';

// Not: KaTeX CSS dosyası index.html içinde CDN üzerinden yüklendiği için buradan import edilmesine gerek yoktur.
// Browser ESM ortamında .css importu hataya yol açabilir.

interface LatexRendererProps {
  text: string;
  className?: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ text, className = "" }) => {
  if (!text) return null;

  // react-katex paketi bazen default export olarak bir obje, bazen de doğrudan bileşeni dönebilir.
  const InlineMath = (KatexModule as any).InlineMath || KatexModule;

  // Split text by LaTeX delimiters ($ and $$), preserving the delimiters in the output array.
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

  return (
    <div className={`inline-block align-middle ${className}`}>
      {parts.map((part, index) => {
        // Check for math segments
        const isDisplayMath = part.startsWith('$$') && part.endsWith('$$');
        const isInlineMath = part.startsWith('$') && part.endsWith('$');
        
        if (isDisplayMath || isInlineMath) {
          const content = isDisplayMath ? part.slice(2, -2) : part.slice(1, -1);
          return <InlineMath key={index} math={content.trim()} />;
        }
        
        // Handle potential <br/> tags in the text strings
        if (part.includes('<br/>')) {
          return part.split('<br/>').map((sub, i, arr) => (
            <React.Fragment key={`${index}-${i}`}>
              {sub}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ));
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export default LatexRenderer;
