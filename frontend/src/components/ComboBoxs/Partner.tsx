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
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

type PartnerOption = {
  id: number;
  fullName: string;
};

export function PartnerComboBox({
  value,
  onChange,
  type,
}: {
  value: PartnerOption | null;
  onChange: (partner: PartnerOption | null) => void;
  type: "Customer" | "Supplier";
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(0);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const pageSize = 10;

  // Reset page khi input hoặc open thay đổi
  useEffect(() => {
    if (!open) return;
    setPage(0);
  }, [input, open]);

  // Fetch partner
  useEffect(() => {
    if (!open || isFetching.current || (!hasMore && page > 0)) return;

    const fetchPartners = async () => {
      isFetching.current = true;
      try {
        const url = `/partners/${
          type === "Customer" ? "customer" : "supplier"
        }?page=${page}&limit=${pageSize}&search=${input}`;
        const res = await api.get(url);
        const items: PartnerOption[] = res.data.partners || [];

        setPartners((prev) => (page === 0 ? items : [...prev, ...items]));
        setHasMore(items.length === pageSize);
      } catch (err) {
        console.error("Failed to fetch partners:", err);
      } finally {
        isFetching.current = false;
      }
    };

    fetchPartners();
  }, [page, open, input]);

  useEffect(() => {
    if (value && open) {
      const exists = partners.some((p) => p.id === value.id);
      if (!exists) {
        setPartners((prev) => [value, ...prev]);
      }
    }
  }, [value, open, partners]);

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
          {value ? value.fullName : `Choose ${type}`}
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
          <CommandEmpty>Partner not found</CommandEmpty>

          <div
            onScroll={handleScroll}
            className="max-h-[250px] overflow-y-auto"
          >
            <CommandGroup heading="Partners">
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

              {partners.map((partner) => (
                <CommandItem
                  key={partner.id}
                  value={partner.fullName}
                  onSelect={() => {
                    onChange(partner);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value?.id === partner.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {partner.fullName}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
