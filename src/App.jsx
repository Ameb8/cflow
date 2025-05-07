import "./App.css"

import { useState, useRef } from 'react';
import Editor from "@monaco-editor/react";

import { useEditorSync } from './hooks/useEditorSync';
import { compileCode } from './utils/compileCode';
import { loadSavedFile } from './utils/loadSavedFile';
import { EditorSection } from './components/EditorSection';
import { TabButtons } from './components/TabButtons';
import { WarningOutput } from './components/WarningOutput';
import { ErrorOutput } from './components/ErrorOutput';
import Navbar from './components/Navbar.jsx';
import FileSystemExplorer from './components/FileSystemExplorer.jsx';
import SaveFile from './components/SaveFile.jsx';
import { useAuth } from './context/AuthContext.jsx';


export default function App() {
    const [code, setCode] = useState('');
    const [asm, setAsm] = useState('');
    const [preprocessed, setPreprocessed] = useState('');
    const [error, setError] = useState('');
    const [warnings, setWarnings] = useState('');
    const [fileName, setFileName] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [refreshFilesystem, setRefreshFilesystem] = useState(false);

    const lineMappingRef = useRef({});
    const cEditorRef = useRef(null);
    const asmEditorRef = useRef(null);
    const asmDecorationsRef = useRef([]);
    const { user } = useAuth();

    useEditorSync(setCode, setAsm);

    const handleCompile = async () => {
        try {
            const data = await compileCode(code);
            const allAssemblies = data.assembly;
            localStorage.setItem('asm_output', JSON.stringify(allAssemblies));
            localStorage.setItem('line_mapping', JSON.stringify(data.line_mapping));
            setAsm(allAssemblies[0]);
            setPreprocessed(data.preprocessed);
            setWarnings(data.warnings || '');
            lineMappingRef.current = data.line_mapping[0];
        } catch (err) {
            const stderr = err?.response?.data?.stderr;
            setError(stderr || "Compilation failed. Please check your code.");
            setWarnings('');
        }
    };

    const handleSaveNotification = () => setRefreshFilesystem(prev => !prev);

    const handleFileDoubleClick = async (fileData) => {
        try {
            const result = await loadSavedFile(fileData.id);
            setCode(result.file_content || '');
            setFileName(result.file_name);
        } catch {
            setError("Failed to load file. Please try again.");
        }
    };

    const handleCEditorMount = (editor) => {
        cEditorRef.current = editor;
        editor.onDidChangeCursorPosition((e) => {
            const currentLine = e.position.lineNumber.toString();

            // Use current line mapping ref
            const mapping = lineMappingRef.current || {};
            const asmLines = mapping[currentLine];

            // DEBUG ***
            console.log("Line selected: " + currentLine);
            console.log("ASM lines: " + asmLines);
            // END DEBUG ***

            if (asmEditorRef.current) {
                asmDecorationsRef.current = asmEditorRef.current.deltaDecorations(
                    asmDecorationsRef.current,
                    asmLines ? asmLines.map(line => ({
                        range: {
                            startLineNumber: line,
                            endLineNumber: line,
                            startColumn: 1,
                            endColumn: 1,
                        },
                        options: {
                            isWholeLine: true,
                            className: 'highlight-line',
                        }
                    })) : []
                );
            }
        });
    };

    const handleTabChange = (index) => {
        setSelectedTab(index);

        const allAssemblies = JSON.parse(localStorage.getItem('asm_output'));
        const allLineMappings = JSON.parse(localStorage.getItem('line_mapping'));

        if (allAssemblies?.[index]) setAsm(allAssemblies[index]);
        if (allLineMappings?.[index]) lineMappingRef.current = allLineMappings[index];
    };


    return (
        <div className="container">
            <Navbar />
            <h1 className="title">CFlow</h1>

            <input
                type="text"
                className="filename-input"
                placeholder="Enter file name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
            />

            <div className="editor-container">
                <EditorSection code={code} setCode={setCode} onMount={handleCEditorMount} />
                <div className="asm-tabs"><TabButtons selectedTab={selectedTab} setSelectedTab={handleTabChange} /></div>
                <Editor
                    className="editor"
                    defaultLanguage="cpp"
                    value={asm}
                    options={{ readOnly: true }}
                    onMount={(editor) => (asmEditorRef.current = editor)}
                />
            </div>

            <button className="compile-button" onClick={handleCompile}>Compile</button>

            <SaveFile selectedFolder={selectedFolder} code={code} fileName={fileName} handleSaveNotification={handleSaveNotification} />

            {warnings && <WarningOutput warnings={warnings} />}
            {error && <ErrorOutput error={error} />}

            {user && <FileSystemExplorer selectedFolder={selectedFolder} onFolderSelect={setSelectedFolder} refreshTrigger={refreshFilesystem} onFileDoubleClick={handleFileDoubleClick} />}

            <h2 className="subtitle">Preprocessed Code:</h2>
            <pre className="output">{preprocessed}</pre>
        </div>
    );
}

