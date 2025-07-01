import { ChevronDown, Code } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import CodeBlock from "@/components/CodeBlock";

// History management linked list with fixed size
interface HistoryState {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

class HistoryNode {
  state: HistoryState;
  next: HistoryNode | null = null;
  prev: HistoryNode | null = null;

  constructor(state: HistoryState) {
    this.state = state;
  }
}

export class TextHistory {
  private head: HistoryNode | null = null;
  private tail: HistoryNode | null = null;
  private current: HistoryNode | null = null;
  private size: number = 0;

  constructor(private readonly capacity: number = 20) {
    if (capacity < 1) {
      throw new Error("Capacity must be at least 1");
    }
  }

  private getWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  recordState(
    text: string,
    selectionStart: number,
    selectionEnd: number,
  ): void {
    const newState = { text, selectionStart, selectionEnd };

    // Skip if no substantial change (word count remains the same)
    if (
      this.current &&
      this.getWordCount(this.current.state.text) === this.getWordCount(text)
    ) {
      return;
    }

    // Create new node
    const newNode = new HistoryNode(newState);

    // Initialize history if empty
    if (this.size === 0) {
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
      this.size = 1;
      return;
    }

    // Clear redo history if not at tail
    if (this.current !== this.tail) {
      this.current.next = null;
      this.tail = this.current;
      this.size = this.getNodePosition(this.current) + 1;
    }

    // Link new node
    this.tail!.next = newNode;
    newNode.prev = this.tail;
    this.tail = newNode;
    this.current = newNode;
    this.size++;

    // Remove oldest node if over capacity
    if (this.size > this.capacity) {
      this.removeOldestNode();
    }
  }

  undo(): HistoryState | null {
    if (!this.current?.prev) return null;
    this.current = this.current.prev;
    return { ...this.current.state };
  }

  redo(): HistoryState | null {
    if (!this.current?.next) return null;
    this.current = this.current.next;
    return { ...this.current.state };
  }

  private removeOldestNode(): void {
    if (!this.head || this.size <= 1) return;

    // Remove head and update references
    const newHead = this.head.next;
    if (newHead) {
      newHead.prev = null;
      this.head.next = null;
      this.head = newHead;
      this.size--;
    }
  }

  private getNodePosition(node: HistoryNode): number {
    let count = 0;
    let current: HistoryNode | null = this.head;
    while (current && current !== node) {
      count++;
      current = current.next;
    }
    return count;
  }
}

export default function CodeEditor(
  { onCodeChange, onLanguageChange }: {
    onCodeChange: (newCode: string) => void;
    onLanguageChange: (newLanguage: string) => void;
  },
) {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [history] = useState(() => new TextHistory(20));

  useEffect(() => {
    // Save to history on code change
    history.recordState(
      code,
      codeEditorRef.current.selectionStart,
      codeEditorRef.current.selectionEnd,
    );
  }, [code]);

  const syntaxHighlighterRef = useRef<HTMLPreElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);

