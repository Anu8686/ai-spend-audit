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

  return {
    title: `AI Spend Audit Report ${id}`,
    description: 'AI Spend Audit Report',
  };
}

export default async function ReportPage(
  { params }: Props
) {
  const { id } = await params;

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-4">
          Report {id}
        </h1>
        <p>
          Report page loaded successfully.
        </p>
      </div>
    </main>
  );
}