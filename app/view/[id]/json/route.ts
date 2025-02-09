import { createClient } from 'lib/supabase/server';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
import { fetchShader } from 'lib/view/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const shader = await fetchShader(supabase, parseInt(id));

    if (!shader) {
        return NextResponse.json({ error: 'Shader not found' }, { status: 404 });
    }

    const { code, ...bodyWithoutCode } = JSON.parse(shader.body);

    return NextResponse.json({
        ...shader,
        thumb_url: shader.thumb_url ? getFullyQualifiedSupabaseBucketURL(shader.thumb_url) : null,
        profile: shader.profile
            ? {
                  ...shader.profile,
                  avatar_url: shader.profile.avatar_url
                      ? getFullyQualifiedSupabaseBucketURL(shader.profile.avatar_url, true)
                      : null
              }
            : null,
        body: bodyWithoutCode
    });
}
