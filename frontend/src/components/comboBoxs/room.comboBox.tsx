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

type RoomOption = {
  id: number;
  name: string;
};

export function RoomComboBox({
  value,
  onChange,
}: {
  value: RoomOption | null | undefined;
  onChange: (room: RoomOption | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(0);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const pageSize = 10;

  useEffect(() => {
    if (!open) return;
    setPage(0);
  }, [input, open]);

  useEffect(() => {
    if (!open || isFetching.current || (!hasMore && page > 0)) return;

    const fetchRooms = async () => {
      isFetching.current = true;
      try {
        const res = await api.get(
          `/rooms?page=${page}&limit=${pageSize}&search=${input}`
        );
        const items: RoomOption[] = res.data.rooms || [];

        setRooms((prev) => (page === 0 ? items : [...prev, ...items]));
        setHasMore(items.length === pageSize);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        isFetching.current = false;
      }
    };

    fetchRooms();
  }, [page, open, input]);

  useEffect(() => {
    if (value && open) {
      const exists = rooms.some((p) => p.id === value.id);
      if (!exists) {
        setRooms((prev) => [value, ...prev]);
      }
    }
  }, [value, open, rooms]);

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
          {value ? value.name : `Choose room`}
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
          <CommandEmpty>Room not found</CommandEmpty>

          <div
            onScroll={handleScroll}
            className="max-h-[250px] overflow-y-auto"
          >
            <CommandGroup heading="Rooms">
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

              {rooms.map((room) => (
                <CommandItem
                  key={room.id}
                  value={room.id.toString()}
                  onSelect={() => {
                    onChange(room);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value?.id === room.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {room.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
