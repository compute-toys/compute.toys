'use client';
/**
 * This component serves as a client-side wrapper for the Editor component.
 *
 * IMPORTANT: We're using a special pattern here to avoid SSR issues with monaco-editor
 * on Cloudflare Pages. The key aspects of this implementation:
 *
 * 1. We can't use next/dynamic directly due to issues with Cloudflare Pages
 *    (see: https://github.com/cloudflare/next-on-pages/issues/941)
 *
 * 2. We can't import Editor directly at the module level because it would be bundled
 *    with server components, causing 'window is not defined' errors
 *
 * 3. Instead, we use a client-side only component with useEffect to dynamically import
 *    the Editor component only after mounting in the browser
 *
 * 4. We first check for client-side mounting, then dynamically import the Editor component
 *    to ensure all browser APIs are available before attempting to load Monaco editor
 */

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { User } from '@supabase/supabase-js';
import { useSetAtom } from 'jotai';
import { useShader } from 'lib/view/client';
import { Shader } from 'lib/view/server';
import { useEffect, useState } from 'react';
import { halfResolutionAtom } from '../../../lib/atoms/atoms';

// Simple container style
const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    width: '100%'
};

// Error message style
const errorStyle = {
    color: '#ff6b6b',
    padding: '1rem',
    border: '1px solid #ff6b6b',
    borderRadius: '0.5rem',
    margin: '1rem 0',
    maxWidth: '80%',
    textAlign: 'center' as const
};

interface ClientSideEditorProps {
    shaderData: Shader;
    userData: User | null;
}

/**
 * Client-side wrapper for the shader editor.
 * Handles loading shader data and dynamically importing the editor only on the client.
 * This ensures Monaco editor loads only in the browser environment to avoid SSR issues.
 */
export default function ClientSideEditor({ shaderData, userData }: ClientSideEditorProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const [EditorComponent, setEditorComponent] = useState<React.ComponentType<{
        user?: User;
    }> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const setHalfResolution = useSetAtom(halfResolutionAtom);
    const isMobile = !useMediaQuery('(min-width:600px)');

    // Initialize with shader data
    useShader(shaderData);

    // Set mounted state only on the client
    useEffect(() => {
        setHalfResolution(isMobile);
        setHasMounted(true);
    }, []);

    // Load the editor component only after the component mounts
    useEffect(() => {
        if (!hasMounted) return;

        let isMounted = true;

        const loadEditor = async () => {
            try {
                // Direct import with string literal for webpack to analyze
                const editorModule = await import('components/editor/editor');

                if (isMounted) {
                    setEditorComponent(() => editorModule.default);
                }
            } catch (err) {
                console.error('Error loading editor:', err);
                if (isMounted) {
                    setError(
                        'Failed to load editor component: ' +
                            (err instanceof Error ? err.message : String(err))
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadEditor();

        return () => {
            isMounted = false;
        };
    }, [hasMounted]);

    // Show error state if loading failed
    if (error) {
        return (
            <Box sx={containerStyle}>
                <div style={errorStyle}>{error}</div>
            </Box>
        );
    }

    // Show loading UI during initial load states
    if (!hasMounted || isLoading || !EditorComponent) {
        return (
            <Box sx={containerStyle}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    // Create editor props to pass to the component
    const editorProps = {
        user: userData || undefined
    };

    // Render the editor component
    return <EditorComponent {...editorProps} />;
}
