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

type UserOption = {
  id: number;
  fullName: string;
};

export function UserComboBox({
  value,
  onChange,
}: {
  value: UserOption | null | undefined;
  onChange: (user: UserOption | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const pageSize = 10;

  // Reset page khi input hoặc open thay đổi
  useEffect(() => {
    if (!open) return;
    setPage(0);
  }, [input, open]);

  // Fetch user
  useEffect(() => {
    if (!open || isFetching.current || (!hasMore && page > 0)) return;

    const fetchUsers = async () => {
      isFetching.current = true;
      try {
        const res = await api.get(
          `/users?page=${page}&limit=${pageSize}&search=${input}`
        );
        console.log("ressss", res);
        const items: UserOption[] = res.data.users || [];

        setUsers((prev) => (page === 0 ? items : [...prev, ...items]));
        setHasMore(items.length === pageSize);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        isFetching.current = false;
      }
    };

    fetchUsers();
  }, [page, open, input]);

  useEffect(() => {
    if (value && open) {
      const exists = users.some((p) => p.id === value.id);
      if (!exists) {
        setUsers((prev) => [value, ...prev]);
      }
    }
  }, [value, open, users]);

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
          {value ? value.fullName : `Choose user`}
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
          <CommandEmpty>User not found</CommandEmpty>

          <div
            onScroll={handleScroll}
            className="max-h-[250px] overflow-y-auto"
          >
            <CommandGroup heading="Users">
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

              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id.toString()}
                  onSelect={() => {
                    onChange(user);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value?.id === user.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {user.fullName}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
