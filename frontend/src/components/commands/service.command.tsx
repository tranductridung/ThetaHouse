import { useEffect, useRef, useState } from "react";
import api from "@/api/api";
import type { ServiceType } from "../schemas/service.schema";
import { toast } from "sonner";

export function ServiceList({
  onSelect,
}: {
  onSelect: (service: ServiceType) => void;
}) {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const pageSize = 10;

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServices();
  }, [page]);

  const fetchServices = async () => {
    if (isFetching.current || !hasMore) return;
    isFetching.current = true;
    try {
      const res = await api.get(`/services?page=${page}&limit=${pageSize}`);
      const items: ServiceType[] = res.data.services || [];

      setServices((prev) => [...prev, ...items]);
      setHasMore(items.length === pageSize);
    } catch (err) {
      toast.error("Failed to fetch services");
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
      {services.map((service) => (
        <div
          key={service.id}
          className="p-2 border rounded cursor-pointer hover:bg-muted"
          onClick={() => onSelect(service)}
        >
          <div className="font-medium">{service.name}</div>
          <div className="text-sm text-muted-foreground">
            {service.description}
          </div>
        </div>
      ))}

      {!hasMore && (
        <div className="text-center text-muted-foreground text-sm py-2">
          No more services
        </div>
      )}
    </div>
  );
}
