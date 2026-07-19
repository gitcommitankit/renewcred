'use client';

import { useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { TiptapDocument } from '@/types';

/* ──────────────── Mark renderer ──────────────── */

function renderMark(
  mark: { type: string; attrs?: Record<string, unknown> },
  text: string,
  key: number
): React.ReactNode {
  switch (mark.type) {
    case 'bold': return <strong key={key}>{text}</strong>;
    case 'italic': return <em key={key}>{text}</em>;
    case 'strike': return <s key={key}>{text}</s>;
    case 'code': return <code key={key} className="rc-inline-code">{text}</code>;
    case 'highlight': return <mark key={key} className="rc-highlight">{text}</mark>;
    case 'link':
      return (
        <a
          key={key}
          href={mark.attrs?.href as string}
          target={(mark.attrs?.target as string) ?? '_blank'}
          rel="noopener noreferrer"
          className="rc-link"
        >
          {text}
        </a>
      );
    default: return <span key={key}>{text}</span>;
  }
}

/* ──────────────── Math node ──────────────── */

function MathNode({ latex, displayMode }: { latex: string; displayMode: boolean }) {
  let html = '';
  try {
    html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
  } catch {
    html = latex;
  }

  if (displayMode) {
    return (
      <div
        className="rc-math-block"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: safe — produced by KaTeX
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className="rc-math-inline"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: safe — produced by KaTeX
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ──────────────── Node renderer ──────────────── */

type RawNode = {
  type: string;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: RawNode[];
  attrs?: Record<string, unknown>;
};

function RenderNode({ node }: { node: RawNode }) {
  const children = node.content?.map((child, i) => <RenderNode key={i} node={child} />) ?? null;

  switch (node.type) {
    case 'doc':
      return <>{children}</>;

    case 'text': {
      const text = node.text ?? '';
      if (!node.marks || node.marks.length === 0) return <>{text}</>;
      // Apply marks — outermost mark wraps inner text
      return (
        <>
          {node.marks.reduce<React.ReactNode>(
            (acc, mark, i) => renderMark(mark, '', i) === null ? acc : <>{renderMark(mark, text, i)}</>,
            text
          )}
        </>
      );
    }

    case 'paragraph':
      return <p className="rc-p">{children ?? <br />}</p>;

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2;
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <Tag className={`rc-h${level}`}>{children}</Tag>;
    }

    case 'bulletList':
      return <ul className="rc-ul">{children}</ul>;

    case 'orderedList':
      return <ol className="rc-ol" start={(node.attrs?.start as number) ?? 1}>{children}</ol>;

    case 'listItem':
      return <li className="rc-li">{children}</li>;

    case 'blockquote':
      return <blockquote className="rc-blockquote">{children}</blockquote>;

    case 'codeBlock':
      return (
        <pre className="rc-pre">
          <code className="rc-code" data-language={(node.attrs?.language as string) ?? ''}>
            {children}
          </code>
        </pre>
      );

    case 'table':
      return (
        <div className="rc-table-wrapper">
          <table className="rc-table">
            <tbody>{children}</tbody>
          </table>
        </div>
      );

    case 'tableRow':
      return <tr>{children}</tr>;

    case 'tableHeader':
      return <th className="rc-th" colSpan={(node.attrs?.colspan as number) ?? 1} rowSpan={(node.attrs?.rowspan as number) ?? 1}>{children}</th>;

    case 'tableCell':
      return <td className="rc-td" colSpan={(node.attrs?.colspan as number) ?? 1} rowSpan={(node.attrs?.rowspan as number) ?? 1}>{children}</td>;

    case 'hardBreak':
      return <br />;

    case 'horizontalRule':
      return <hr className="rc-hr" />;

    /* ── Math nodes from @tiptap/extension-mathematics ── */
    case 'inlineMath':
    case 'mathInline': {
      const latex = (node.attrs?.latex as string) ?? (node.text ?? '');
      return <MathNode latex={latex} displayMode={false} />;
    }

    case 'blockMath':
    case 'mathDisplay':
    case 'mathBlock': {
      const latex = (node.attrs?.latex as string) ?? (node.text ?? '');
      return <MathNode latex={latex} displayMode={true} />;
    }

    default:
      return <>{children}</>;
  }
}

/* ──────────────── Main component ──────────────── */

interface TiptapRendererProps {
  content: TiptapDocument | null | undefined;
  className?: string;
}

export default function TiptapRenderer({ content, className = '' }: TiptapRendererProps) {
  useEffect(() => {
    const id = 'rc-prose-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .rc-prose { font-size: 1rem; line-height: 1.75; color: #1a1a1a; }
      .rc-prose .rc-p { margin-bottom: 1.25em; }
      .rc-prose .rc-h1 { font-size: 1.875rem; font-weight: 700; margin: 2em 0 0.75em; line-height: 1.25; }
      .rc-prose .rc-h2 { font-size: 1.5rem; font-weight: 700; margin: 1.75em 0 0.65em; line-height: 1.3; }
      .rc-prose .rc-h3 { font-size: 1.25rem; font-weight: 600; margin: 1.5em 0 0.5em; line-height: 1.35; }
      .rc-prose .rc-h4 { font-size: 1.1rem; font-weight: 600; margin: 1.25em 0 0.4em; line-height: 1.4; }
      .rc-prose .rc-ul { list-style-type: disc; padding-left: 1.75em; margin-bottom: 1.25em; }
      .rc-prose .rc-ol { list-style-type: decimal; padding-left: 1.75em; margin-bottom: 1.25em; }
      .rc-prose .rc-li { margin-bottom: 0.35em; }
      .rc-prose .rc-blockquote { border-left: 4px solid #e03b2f; margin: 1.5em 0; padding: 0.75em 1.25em; background: #f7f5f3; border-radius: 0 6px 6px 0; font-style: italic; color: #555; }
      .rc-prose .rc-pre { background: #1a1a1a; color: #f7f5f3; padding: 1.25em; border-radius: 8px; overflow-x: auto; margin-bottom: 1.25em; }
      .rc-prose .rc-code { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.875em; }
      .rc-prose .rc-inline-code { background: #f7f5f3; border: 1px solid #edeae6; color: #e03b2f; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.85em; padding: 0.15em 0.4em; border-radius: 4px; }
      .rc-prose .rc-highlight { background: #fef08a; padding: 0.1em 0.2em; border-radius: 2px; }
      .rc-prose .rc-link { color: #e03b2f; text-decoration: underline; text-underline-offset: 2px; }
      .rc-prose .rc-link:hover { color: #b82e24; }
      .rc-prose .rc-hr { border: none; border-top: 1px solid #edeae6; margin: 2em 0; }
      .rc-prose .rc-table-wrapper { overflow-x: auto; margin-bottom: 1.5em; }
      .rc-prose .rc-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
      .rc-prose .rc-th, .rc-prose .rc-td { border: 1px solid #edeae6; padding: 0.65em 1em; text-align: left; }
      .rc-prose .rc-th { background: #f7f5f3; font-weight: 600; }
      .rc-prose .rc-td { background: #fff; }
      .rc-prose .rc-math-block { margin: 1.5em 0; overflow-x: auto; text-align: center; }
      .rc-prose .rc-math-inline { display: inline; }
    `;
    document.head.appendChild(style);
  }, []);

  if (!content) return null;

  return (
    <div className={`rc-prose ${className}`}>
      <RenderNode node={content as unknown as RawNode} />
    </div>
  );
}
