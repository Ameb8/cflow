import Editor from "@monaco-editor/react";

export function EditorSection({ code, setCode, onMount }) {
    return (
        <Editor
            className="editor"
            height="300px"
            defaultLanguage="c"
            value={code}
            onChange={(value) => {
                setCode(value);
                localStorage.setItem('c_code', value);
            }}
            onMount={onMount}
        />
    );
}
