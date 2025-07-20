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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import api from "@/api/api";
import { useEffect, useRef, useState } from "react";
import type { ModuleType } from "../schemas/module.schema";

export function MultiModuleComboBox({
  selectedModules,
  onChange,
}: {
  selectedModules: ModuleType[];
  onChange: (modules: ModuleType[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(0);
  const [modules, setModules] = useState<ModuleType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const pageSize = 10;

  useEffect(() => {
    if (!open) return;
    setPage(0);
    setModules([]);
    setHasMore(true);
  }, [input]);

  useEffect(() => {
    if (!open || isFetching.current || !hasMore) return;

    const fetchModules = async () => {
      isFetching.current = true;
      try {
        const query = input ? `&search=${encodeURIComponent(input)}` : "";
        const res = await api.get(
          `/modules?page=${page}&limit=${pageSize}${query}`
        );
        const items: ModuleType[] = res.data.modules || [];

        setModules((prev) => (page === 0 ? items : [...prev, ...items]));
        setHasMore(items.length === pageSize);
      } catch (err) {
        console.error("Fetch modules failed:", err);
      } finally {
        isFetching.current = false;
      }
    };

    fetchModules();
  }, [page, open, input]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (
      el.scrollTop + el.clientHeight >= el.scrollHeight - 20 &&
      hasMore &&
      !isFetching.current
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const toggleModule = (module: ModuleType) => {
    const exists = selectedModules.find((r) => r.id === module.id);
    if (exists) {
      onChange(selectedModules.filter((r) => r.id !== module.id));
    } else {
      onChange([...selectedModules, module]);
    }
  };

  const renderSelectedModules = () => {
    if (selectedModules.length === 0) return "Choose modules";
    if (selectedModules.length <= 3)
      return selectedModules.map((r) => r.name).join(", ");
    return (
      selectedModules
        .slice(0, 3)
        .map((r) => r.name)
        .join(", ") + ` +${selectedModules.length - 3} more`
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {renderSelectedModules()}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search modules..."
            value={input}
            onValueChange={setInput}
          />
          <CommandEmpty>No modules found</CommandEmpty>
          <div
            className="max-h-[300px] overflow-y-auto"
            onScroll={handleScroll}
          >
            <CommandGroup>
              {modules.map((module) => {
                const isSelected = selectedModules.some(
                  (r) => r.id === module.id
                );
                return (
                  <CommandItem
                    key={module.id}
                    value={module.name}
                    onSelect={() => toggleModule(module)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {module.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
