import { getShadersList } from 'lib/list';
import { createClient } from 'lib/supabase/server';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: Promise<{ page: string }> }) {
    const page = Number((await params).page) || 1;

    const supabase = await createClient();
    const result = await getShadersList(supabase, page);

    if (page < 1 || page > result.numPages || Number.isNaN(page)) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const shaders = result.shaders.map(shader => ({
        ...shader,
        thumb_url: shader.thumb_url ? getFullyQualifiedSupabaseBucketURL(shader.thumb_url) : null,
        profile: shader.profile
            ? {
                  ...shader.profile,
                  avatar_url: shader.profile.avatar_url
                      ? getFullyQualifiedSupabaseBucketURL(shader.profile.avatar_url, true)
                      : null
              }
            : null
    }));

    return NextResponse.json({
        shaders,
        totalCount: result.totalCount,
        numPages: result.numPages,
        currentPage: page,
        error: result.error?.message
    });
}
