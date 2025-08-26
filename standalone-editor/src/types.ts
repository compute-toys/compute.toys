/**
 * Types for the standalone editor component
 */

export interface ParseError {
    summary: string;
    position: { row: number; col: number };
    success: boolean;
}

export interface Texture {
    img: string;
    thumb?: string;
    url?: string;
}

export type Language = 'wgsl' | 'slang';
export type Visibility = 'private' | 'unlisted' | 'public';

export interface AuthorProfile {
    username: string | null;
    avatar_url: string | null;
    id: string;
}

export interface User {
    id: string;
    email?: string;
    [key: string]: any;
}

export interface ShaderData {
    id?: number;
    name: string;
    description: string;
    code: string;
    uniforms?: any[];
    textures: Texture[];
    float32Enabled: boolean;
    language: Language;
    visibility: Visibility;
    profile?: AuthorProfile | false;
    needsSave?: boolean;
}

export interface EditorFeatures {
    texturePicker?: boolean;
    uniformSliders?: boolean;
    bufferControls?: boolean;
    recording?: boolean;
    profiler?: boolean;
    vim?: boolean;
    hotReload?: boolean;
    timer?: boolean;
    explainer?: boolean;
    comments?: boolean;
    metadata?: boolean;
}

// Component prop types for passing custom components
export interface MetadataEditorProps {
    shaderData: ShaderData;
    user?: User;
    onShaderDataChange: (changes: Partial<ShaderData>) => void;
    onSave?: (shaderData: ShaderData) => Promise<{ id: number; url: string }>;
    onDelete?: (shaderData: ShaderData) => Promise<void>;
    onFork?: (shaderData: ShaderData) => Promise<{ id: number; url: string }>;
}

export interface CommentsProps {
    shaderId: number;
    [key: string]: any;
}

export interface StandaloneEditorProps {
    // Complete shader data loading (replaces individual props)
    shaderData?: ShaderData;
    
    // Fallback individual configuration (for simple usage)
    initialShader?: string;
    language?: Language;
    
    // User authentication & permissions
    user?: User;
    
    // Event callbacks
    onShaderChange?: (code: string) => void;
    onCompileSuccess?: () => void;
    onCompileError?: (error: ParseError) => void;
    onLanguageChange?: (language: Language) => void;
    onShaderDataChange?: (shaderData: Partial<ShaderData>) => void;
    
    // Metadata management callbacks (for database integration)
    onSave?: (shaderData: ShaderData) => Promise<{ id: number; url: string }>;
    onDelete?: (shaderData: ShaderData) => Promise<void>;
    onFork?: (shaderData: ShaderData) => Promise<{ id: number; url: string }>;
    
    // Asset providers
    textureProvider?: (index: number, filename: string) => Promise<string>;
    defaultTextures?: Texture[];
    customTextures?: Texture[];
    
    // Image transformation (e.g. imgproxy, thumbor, etc.)
    imageTransform?: (src: string, width?: number, height?: number) => string;
    
    // Component overrides - pass your own components for metadata and comments
    MetadataEditorComponent?: React.ComponentType<MetadataEditorProps>;
    CommentsComponent?: React.ComponentType<CommentsProps>;
    
    // Visual feedback
    statusColor?: string | false; // for save/compile status transitions
    
    // Feature toggles
    features?: EditorFeatures;
    
    // UI customization
    embed?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}