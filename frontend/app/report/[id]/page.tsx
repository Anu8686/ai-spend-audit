import { Metadata } from 'next';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    'https://api.aispendaudit.com';

  let savings = 0;
  let annual = 0;

  try {
    const res = await fetch(
      `${apiUrl}/api/report/${id}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      savings = data.total_monthly_savings ?? 0;
      annual = data.total_annual_savings ?? 0;
    }
  } catch {}

  const title =
    savings > 0
      ? `AI Spend Audit — $${savings}/mo savings found ($${annual.toLocaleString()}/yr)`
      : 'AI Spend Audit — Free AI Cost Analysis';

  const description =
    'Discover hidden savings across ChatGPT, Claude, Cursor, Copilot, Gemini and more. Run your free audit in 2 minutes.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://aispendaudit.com/report/${id}`,
      images: [
        {
          url: `https://aispendaudit.com/og/report?id=${id}&savings=${savings}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ReportPage(
  { params }: Props
) {
  const { id } = await params;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    'https://api.aispendaudit.com';

  let report: any = null;

  try {
    const res = await fetch(
      `${apiUrl}/api/report/${id}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (res.ok) {
      report = await res.json();
    }
  } catch {}

  // Keep the rest of your existing component code unchanged below this point