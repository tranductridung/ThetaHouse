import type { CourseType } from "../schemas/course.schema";
import type { ServiceType } from "../schemas/service.schema";
import type { ProductType } from "../schemas/product.schema";
import { ProductList } from "./product.command";
import { ServiceList } from "./service.command";
import { CourseList } from "./course.command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type AddItemProps = {
  source: "Order" | "Consignment" | "Purchase";
  handleAddProduct: (product: ProductType) => void;
  handleAddService?: (service: ServiceType) => void;
  handleAddCourse?: (course: CourseType) => void;
};

const AddItemRow = ({
  source,
  handleAddProduct,
  handleAddService,
  handleAddCourse,
}: AddItemProps) => {
  if (source === "Order" && (!handleAddService || !handleAddCourse)) {
    throw new Error(
      "Order requires both handleAddService and handleAddCourse callbacks."
    );
  }

  return (
    <>
      {source === "Order" ? (
        <Tabs defaultValue="product" className="w-full">
          <TabsList>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="course">Course</TabsTrigger>
          </TabsList>
          <TabsContent value="product">
            <ProductList onSelect={handleAddProduct} />
          </TabsContent>
          <TabsContent value="service">
            <ServiceList onSelect={handleAddService!} />
          </TabsContent>
          <TabsContent value="course">
            <CourseList onSelect={handleAddCourse!} />
          </TabsContent>
        </Tabs>
      ) : (
        <ProductList onSelect={handleAddProduct} />
      )}
    </>
  );
};

export default AddItemRow;
