import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { initMonaco } from '../monaco-config';

interface MonacoEditorProps {
    defaultValue?: string | undefined;
    className?: string;
    theme: string;
    defaultLanguage: string;
    language?: string;
    value?: string;
    onChange?: (value: string | undefined) => void;
    height?: string;
    options?: any;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
    theme,
    className,
    defaultLanguage,
    language,
    value,
    onChange,
    defaultValue,
    height = "500px",
    options = {}
}) => {
    const [isMonacoInitialized, setIsMonacoInitialized] = useState(false);

    useEffect(() => {
        // Initialize Monaco when the component mounts
        initMonaco().then(() => {
            setIsMonacoInitialized(true);
        }).catch(error => {
            console.error('Failed to initialize Monaco Editor:', error);
        });
    }, []);

    if (!isMonacoInitialized) {
        return <></>;
    }

    return (
        <Editor
            defaultLanguage={defaultLanguage}
            height={height}
            language={language}
            value={value}
            onChange={onChange}
            theme={theme}
            options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                ...options
            }}
            defaultValue={defaultValue}
            className={className}
        />
    );
};

export default MonacoEditor; 