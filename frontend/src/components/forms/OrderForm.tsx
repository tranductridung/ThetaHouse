const OrderForm = () => {
  return <div>OrderForm</div>;
};

export default OrderForm;

// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormControl,
//   FormMessage,
//   FormLabel,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   createOrderFormSchema,
//   editOrderFormSchema,
//   type CreateOrderFormType,
//   type EditOrderFormType,
//   type OrderType,
// } from "../schemas/source";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// type OrderProps = {
//   type: "add" | "edit";
//   onSubmit: (formData: CreateOrderFormType | EditOrderFormType) => void;
//   orderData: OrderType | null;
//   discountList: Discounttype
// };

// const OrderForm = ({ onSubmit, type, orderData,discountList }: OrderProps) => {
//   const schema = type === "add" ? createOrderFormSchema : editOrderFormSchema;

//   const form = useForm<CreateOrderFormType | EditOrderFormType>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       note: orderData?.note,
//       totalAmount: orderData?.totalAmount,
//       finalAmount: orderData?.finalAmount,
//       discount: orderData?.discount,
//       customer: orderData?.customer,
//       quantity: orderData?.quantity,
//     },
//   });

//   return (
//     <>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//           <div className="flex flex-col items-center gap-2 text-center">
//             <h1 className="text-2xl font-bold">
//               {type === "add" ? "Create Order" : "Edit Order"}
//             </h1>
//           </div>
//           {/* discount customer: quantity: */}
//           {/* Note */}
//           <FormField
//             control={form.control}
//             name="note"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Name</FormLabel>
//                 <FormControl>
//                   <Input type="text" placeholder="Note" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Total Amount */}
//           <FormField
//             control={form.control}
//             name="totalAmount"
//             render={({ field }) => (
//               <FormItem className="w-full ">
//                 <FormLabel>Total Amount</FormLabel>
//                 <FormControl>
//                   <Input
//                     type="number"
//                     value={field.value ?? ""}
//                     onChange={(e) =>
//                       field.onChange(
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value)
//                       )
//                     }
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Final Amount */}
//           <FormField
//             control={form.control}
//             name="finalAmount"
//             render={({ field }) => (
//               <FormItem className="w-full ">
//                 <FormLabel>Final Amount</FormLabel>
//                 <FormControl>
//                   <Input
//                     type="number"
//                     value={field.value ?? ""}
//                     onChange={(e) =>
//                       field.onChange(
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value)
//                       )
//                     }
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Discount */}
//           <FormField
//   control={form.control}
//   name="discount.id"
//   render={({ field }) => (
//     <FormItem>
//       <FormLabel>Discount</FormLabel>
//       <Select
//         onValueChange={(selectedId) => {
//           const selectedDiscount = discountList.find(d => d.id.toString() === selectedId);
//           if (selectedDiscount) {
//             form.setValue("discount", selectedDiscount); // Lưu cả id và code
//           }
//         }}
//         value={field.value?.toString() ?? ""}
//       >
//         <FormControl>
//           <SelectTrigger>
//             <SelectValue placeholder="Select discount" />
//           </SelectTrigger>
//         </FormControl>
//         <SelectContent>
//           {discountList.map((discount) => (
//             <SelectItem key={discount.id} value={discount.id.toString()}>
//               {discount.code}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//       <FormMessage />
//     </FormItem>

//           {/* Customer */}
//           <FormField
//             control={form.control}
//             name="customer.fullName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Customer Name</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Enter customer name" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <Button type="submit" className="w-full">
//             {type === "add" ? "Create" : "Save"}
//           </Button>
//         </form>
//       </Form>
//     </>
//   );
// };
// export default OrderForm;
