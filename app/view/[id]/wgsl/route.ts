import { createClient } from 'lib/supabase/server';
import { fetchShader } from 'lib/view/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const shader = await fetchShader(supabase, parseInt(id));

    if (!shader) {
        return new NextResponse('Shader not found', { status: 404 });
    }

    const parsedBody = JSON.parse(shader.body);
    const code = JSON.parse(parsedBody.code);

    return new NextResponse(code, {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}
