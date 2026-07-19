'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Table as TableIcon,
  Undo,
  Redo,
  Quote,
  Minus,
} from 'lucide-react';
import type { TiptapDocument } from '../../types';

interface TiptapEditorProps {
  content: TiptapDocument | null;
  onChange: (content: TiptapDocument) => void;
  placeholder?: string;
  editable?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'flex items-center justify-center w-8 h-8 rounded-md text-sm transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        isActive
          ? 'bg-brand-red text-white'
          : 'text-[#555] hover:bg-warm-gray-100 hover:text-charcoal-900',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-warm-gray-200 mx-1" />;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing…',
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
      Highlight,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || undefined,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapDocument);
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col border border-warm-gray-300 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-warm-gray-200 bg-[#fafaf9]">
          {/* Undo / Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={14} />
          </ToolbarButton>

          <Divider />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={14} />
          </ToolbarButton>

          <Divider />

          {/* Marks */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <span className="text-xs font-bold">H</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline code"
          >
            <Code size={14} />
          </ToolbarButton>

          <Divider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet list"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered list"
          >
            <ListOrdered size={14} />
          </ToolbarButton>

          <Divider />

          {/* Block */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            title="Insert table"
          >
            <TableIcon size={14} />
          </ToolbarButton>
        </div>
      )}

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="tiptap-editor min-h-75 px-5 py-4 text-sm text-charcoal-900 focus-within:outline-none"
      />

      {/* Tiptap editor global styles injected here */}
      <style>{`
        .tiptap-editor .ProseMirror {
          outline: none;
          min-height: 300px;
        }
        .tiptap-editor .ProseMirror p { margin-bottom: 0.75rem; }
        .tiptap-editor .ProseMirror h1 { font-size: 1.75rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
        .tiptap-editor .ProseMirror h2 { font-size: 1.375rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .tiptap-editor .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 0.875rem 0 0.375rem; }
        .tiptap-editor .ProseMirror ul { list-style: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .tiptap-editor .ProseMirror ol { list-style: decimal; padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .tiptap-editor .ProseMirror li { margin-bottom: 0.2rem; }
        .tiptap-editor .ProseMirror blockquote {
          border-left: 3px solid #e03b2f;
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: #555;
          font-style: italic;
        }
        .tiptap-editor .ProseMirror code {
          background: #f7f5f3;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85em;
        }
        .tiptap-editor .ProseMirror pre {
          background: #1a1a1a;
          color: #f8f8f2;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 0.75rem;
        }
        .tiptap-editor .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.75rem;
        }
        .tiptap-editor .ProseMirror td,
        .tiptap-editor .ProseMirror th {
          border: 1px solid #d8d3cc;
          padding: 0.4rem 0.6rem;
          min-width: 60px;
        }
        .tiptap-editor .ProseMirror th {
          background: #f7f5f3;
          font-weight: 600;
        }
        .tiptap-editor .ProseMirror .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9a9189;
          pointer-events: none;
          height: 0;
        }
        .tiptap-editor .ProseMirror mark { background: #fef08a; padding: 0 2px; border-radius: 2px; }
        .tiptap-editor .ProseMirror hr { border: none; border-top: 2px solid #edeae6; margin: 1rem 0; }
      `}</style>
    </div>
  );
}
