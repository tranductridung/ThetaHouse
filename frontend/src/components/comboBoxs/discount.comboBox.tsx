import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { DiscountType } from "../schemas/discount.schema";
import { formatCurrency } from "@/lib/utils";

export function DiscountComboBox({
  value,
  onChange,
}: {
  value: DiscountType | null | undefined;
  onChange: (discount: DiscountType | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(0);
  const [discounts, setDiscounts] = useState<DiscountType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const pageSize = 10;

  useEffect(() => {
    if (!open) return;
    setPage(0);
  }, [input, open]);

  // Fetch discount
  useEffect(() => {
    if (!open || isFetching.current || (!hasMore && page > 0)) return;

    const fetchDiscounts = async () => {
      isFetching.current = true;
      try {
        const url = `/discounts?page=${page}&limit=${pageSize}&search=${input}`;

        const res = await api.get(url);
        const items: DiscountType[] = res.data.discounts || [];

        setDiscounts((prev) => (page === 0 ? items : [...prev, ...items]));
        setHasMore(items.length === pageSize);
      } catch (err) {
        console.error("Failed to fetch discounts:", err);
      } finally {
        isFetching.current = false;
      }
    };

    fetchDiscounts();
  }, [page, open, input]);

  useEffect(() => {
    if (value && open) {
      const exists = discounts.some((p) => p.id === value.id);
      if (!exists) {
        setDiscounts((prev) => [value, ...prev]);
      }
    }
  }, [value, open, discounts]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (isBottom && hasMore && !isFetching.current) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setInput("");
          setPage(0);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {value ? `${value.name} (${value.code})` : "Discount (Optional)"}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Finding..."
            value={input}
            onValueChange={(v) => {
              setInput(v);
              setPage(0);
            }}
          />
          <CommandEmpty>Discount not found</CommandEmpty>

          <div
            onScroll={handleScroll}
            className="max-h-[250px] overflow-y-auto"
          >
            <CommandGroup heading="Discounts">
              <CommandItem
                value="none"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    !value ? "opacity-100" : "opacity-0"
                  }`}
                />
                None
              </CommandItem>

              {discounts.map((discount) => (
                <CommandItem
                  key={discount.id}
                  value={discount.id.toString()}
                  onSelect={() => {
                    onChange(discount);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value?.id === discount.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="flex flex-col">
                    <div className="flex flex-row gap-10 font-medium">
                      {discount.name} ({discount.code}):{" "}
                      {discount.type === "Percentage"
                        ? `${discount.value}%`
                        : formatCurrency(discount.value)}
                    </div>

                    <div className="flex flex-row gap-5 text-gray-500">
                      {discount.minTotalValue > 0 && (
                        <span>
                          Min: {formatCurrency(discount.minTotalValue)}
                        </span>
                      )}
                      {discount.maxDiscountAmount > 0 && (
                        <span>
                          Max: {formatCurrency(discount.maxDiscountAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
