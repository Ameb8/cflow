import { useEffect } from "react";

export function useEditorSync(setCode, setAsm) {
    useEffect(() => {
        const savedCode = localStorage.getItem('c_code');
        const savedAsm = localStorage.getItem('asm_output');
        setCode(savedCode || `#include <stdio.h>\nint main() {\n  return 0;\n}`);
        if (savedAsm) setAsm(savedAsm);
    }, [setCode, setAsm]);
}
