import { ProductForm } from '@/components/admin/ProductForm';

export default function Page({ params }: { params: { id: string } }) {
  return <ProductForm productId={params.id} />;
}