  const handleLanguageChange = (newLang: string) => {
    onLanguageChange(newLang);
    setSelectedLanguage(newLang);
  };

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "typescript", label: "TypeScript" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
  ];

  return (
    <div className="w-1/2 bg-gray-900 flex flex-col">
      {/* Language Selector */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Language:</span>
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 relative p-4">
        <textarea
          name="editor"
          ref={codeEditorRef}
          onChange={(e) => {
            onCodeChange(e.currentTarget.value);
            setCode(e.currentTarget.value);
          }}
          onScroll={(e) => {
            syntaxHighlighterRef.current.parentElement.scrollTop =
              e.currentTarget.scrollTop;
          }}
          onKeyDown={(e) => {
            function getSelectionFirstLine(text: string, start: number) {
              const lines = text.substring(0, start).split("\n");
              return lines.length - 1;
            }
            function getSelectionLastLine(text: string, end: number) {
              const lines = text.substring(0, end).split("\n");
              return lines.length - 1;
            }
            if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              const prevState = history.undo();
              if (prevState) {
                e.currentTarget.value = prevState.text;
                e.currentTarget.selectionStart = prevState.selectionStart;
                e.currentTarget.selectionEnd = prevState.selectionEnd;
                setCode(prevState.text);
                onCodeChange(prevState.text);
              }
            } else if (
              (e.key === "y" && (e.ctrlKey || e.metaKey)) ||
              (e.key === "Z" && e.shiftKey)
            ) {
              e.preventDefault();
              const nextState = history.redo();
              if (nextState) {
                e.currentTarget.value = nextState.text;
                e.currentTarget.selectionStart = nextState.selectionStart;
                e.currentTarget.selectionEnd = nextState.selectionEnd;
                setCode(nextState.text);
                onCodeChange(nextState.text);
              }
            } else if (e.key === "Tab") {
              e.preventDefault();
              const firstLine = getSelectionFirstLine(
                e.currentTarget.value,
                e.currentTarget.selectionStart,
              );
              const lastLine = getSelectionLastLine(
                e.currentTarget.value,
                e.currentTarget.selectionEnd,
              );
              if (e.shiftKey) {
                // Handle Shift + Tab for unindenting
                const lines = e.currentTarget.value.split("\n");
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const selectedLines = lines.slice(firstLine, lastLine + 1);
                // Check if the first line will be unindented
                const firstLineUnindented = selectedLines[0].startsWith("  ");
                let offset = 0;
                const updatedLines = selectedLines.map((line) => {
                  if (line.startsWith("  ")) {
                    offset += 2; // Count the two spaces removed
                    return line.substring(2); // Remove two spaces for tab
                  }
                  return line; // No change if not indented
                }); // Remove two spaces for tab
                lines.splice(
                  firstLine,
                  lastLine - firstLine + 1,
                  ...updatedLines,
                );
                e.currentTarget.value = lines.join("\n");
                e.currentTarget.selectionStart = start -
                  (firstLineUnindented ? 2 : 0); // Adjust selection start
                e.currentTarget.selectionEnd = end - offset; // Adjust selection end
              } else {
                // If the selection spans multiple lines, insert tabs at the start of each line
                if (firstLine !== lastLine) {
                  const lines = e.currentTarget.value.split("\n");
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const selectedLines = lines.slice(firstLine, lastLine + 1);
                  const updatedLines = selectedLines.map((line) => "  " + line); // Insert two spaces for tab
                  lines.splice(
                    firstLine,
                    lastLine - firstLine + 1,
                    ...updatedLines,
                  );
                  e.currentTarget.value = lines.join("\n");
                  e.currentTarget.selectionStart = start + 2; // Adjust selection start
                  e.currentTarget.selectionEnd = end +
                    (2 * selectedLines.length); // Adjust selection end
                } else {
                  // If single line, insert two spaces at the cursor position
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  e.currentTarget.value =
                    e.currentTarget.value.substring(0, start) +
                    "  " + // Insert two spaces for tab
                    e.currentTarget.value.substring(end);
                  e.currentTarget.selectionStart =
                    e.currentTarget.selectionEnd =
                      start + 2;
                }
              }
              onCodeChange(e.currentTarget.value);
              setCode(e.currentTarget.value);
            }
          }}
          placeholder="Write your code here..."
          className="w-full h-full bg-transparent text-transparent font-mono text-sm resize-none focus:outline-none leading-[1.5] indent-[2] caret-gray-100 placeholder-gray-400 overflow-y-auto selection:text-transparent selection:bg-blue-500 whitespace-break-spaces"
          style={{
            /* Make gray and thin scrollbar */
            scrollbarWidth: "thin",
            scrollbarColor: "#4b5563 transparent",
          }}
          spellCheck={false}
        >
        </textarea>
        <div className="absolute top-0 left-0 w-full h-full p-4 pointer-events-none">
          <CodeBlock
            code={code}
            language={selectedLanguage}
            ref={syntaxHighlighterRef}
            style={{
              background: "transparent",
              fontFamily: "monospace",
              color: "#f3f4f6",
              fontSize: "14px",
              width: "100%",
              height: codeEditorRef.current
                ? `${codeEditorRef.current.scrollHeight}px`
                : "100%",
              padding: "0",
              textWrap: "wrap",
              overflowWrap: "anywhere",
              whiteSpace: "break-spaces",
            }}
          />
        </div>
      </div>
    </div>
  );
}
