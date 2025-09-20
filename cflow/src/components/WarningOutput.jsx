export function WarningOutput({ warnings }) {
    return (
        <div className="warning-output">
            <h3 className="subtitle">Compiler Warnings:</h3>
            <pre className="output">{warnings}</pre>
        </div>
    );
}
