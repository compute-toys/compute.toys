'use client';
/**
 * New client-side editor using the standalone component
 * This replaces the old client-editor.tsx with full feature parity
 */

import Giscus from '@giscus/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { User } from '@supabase/supabase-js';
import useShaderSerDe from 'lib/db/serializeshader';
import { createClient } from 'lib/supabase/client';
import { useShader } from 'lib/view/client';
import { Shader } from 'lib/view/server';
import { useCallback, useEffect, useState } from 'react';
import { MetadataEditor } from '../../../components/editor/metadataeditor';
import StandaloneEditor from '../../../standalone-editor/src/StandaloneEditor';
import { ShaderData, User as UserType } from '../../../standalone-editor/src/types';

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

// Wrapper components for the standalone editor
const MetadataEditorComponent = ({ user }: { user?: UserType }) => {
    return <MetadataEditor userid={user?.id} />;
};

const CommentsComponent = () => {
    return (
        <Box sx={{ marginTop: { xs: '2em', sm: 0 } }}>
            <Giscus
                id="comments"
                repo="compute-toys/comments"
                repoId="R_kgDOKRTytw"
                category="Announcements"
                categoryId="DIC_kwDOKRTyt84CllQC"
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="1"
                inputPosition="top"
                theme="dark"
                lang="en"
                loading="lazy"
            />
        </Box>
    );
};

interface ClientSideEditorProps {
    shaderData: Shader;
    userData: User | null;
}

function convertShaderToStandaloneFormat(shader: Shader): ShaderData {
    const body = JSON.parse(shader.body);
    return {
        id: shader.id,
        name: shader.name,
        description: shader.description || '',
        code: JSON.parse(body.code),
        uniforms: body.uniforms || [],
        textures: body.textures || [{ img: '/textures/blank.png' }, { img: '/textures/blank.png' }],
        float32Enabled: body.float32Enabled || false,
        language: body.language || 'wgsl',
        visibility: shader.visibility,
        profile: shader.profile,
        needsSave: false
    };
}

/**
 * Client-side wrapper for the shader editor using the new standalone component.
 */
export default function ClientSideEditor({ shaderData, userData }: ClientSideEditorProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [convertedShaderData, setConvertedShaderData] = useState<ShaderData | null>(null);

    const supabase = createClient();
    const [, upsertToHost] = useShaderSerDe(supabase);

    // Convert shader data format
    useEffect(() => {
        try {
            const converted = convertShaderToStandaloneFormat(shaderData);
            setConvertedShaderData(converted);
        } catch (err) {
            console.error('Error converting shader data:', err);
            setError(
                'Failed to load shader data: ' + (err instanceof Error ? err.message : String(err))
            );
        }
    }, [shaderData]);

    // Initialize with shader data (keeps existing behavior)
    useShader(shaderData);

    // Set mounted state only on the client
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Save callback - integrates with existing Supabase logic
    const handleSave = useCallback(
        async (shaderData: ShaderData) => {
            console.log('Saving shader:', shaderData);
            try {
                // The upsertToHost function reads data from atoms, not parameters
                // We need to provide a thumbnail dataURL and forceCreate flag
                // For now, we'll use a placeholder thumbnail and let it create/update based on existing ID
                const thumbnailDataUrl = 'data:image/jpeg;base64,'; // Placeholder - would normally be a canvas screenshot
                const forceCreate = !shaderData.id; // Force create if no ID exists

                const result = await upsertToHost(thumbnailDataUrl, forceCreate);

                return {
                    id: result.id || shaderData.id || 0,
                    url: `/view/${result.id || shaderData.id}`
                };
            } catch (error) {
                console.error('Save failed:', error);
                throw error;
            }
        },
        [upsertToHost]
    );

    // Delete callback
    const handleDelete = useCallback(
        async (shaderData: ShaderData) => {
            if (!shaderData.id) return;

            console.log('Deleting shader:', shaderData.id);
            try {
                const { error } = await supabase.from('shader').delete().eq('id', shaderData.id);

                if (error) throw error;

                // Redirect to home after deletion
                window.location.href = '/';
            } catch (error) {
                console.error('Delete failed:', error);
                throw error;
            }
        },
        [supabase]
    );

    // Fork callback
    const handleFork = useCallback(
        async (shaderData: ShaderData) => {
            console.log('Forking shader:', shaderData);
            try {
                const forkedData = {
                    ...shaderData,
                    name: `${shaderData.name} (Fork)`,
                    id: undefined,
                    visibility: 'private' as const
                };

                const result = await handleSave(forkedData);

                // Redirect to the new forked shader
                window.location.href = result.url;

                return result;
            } catch (error) {
                console.error('Fork failed:', error);
                throw error;
            }
        },
        [handleSave]
    );

    // Show error state if loading failed
    if (error) {
        return (
            <Box sx={containerStyle}>
                <div style={errorStyle}>{error}</div>
            </Box>
        );
    }

    // Show loading UI during initial load states
    if (!hasMounted || !convertedShaderData) {
        return (
            <Box sx={containerStyle}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    // Render the new standalone editor with full feature parity
    return (
        <StandaloneEditor
            shaderData={convertedShaderData}
            user={userData || undefined}
            onSave={handleSave}
            onDelete={handleDelete}
            onFork={handleFork}
            MetadataEditorComponent={MetadataEditorComponent}
            CommentsComponent={CommentsComponent}
            features={{
                texturePicker: true,
                uniformSliders: true,
                bufferControls: true,
                recording: true,
                profiler: true,
                vim: true,
                hotReload: true,
                timer: true,
                explainer: true,
                comments: true,
                metadata: true
            }}
        />
    );
}
