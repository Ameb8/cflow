import { useState, useEffect , useRef } from 'react';
import Editor from "@monaco-editor/react";
import axios from 'axios';
import './App.css'
import Navbar from './Navbar'
import FileSystemExplorer from "./FileSystemExplorer.jsx";
import { useAuth } from './AuthContext.jsx';
import SaveFile from "./SaveFile.jsx";
import csrfAxios from "./csrfAxios.js";


function App() {
    const [code, setCode] = useState(`#include <stdio.h>\nint main() {\n  return 0;\n}`);
    const [asm, setAsm] = useState('');
    const [preprocessed, setPreprocessed] = useState(''); // New state for preprocessed code
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lineMapping, setLineMapping] = useState({});
    const [warnings, setWarnings] = useState('');
    const lineMappingRef = useRef({});
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [refreshFilesystem, setRefreshFilesystem] = useState(false);
    const [fileName, setFileName] = useState('');

    const asmEditorRef = useRef(null);
    const cEditorRef = useRef(null);
    const asmDecorationsRef = useRef([]);
    const { user } = useAuth();

    const handleSaveNotification = () => {
        console.log("Code was saved!");
        setRefreshFilesystem(prev => !prev);
    };

    // Load saved file to editor when clicked
    const handleFileDoubleClick = async (fileData) => {
        console.log("Double-clicked file:", fileData);

        try {
            const response = await csrfAxios.get(`/api/files/${fileData.id}/`);

            console.log("File details fetched:", response.data); // DEBUG ***

            // Load file data into editor
            setCode(response.data.file_content || '');
            setFileName(response.data.file_name);
        } catch (err) {
            console.error("Error fetching file details:", err);
            setError("Failed to load file. Please try again.");
        }
    };


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
            setWarnings(response.data.warnings || '');
            console.log("'-Wall' Warnings: ", response.data.warnings);
        } catch (err) {
            const stderr = err?.response?.data?.stderr;
            setError(stderr || "Compilation failed. Please check your code.");
            setWarnings('');
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
            <Navbar />
            <h1 className="title">CFlow</h1>
            <div className="filename-input">
                <input
                    type="text"
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                />
            </div>
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
            <SaveFile
                selectedFolder={selectedFolder}
                code={code}
                fileName={fileName}
                handleSaveNotification={handleSaveNotification}
            />
            {warnings && (
                <div className="warning-output">
                    <h3 className="subtitle">Compiler Warnings:</h3>
                    <pre className="output">{warnings}</pre>
                </div>
            )}
            {error && (
                <div className="error-output">
                    <h3 className="subtitle">Compilation Error:</h3>
                    <pre className="output">{error}</pre>
                </div>
            )}
            {user && <FileSystemExplorer
                selectedFolder={selectedFolder}
                onFolderSelect={setSelectedFolder}
                refreshTrigger={refreshFilesystem}
                onFileDoubleClick={handleFileDoubleClick}
            />}
            <h2 className="subtitle">Assembly Output:</h2>
            <pre className="output">{asm}</pre>
            <h2 className="subtitle">Preprocessed Code:</h2>
            <pre className="output">{preprocessed}</pre>
        </div>
    );
}

export default App;

