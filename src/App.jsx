import { useState } from 'react';
import Editor from "@monaco-editor/react";
import axios from 'axios';
import './App.css'

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
            <Editor
                className="editor"
                height="300px"
                defaultLanguage="c"
                value={code}
                onChange={(value) => setCode(value)}
            />
            <button className="compile-button" onClick={handleCompile} disabled={loading}>
                {loading ? "Compiling..." : "Compile"}
            </button>
            {error && <p className="error">{error}</p>}
            <h2 className="subtitle">Assembly Output:</h2>
            <pre className="output">{asm}</pre>
            <h2 className="subtitle">Preprocessed Code:</h2> {/* Display Preprocessed Code */}
            <pre className="output">{preprocessed}</pre> {/* Display preprocessed content */}
        </div>
    );
}

export default App;

