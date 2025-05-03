import { useState, useEffect , useRef } from 'react';
import Editor from "@monaco-editor/react";
import axios from 'axios';
import './App.css'

function App() {
    const [code, setCode] = useState(`#include <stdio.h>\nint main() {\n  return 0;\n}`);
    const [asm, setAsm] = useState('');
    const [preprocessed, setPreprocessed] = useState(''); // New state for preprocessed code
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lineMapping, setLineMapping] = useState({});
    const lineMappingRef = useRef({});

    const asmEditorRef = useRef(null);
    const cEditorRef = useRef(null);
    const asmDecorationsRef = useRef([]);

    // Load from localStorage on first render
    useEffect(() => {
        const savedCode = localStorage.getItem('c_code');
        const savedAsm = localStorage.getItem('asm_output');
        if (savedCode) setCode(savedCode);
        else setCode(`#include <stdio.h>\nint main() {\n  return 0;\n}`);
        if (savedAsm) setAsm(savedAsm);
    }, []);

    const handleCompile = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/compile/', { code });
            setAsm(response.data.assembly);
            localStorage.setItem('asm_output', response.data.assembly);
            setPreprocessed(response.data.preprocessed);
            setLineMapping(response.data.line_mapping);
            lineMappingRef.current = response.data.line_mapping;
            console.log("data: ", response.data.line_mapping); // DEBUG ***
        } catch (err) {
            setError("Compilation failed. Please check your code.");
        }
        setLoading(false);
    };

    const handleCEditorMount = (editor) => {
        cEditorRef.current = editor;

        editor.onDidChangeCursorPosition((e) => {
            const currentLine = e.position.lineNumber.toString();
            console.log("Current C code line:", currentLine); // DEBUG ***
            const asmLines = lineMappingRef.current[currentLine];
            console.log("Mapped ASM lines:", asmLines); // DEBUG ***

            if (asmEditorRef.current) {
                // Clear previous decorations
                asmDecorationsRef.current = asmEditorRef.current.deltaDecorations(
                    asmDecorationsRef.current,
                    asmLines ? asmLines.map(line => ({
                        range: {
                            startLineNumber: line,
                            endLineNumber: line,
                            startColumn: 1,
                            endColumn: 1
                        },
                        options: {
                            isWholeLine: true,
                            className: 'highlight-line'
                        }
                    })) : []
                );
            }
        });
    };

    return (
        <div className="container">
            <h1 className="title">CFlow</h1>
            <div className="editor-container">
                <Editor
                    className="editor"
                    height="300px"
                    defaultLanguage="c"
                    onMount={handleCEditorMount}
                    value={code}
                    onChange={(value) => {
                        setCode(value);
                        localStorage.setItem('c_code', value);
                    }}
                />
                <Editor
                    className="editor"
                    height="300px"
                    defaultLanguage="cpp"
                    value={asm}
                    options={{ readOnly: true }}
                    onMount={(editor) => asmEditorRef.current = editor}
                />
            </div>
            <button className="compile-button" onClick={handleCompile} disabled={loading}>
                {loading ? "Compiling..." : "Compile"}
            </button>
            {error && <p className="error">{error}</p>}
            <h2 className="subtitle">Assembly Output:</h2>
            <pre className="output">{asm}</pre>
            <h2 className="subtitle">Preprocessed Code:</h2>
            <pre className="output">{preprocessed}</pre>
        </div>
    );
}

export default App;

