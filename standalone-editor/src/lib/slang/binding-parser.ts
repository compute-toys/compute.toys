/**
 * WGSL binding parser
 * Extracts binding information from WGSL shader code
 */

// Type definitions for binding information
export interface BindingInfo {
    binding: number; // Binding slot number
    group: number; // Group number
    properties: string; // For var<...> declarations, e.g. 'storage, read_write'
    topLevelType: string; // Main type like 'array', 'texture_storage_2d', etc.
    typeArgs: string[]; // Type arguments like 'rgba8unorm', 'f32', etc.
    originalLine: string; // The original binding declaration line
}

/**
 * Parse a binding line to extract variable information
 * @param line The binding line from WGSL code
 * @returns Object containing binding info or null if not a binding line
 */
function parseBindingLine(line: string): [string, BindingInfo] | null {
    const trimmedLine = line.trim();
    // Skip if not a binding line
    if (!trimmedLine.startsWith('@binding')) return null;

    // Extract binding and group numbers
    const bindingMatch = trimmedLine.match(/@binding\((\d+)\)\s+@group\((\d+)\)/);
    if (!bindingMatch) return null;

    const binding = parseInt(bindingMatch[1], 10);
    const group = parseInt(bindingMatch[2], 10);

    // Extract the declaration part after binding/group annotations
    const declaration = trimmedLine.substring(bindingMatch[0].length).trim();

    // Get the basic information - we'll parse name and type separately
    const variableInfo = parseVariableDeclaration(declaration);
    if (!variableInfo) return null;

    return [
        variableInfo.name,
        {
            binding,
            group,
            properties: variableInfo.properties,
            topLevelType: variableInfo.topLevelType,
            typeArgs: variableInfo.typeArgs,
            originalLine: trimmedLine
        }
    ];
}

/**
 * Helper method to parse a variable declaration
 * @param declaration WGSL variable declaration string
 * @returns Parsed information or null if invalid
 */
function parseVariableDeclaration(declaration: string): {
    name: string;
    properties: string;
    topLevelType: string;
    typeArgs: string[];
} | null {
    // Handle var<storage, read_write> pattern
    let varProperties: string = '';
    let cleanDeclaration = declaration;

    // Extract properties from var<...>
    const propertiesMatch = declaration.match(/var<([^>]+)>/);
    if (propertiesMatch) {
        varProperties = propertiesMatch[1].trim();
        cleanDeclaration = declaration.replace(/var<[^>]+>/, 'var');
    }

    // Extract variable name (removing _0 suffix)
    const nameMatch = cleanDeclaration.match(/(?:var\s+)?([a-zA-Z0-9_]+)_0\s*:/);
    if (!nameMatch) return null;
    const name = nameMatch[1];

    // Extract type information
    const typeMatch = cleanDeclaration.match(/:\s*([^<\s;]+)(?:<(.+)>)?/);
    if (!typeMatch) return null;

    const topLevelType = typeMatch[1];
    let typeArgs: string[] = [];

    if (typeMatch[2]) {
        // Handle nested type arguments by counting angle brackets
        const typeArgsStr = typeMatch[2].trim();

        // For simple cases (no nested angle brackets)
        if (!typeArgsStr.includes('<') || !typeArgsStr.includes('>')) {
            typeArgs = typeArgsStr.split(',').map(arg => arg.trim());
        } else {
            // For complex cases, we need to handle nested brackets
            typeArgs = parseTypeArguments(typeArgsStr);
        }
    }

    return {
        name,
        properties: varProperties,
        topLevelType,
        typeArgs
    };
}

/**
 * Parse type arguments, handling nested angle brackets
 * @param typeArgsStr Type arguments string
 * @returns Parsed type arguments
 */
function parseTypeArguments(typeArgsStr: string): string[] {
    // For simple case
    if (!typeArgsStr.includes('<')) {
        return typeArgsStr.split(',').map(arg => arg.trim());
    }

    // For complex case with nested types
    const result: string[] = [];
    let currentArg = '';
    let bracketCount = 0;

    for (let i = 0; i < typeArgsStr.length; i++) {
        const char = typeArgsStr[i];

        if (char === '<') {
            bracketCount++;
            currentArg += char;
        } else if (char === '>') {
            bracketCount--;
            currentArg += char;
        } else if (char === ',' && bracketCount === 0) {
            // Only split at top-level commas
            result.push(currentArg.trim());
            currentArg = '';
        } else {
            currentArg += char;
        }
    }

    // Add the last argument
    if (currentArg.trim()) {
        result.push(currentArg.trim());
    }

    return result;
}

/**
 * Parse all binding information from generated WGSL code
 * @param wgslCode The generated WGSL code
 * @returns Array of binding information objects
 */
export function parseBindings(wgslCode: string): Record<string, BindingInfo> {
    const bindings: Record<string, BindingInfo> = {};
    const codeLines = wgslCode.split('\n');

    for (const line of codeLines) {
        const bindingData = parseBindingLine(line);
        if (bindingData) {
            bindings[bindingData[0]] = bindingData[1];
        }
    }

    return bindings;
}
