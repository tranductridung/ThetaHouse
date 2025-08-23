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
      <Tabs defaultValue="product" className="w-full h-[95%]">
        <TabsList className="w-full">
          <TabsTrigger value="product">Product</TabsTrigger>
          {source === "Order" && (
            <>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="course">Course</TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="product" className="h-full">
          <ProductList onSelect={handleAddProduct} />
        </TabsContent>
        {source === "Order" && (
          <>
            <TabsContent value="service" className="h-full">
              <ServiceList onSelect={handleAddService!} />
            </TabsContent>
            <TabsContent value="course" className="h-full">
              <CourseList onSelect={handleAddCourse!} />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* {source === "Order" ? (
        <Tabs defaultValue="product" className="w-full h-[95%]">
          <TabsList>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="course">Course</TabsTrigger>
          </TabsList>
          <TabsContent value="product" className="h-full">
            <ProductList onSelect={handleAddProduct} />
          </TabsContent>
          <TabsContent value="service" className="h-full">
            <ServiceList onSelect={handleAddService!} />
          </TabsContent>
          <TabsContent value="course" className="h-full">
            <CourseList onSelect={handleAddCourse!} />
          </TabsContent>
        </Tabs>
      ) : (
        <ProductList onSelect={handleAddProduct} />
      )} */}
    </>
  );
};

export default AddItemRow;
