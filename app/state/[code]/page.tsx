import { notFound } from 'next/navigation';
import { isStateCode, type StateCode } from '@/lib/states';
import StatePageClient from '@/components/StatePageClient';

export default function StateRoutePage({ params }: { params: { code: string } }) {
  const upper = params.code?.toUpperCase() ?? '';
  if (!isStateCode(upper)) notFound();
  return <StatePageClient code={upper as StateCode} />;
}
