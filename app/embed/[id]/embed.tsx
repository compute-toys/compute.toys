'use client';
/**
 * New embed component using the standalone editor
 * This replaces the old embed.tsx with full feature parity
 */

import { useShader } from 'lib/view/client';
import { Shader } from 'lib/view/server';
import { useEffect, useState } from 'react';
import StandaloneEditor from '../../../standalone-editor/src/StandaloneEditor';
import { ShaderData } from '../../../standalone-editor/src/types';

interface EmbedProps {
    id: number;
    shader: Shader;
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

export default function EmbedShader({ shader }: EmbedProps) {
    const [convertedShaderData, setConvertedShaderData] = useState<ShaderData | null>(null);

    // Convert shader data format
    useEffect(() => {
        try {
            const converted = convertShaderToStandaloneFormat(shader);
            setConvertedShaderData(converted);
        } catch (err) {
            console.error('Error converting shader data:', err);
        }
    }, [shader]);

    // Initialize with shader data (keeps existing behavior)
    useShader(shader);

    if (!convertedShaderData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <style>{`
                body { overflow: hidden; }
            `}</style>
            <StandaloneEditor
                shaderData={convertedShaderData}
                embed={true}
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
                    comments: false, // No comments in embed mode
                    metadata: false // No metadata editor in embed mode
                }}
            />
        </div>
    );
}
