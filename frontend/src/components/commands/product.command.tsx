import { useEffect, useRef, useState } from "react";
import api from "@/api/api";
import type { ProductType } from "../schemas/product.schema";
import { toast } from "sonner";

export function ProductList({
  onSelect,
}: {
  onSelect: (product: ProductType) => void;
}) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const pageSize = 10;

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    if (isFetching.current || !hasMore) return;
    isFetching.current = true;
    try {
      console.log("hello");
      const res = await api.get(`/products?page=${page}&limit=${pageSize}`);
      const items: ProductType[] = res.data.products || [];

      setProducts((prev) => [...prev, ...items]);
      setHasMore(items.length === pageSize);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      isFetching.current = false;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20 && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="h-[95%] overflow-y-auto border rounded p-2 space-y-2"
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="p-2 border rounded cursor-pointer hover:bg-muted"
          onClick={() => onSelect(product)}
        >
          <div className="font-medium">
            {product.name} - {product.quantity}
          </div>
          <div className="text-sm text-muted-foreground">
            {product.description}
          </div>
        </div>
      ))}

      {!hasMore && (
        <div className="text-center text-muted-foreground text-sm py-2">
          No more products
        </div>
      )}
    </div>
  );
}
