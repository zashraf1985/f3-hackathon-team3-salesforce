import { NextResponse } from 'next/server';
import { logger, LogCategory } from 'agentdock-core';
import { templates } from '@/generated/templates';

// Use edge runtime for fastest response
export const runtime = 'edge';

// Cache templates for 1 hour, allow stale while revalidating for 24 hours
export const revalidate = 3600;

export async function GET() {
  try {
    // Use bundled templates directly - fastest possible source
    const templateArray = Object.values(templates);
    
    await logger.debug(
      LogCategory.API,
      'TemplatesRoute',
      'Returning bundled templates',
      { count: templateArray.length }
    );
    
    // Return with aggressive caching headers
    return new NextResponse(JSON.stringify(templateArray), {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    await logger.error(
      LogCategory.API,
      'TemplatesRoute',
      'Error returning templates',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    return NextResponse.json([], { status: 500 });
  }
} 