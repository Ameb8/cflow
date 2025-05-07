export function ErrorOutput({ error }) {
    return (
        <div className="error-output">
            <h3 className="subtitle">Compilation Error:</h3>
            <pre className="output">{error}</pre>
        </div>
    );
}
