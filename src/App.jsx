import { useState, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import axios from 'axios';
import './App.css'

function App() {
    const [code, setCode] = useState(`#include <stdio.h>\nint main() {\n  return 0;\n}`);
    const [asm, setAsm] = useState('');
    const [preprocessed, setPreprocessed] = useState(''); // New state for preprocessed code
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        } catch (err) {
            setError("Compilation failed. Please check your code.");
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <h1 className="title">CFlow</h1>
            <div className="editor-container">
                <Editor
                    className="editor"
                    height="300px"
                    defaultLanguage="c"
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



/*

function App() {
    const [code, setCode] = useState(`#include <stdio.h>\nint main() {\n  return 0;\n}`);
    const [asm, setAsm] = useState('');
    const [preprocessed, setPreprocessed] = useState(''); // New state for preprocessed code
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCompile = async () => {
        console.log("Button clicked"); // DEBUG

        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/compile/', { code });
            console.log("Response:", response); // DEBUG
            setAsm(response.data.assembly);
            setPreprocessed(response.data.preprocessed); // Capture preprocessed code
        } catch (err) {
            setError("Compilation failed. Please check your code.");
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <h1 className="title">CFlow</h1>
            <div className="editor-container">
                <Editor
                    className="editor"
                    height="300px"
                    defaultLanguage="c"
                    value={code}
                    onChange={(value) => setCode(value)}
                />
                <Editor
                    className="editor"
                    height="300px"
                    defaultLanguage="cpp"
                    value={asm}
                    options={{ readOnly: true }}
                />
            </div>
            <button className="compile-button" onClick={handleCompile} disabled={loading}>
                {loading ? "Compiling..." : "Compile"}
            </button>
            {error && <p className="error">{error}</p>}
            <h2 className="subtitle">Assembly Output:</h2>
            <pre className="output">{asm}</pre>
            <h2 className="subtitle">Preprocessed Code:</h2> {/* Display Preprocessed Code *}
<pre className="output">{preprocessed}</pre> {/* Display preprocessed content *}
</div>
);
}

export default App;
 */
