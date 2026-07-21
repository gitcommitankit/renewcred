import katex from 'katex';
import 'katex/dist/katex.min.css';
import './tiptap-renderer.css';
import type { TiptapDocument } from '@/types';

// Mark renderer
function renderMark(
  mark: { type: string; attrs?: Record<string, unknown> },
  text: string,
  key: number
): React.ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong key={key}>{text}</strong>;
    case 'italic':
      return <em key={key}>{text}</em>;
    case 'strike':
      return <s key={key}>{text}</s>;
    case 'code':
      return (
        <code key={key} className="rc-inline-code">
          {text}
        </code>
      );
    case 'highlight':
      return (
        <mark key={key} className="rc-highlight">
          {text}
        </mark>
      );
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
    default:
      return <span key={key}>{text}</span>;
  }
}

// Math node
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

// Node renderer
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
      // Apply marks - outermost mark wraps inner text
      return (
        <>
          {node.marks.reduce<React.ReactNode>(
            (acc, mark, i) =>
              renderMark(mark, '', i) === null ? acc : <>{renderMark(mark, text, i)}</>,
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
      return (
        <ol className="rc-ol" start={(node.attrs?.start as number) ?? 1}>
          {children}
        </ol>
      );

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
      return (
        <th
          className="rc-th"
          colSpan={(node.attrs?.colspan as number) ?? 1}
          rowSpan={(node.attrs?.rowspan as number) ?? 1}
        >
          {children}
        </th>
      );

    case 'tableCell':
      return (
        <td
          className="rc-td"
          colSpan={(node.attrs?.colspan as number) ?? 1}
          rowSpan={(node.attrs?.rowspan as number) ?? 1}
        >
          {children}
        </td>
      );

    case 'hardBreak':
      return <br />;

    case 'horizontalRule':
      return <hr className="rc-hr" />;

    // Math nodes from @tiptap/extension-mathematics
    case 'inlineMath':
    case 'mathInline': {
      const latex = (node.attrs?.latex as string) ?? node.text ?? '';
      return <MathNode latex={latex} displayMode={false} />;
    }

    case 'blockMath':
    case 'mathDisplay':
    case 'mathBlock': {
      const latex = (node.attrs?.latex as string) ?? node.text ?? '';
      return <MathNode latex={latex} displayMode={true} />;
    }

    default:
      return <>{children}</>;
  }
}

interface TiptapRendererProps {
  content: TiptapDocument | null | undefined;
  className?: string;
}

export default function TiptapRenderer({ content, className = '' }: TiptapRendererProps) {
  if (!content) return null;

  return (
    <div className={`rc-prose ${className}`}>
      <RenderNode node={content as unknown as RawNode} />
    </div>
  );
}
