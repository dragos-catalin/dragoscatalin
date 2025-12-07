"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  EditorState,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $insertNodes
} from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
  ListItemNode
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
  $isHeadingNode
} from "@lexical/rich-text";
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";

export interface RichTextEditorRef {
  insertText: (text: string) => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Plugin to set initial content
function InitialContentPlugin({ content, lastLoadedContentRef }: { content: string; lastLoadedContentRef: React.MutableRefObject<string> }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Skip if content hasn't changed (prevents cursor jumping when onChange echoes back)
    if (content === lastLoadedContentRef.current) {
      return;
    }

    if (!content) {
      lastLoadedContentRef.current = '';
      return;
    }

    editor.update(() => {
      const root = $getRoot();

      // Check if content is HTML
      const isHTML = content.includes('<p') || content.includes('<h') || content.includes('<strong') || content.includes('<em');

      if (isHTML) {
        // Parse HTML content
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);

        root.clear();
        root.select();

        // Insert parsed nodes
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes(nodes);
        }
      } else {
        // Plain text - split by newlines
        root.clear();
        const lines = content.split('\n');
        lines.forEach((line) => {
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(line);
          paragraph.append(textNode);
          root.append(paragraph);
        });
      }
    });

    // Update ref to track what we just loaded
    lastLoadedContentRef.current = content;
  }, [content, editor, lastLoadedContentRef]);

  return null;
}

// Plugin to handle text insertion via ref
function InsertTextPlugin({ editorRef }: { editorRef: React.RefObject<RichTextEditorRef> }) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(editorRef, () => ({
    insertText: (text: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(text);
        }
      });
      editor.focus();
    }
  }));

  return null;
}

// Toolbar component with comprehensive formatting options
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const insertHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const heading = $createHeadingNode(headingSize);
        selection.insertNodes([heading]);
      }
    });
  };

  const insertQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const quote = $createQuoteNode();
        selection.insertNodes([quote]);
      }
    });
  };

  const insertBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-700 bg-neutral-900">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-neutral-700 pr-2">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-3 py-1 text-sm font-bold rounded hover:bg-neutral-800 transition-colors"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-3 py-1 text-sm italic rounded hover:bg-neutral-800 transition-colors"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="px-3 py-1 text-sm underline rounded hover:bg-neutral-800 transition-colors"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => formatText('strikethrough')}
          className="px-3 py-1 text-sm line-through rounded hover:bg-neutral-800 transition-colors"
          title="Strikethrough"
        >
          S
        </button>
        <button
          type="button"
          onClick={() => formatText('code')}
          className="px-3 py-1 text-sm font-mono rounded hover:bg-neutral-800 transition-colors"
          title="Code"
        >
          {'</>'}
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r border-neutral-700 pr-2">
        <button
          type="button"
          onClick={() => insertHeading('h1')}
          className="px-2 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertHeading('h2')}
          className="px-2 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertHeading('h3')}
          className="px-2 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Heading 3"
        >
          H3
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r border-neutral-700 pr-2">
        <button
          type="button"
          onClick={insertBulletList}
          className="px-3 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={insertNumberedList}
          className="px-3 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 border-r border-neutral-700 pr-2">
        <button
          type="button"
          onClick={() => formatAlignment('left')}
          className="px-2 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Align Left"
        >
          ⫷
        </button>
        <button
          type="button"
          onClick={() => formatAlignment('center')}
          className="px-2 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Align Center"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => formatAlignment('right')}
          className="px-2 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Align Right"
        >
          ⫸
        </button>
      </div>

      {/* Quote */}
      <div className="flex items-center gap-1 border-r border-neutral-700 pr-2">
        <button
          type="button"
          onClick={insertQuote}
          className="px-3 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Quote"
        >
          " "
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={undo}
          className="px-3 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={redo}
          className="px-3 py-1 text-sm rounded hover:bg-neutral-800 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
      </div>
    </div>
  );
}

// Plugin to handle onChange and convert to HTML
function OnChangeHTMLPlugin({ onChange, currentValue, lastLoadedContentRef }: { onChange: (html: string) => void; currentValue: string; lastLoadedContentRef: React.MutableRefObject<string> }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const htmlContent = $generateHtmlFromNodes(editor, null);

      // Only update if content actually changed to avoid infinite loops
      if (htmlContent !== currentValue) {
        // Update ref to track what we're emitting
        lastLoadedContentRef.current = htmlContent;
        onChange(htmlContent);
      }
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  function RichTextEditor({ value, onChange, placeholder = "Start typing..." }, ref) {
    // Track the last loaded content to prevent cursor jumping
    const lastLoadedContentRef = useRef<string>('');

    // Initialize ref with current value on mount
    useEffect(() => {
      if (!lastLoadedContentRef.current && value) {
        lastLoadedContentRef.current = value;
      }
    }, [value]);

    const initialConfig: InitialConfigType = {
      namespace: "TemplateEditor",
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode
      ],
      theme: {
        root: "min-h-[400px] focus:outline-none",
        paragraph: "mb-2",
        heading: {
          h1: "text-3xl font-bold mb-4",
          h2: "text-2xl font-bold mb-3",
          h3: "text-xl font-bold mb-2",
        },
        quote: "border-l-4 border-neutral-600 pl-4 italic my-4",
        list: {
          ul: "list-disc list-inside mb-2",
          ol: "list-decimal list-inside mb-2",
          listitem: "mb-1",
          nested: {
            listitem: "ml-4"
          }
        },
        link: "text-blue-400 underline hover:text-blue-300",
        text: {
          bold: "font-bold",
          italic: "italic",
          underline: "underline",
          strikethrough: "line-through",
          code: "bg-neutral-800 px-1 py-0.5 rounded font-mono text-sm",
        },
      },
      onError: (error: Error) => {
        console.error(error);
      },
    };

    return (
      <div className="border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900">
        <LexicalComposer initialConfig={initialConfig}>
          <InsertTextPlugin editorRef={ref as React.RefObject<RichTextEditorRef>} />
          <ToolbarPlugin />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[400px] p-4 text-neutral-100 focus:outline-none" />
              }
              placeholder={
                <div className="absolute top-4 left-4 text-neutral-600 pointer-events-none">
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <OnChangeHTMLPlugin onChange={onChange} currentValue={value} lastLoadedContentRef={lastLoadedContentRef} />
          <InitialContentPlugin content={value} lastLoadedContentRef={lastLoadedContentRef} />
        </LexicalComposer>
      </div>
    );
  }
);

export default RichTextEditor;
