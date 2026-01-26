'use client';

import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
    return (
        <div className="h-[500px] w-full border border-[#CCCCCC]">
            <Editor
                height="100%"
                language={language}
                value={value}
                onChange={(val) => onChange(val || '')}
                theme="vs-light"
                options={{
                    fontSize: 13,
                    fontFamily: 'Consolas, "Courier New", monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    quickSuggestions: true,
                    snippetSuggestions: 'top',
                    renderLineHighlight: 'none',
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        useShadows: false,
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                    },
                }}
            />
        </div>
    );
}
