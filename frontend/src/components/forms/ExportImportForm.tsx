// ExportImportForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CardContent } from "@/components/ui/card";

const quantitySchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});

type QuantityFormData = z.infer<typeof quantitySchema>;

type ExportImportFormProps = {
  onSubmit: (quantity: number) => void;
};

const ExportImportForm = ({ onSubmit }: ExportImportFormProps) => {
  const form = useForm<QuantityFormData>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const handleSubmit = (data: QuantityFormData) => {
    onSubmit(data.quantity);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <CardContent className="flex items-center justify-between">
          <label htmlFor="quantity">Quantity:</label>
          <Input
            id="quantity"
            type="number"
            min={1}
            className="w-24"
            {...form.register("quantity", { valueAsNumber: true })}
          />
        </CardContent>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default ExportImportForm;
