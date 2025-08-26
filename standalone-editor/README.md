# Standalone WebGPU Shader Editor

A self-contained React component for editing and running compute shaders with WebGPU, completely decoupled from any database or framework dependencies.

## Features

- **WebGPU Compute Shaders**: Full support for WGSL and Slang shader languages
- **Monaco Editor**: Professional code editing experience with syntax highlighting
- **Real-time Compilation**: Live shader compilation and error reporting
- **Interactive Controls**: Uniform sliders, texture picker, buffer controls
- **Recording**: Built-in video recording of shader output
- **Framework Agnostic**: Works with any React-based framework

## Basic Usage

```tsx
import { StandaloneEditor } from './standalone-editor';

function App() {
  return (
    <StandaloneEditor
      initialShader={`
        @compute @workgroup_size(16, 16)
        fn main(@builtin(global_invocation_id) id: vec3<u32>) {
          // Your shader code here
        }
      `}
      language="wgsl"
      onShaderChange={(code) => console.log('Shader changed:', code)}
      onCompileSuccess={() => console.log('Compilation successful!')}
      onCompileError={(error) => console.log('Compilation error:', error)}
    />
  );
}
```

## Props

### Core Configuration

- `initialShader?: string` - Initial shader code to load
- `language?: 'wgsl' | 'slang'` - Shader language (defaults to 'wgsl')

### Event Callbacks

- `onShaderChange?: (code: string) => void` - Called when shader code changes
- `onCompileSuccess?: () => void` - Called when shader compiles successfully
- `onCompileError?: (error: ParseError) => void` - Called when compilation fails
- `onLanguageChange?: (language: Language) => void` - Called when language changes

### Asset Providers

- `textureProvider?: (index: number, filename: string) => Promise<string>` - Custom texture loading
- `defaultTextures?: Texture[]` - Default textures to load

### Feature Toggles

All features are enabled by default, but can be selectively disabled:

```tsx
<StandaloneEditor
  features={{
    texturePicker: true,     // Texture selection UI
    uniformSliders: true,    // Uniform control sliders
    bufferControls: true,    // Buffer management UI
    recording: true,         // Video recording
    profiler: true,          // Performance profiler
    vim: true,              // Vim keybindings
    hotReload: true,        // Auto-recompile on change
    timer: true,            // Execution timer
    explainer: true         // Help/documentation
  }}
/>
```

### UI Customization

- `embed?: boolean` - Fullscreen embed mode
- `className?: string` - CSS class for the root container
- `style?: React.CSSProperties` - Inline styles for the root container
- `children?: React.ReactNode` - Additional content to render

## Requirements

- React 18+
- WebGPU-compatible browser
- Material-UI (theme context)

## Browser Support

WebGPU is currently supported in:
- Chrome 113+ (enabled by default)
- Edge 113+ (enabled by default)
- Firefox (experimental, requires flag)
- Safari (experimental, requires flag)

## Architecture

The standalone editor is built with:

- **React**: Component framework
- **Jotai**: State management
- **Material-UI**: UI components
- **Monaco Editor**: Code editor
- **WebGPU**: Compute shader execution

The component is designed to be completely self-contained with no external dependencies on databases, authentication systems, or specific frameworks.