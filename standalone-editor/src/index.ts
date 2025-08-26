/**
 * Standalone WebGPU Shader Editor
 * 
 * A framework-agnostic React component for editing and running compute shaders
 * with WebGPU support.
 */

export { StandaloneEditor as default } from './StandaloneEditor';
export { StandaloneEditor } from './StandaloneEditor';

// Export types for consumers
export type {
    StandaloneEditorProps,
    EditorFeatures,
    Language,
    Texture,
    ParseError,
    MetadataEditorProps,
    CommentsProps,
    ShaderData,
    User,
    AuthorProfile,
    Visibility
} from './types';