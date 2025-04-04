import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { PortfolioAnalysisService } from '@/app/services/portfolioAnalysis';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get session without passing cookieStore
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysisService = new PortfolioAnalysisService(session.user.sub);

    // Get all portfolio metrics in parallel
    const [metrics, riskMetrics, allocation] = await Promise.all([
      analysisService.getPortfolioMetrics(),
      analysisService.getRiskMetrics(),
      analysisService.getAssetAllocation(),
    ]);

    return NextResponse.json({
      metrics,
      riskMetrics,
      allocation,
    });
  } catch (error) {
    console.error('Error in portfolio analysis route:', error);
    return NextResponse.json(
      { error: 'Failed to get portfolio analysis' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get session without passing cookieStore
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysisService = new PortfolioAnalysisService(session.user.sub);
    await analysisService.clearCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing portfolio cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear portfolio cache' },
      { status: 500 }
    );
  }
} 