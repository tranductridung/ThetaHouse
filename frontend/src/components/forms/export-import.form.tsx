import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

type ExportImportFormProps = {
  onSubmit: (quantity: number) => void;
  maxQuantity: number;
};

const ExportImportForm = ({ onSubmit, maxQuantity }: ExportImportFormProps) => {
  const quantitySchema = z.object({
    quantity: z
      .number({ invalid_type_error: "Quantity must be a number" })
      .int("Quantity must be an integer")
      .min(1)
      .max(maxQuantity),
  });
  type QuantityFormData = z.infer<typeof quantitySchema>;

  const form = useForm<QuantityFormData>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const handleSubmit = (data: QuantityFormData) => {
    onSubmit(data.quantity);
  };

  const currentValue = form.watch("quantity");
  const percentage = currentValue
    ? Math.min((currentValue / maxQuantity) * 100, 100)
    : 0;

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold flex items-center gap-2">
                <Package className="w-4 h-4" />
                Quantity
              </FormLabel>
              <FormControl>
                <div className="relative w-full">
                  <Input
                    step="any"
                    type="number"
                    placeholder="Enter quantity"
                    className="w-full text-lg h-12 border-2 focus:ring-2 focus:ring-offset-1 transition-all"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </FormControl>

              {/* Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      percentage > 100
                        ? "bg-red-500"
                        : percentage > 75
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {Number(percentage.toFixed(0)) >= 0
                      ? percentage.toFixed(0)
                      : 0}
                    % of maximum
                  </span>
                  {(currentValue > maxQuantity || currentValue < 1) && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Exceeds limit
                    </span>
                  )}
                </div>
              </div>

              <FormDescription className="text-sm mt-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  Minimun quantity allowed: <strong>1</strong>
                </span>
              </FormDescription>

              <FormDescription className="text-sm mt-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  Maximum quantity allowed: <strong>{maxQuantity}</strong>
                </span>
              </FormDescription>
            </FormItem>
          )}
        />

        <Button
          onClick={form.handleSubmit(handleSubmit)}
          className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Submit Quantity
        </Button>
      </div>
    </Form>
  );
};

export default ExportImportForm;
