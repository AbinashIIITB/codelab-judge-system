'use client';

import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
    const { resolvedTheme } = useTheme();

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                language={language}
                value={value}
                onChange={(val) => onChange(val || '')}
                theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
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
                }}
            />
        </div>
    );
}
