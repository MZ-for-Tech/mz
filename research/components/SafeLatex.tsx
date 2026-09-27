"use client";

import React, { ReactNode, useMemo } from 'react';
import katex from 'katex';

const getRawContent = (node: ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getRawContent).join('');
    return '';
};

// Replaces react-latex-next syntax by rendering with native katex
export default function SafeLatex({ children, content }: { children?: ReactNode, content?: string }) {
    const rawContent = content || getRawContent(children);

    const html = useMemo(() => {
        if (!rawContent) return '';

        // Handle content that might or might not have delimiters
        // If no delimiters are found, we treat the whole thing as inline math if it's a short string, or just text.
        // But for MathBox, we want to ensure it's treated as math.
        
        const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
        let result = '';
        let lastIndex = 0;
        let match;
        let foundMatch = false;

        while ((match = regex.exec(rawContent)) !== null) {
            foundMatch = true;
            result += rawContent.substring(lastIndex, match.index);

            const math = match[0];
            const isDisplay = math.startsWith('$$');
            const innerMath = isDisplay ? math.slice(2, -2) : math.slice(1, -1);

            try {
                result += katex.renderToString(innerMath, {
                    displayMode: isDisplay,
                    throwOnError: false,
                    trust: true
                });
            } catch {
                result += math;
            }

            lastIndex = regex.lastIndex;
        }

        if (!foundMatch) {
            // If no delimiters found, try rendering the whole thing as math
            try {
                return katex.renderToString(rawContent, {
                    displayMode: rawContent.length > 50, // Heuristic for display mode
                    throwOnError: false,
                    trust: true
                });
            } catch {
                return rawContent;
            }
        }

        result += rawContent.substring(lastIndex);
        return result;

    }, [rawContent]);

    if (!rawContent) return <>{children}</>;

    const hasDisplay = rawContent.includes('$$') || (rawContent.length > 50 && !rawContent.includes('$'));
    const Component = hasDisplay ? 'div' : 'span';

    return <Component className="latex-container" dir="ltr" dangerouslySetInnerHTML={{ __html: html }} />;
}
