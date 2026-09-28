import { Suspense } from 'react';
import { InquiriesManager } from '@/components/admin/InquiriesManager';
import { ListSkeleton } from '@/components/admin/ui';

export default function Page() {
  return (
    <Suspense fallback={<ListSkeleton rows={5} />}>
      <InquiriesManager />
    </Suspense>
  );
}
