import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addProductColumns } from "@/components/columns/add-product-column";
import { addServiceColumns } from "@/components/columns/add-service-column";
import { DataTable } from "@/components/data-table";
import type { ProductType } from "@/components/schemas/product";
import type { ServiceType } from "@/components/schemas/service";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
type CreateItemRowProps = {
  isService: boolean;
  handleAddProduct: (product: ProductType) => void;
  handleAddService: (service: ServiceType) => void;
};

const CreateItemRow = ({
  isService,
  handleAddProduct,
  handleAddService,
}: CreateItemRowProps) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          `/products?page=${pageIndex}&limit=${pageSize}`
        );
        setProducts(response.data.products);
        setTotal(response.data.total);

        if (isService) {
          const response = await api.get(
            `/services?page=${pageIndex}&limit=${pageSize}`
          );
          setServices(response.data.services);
          setTotal(response.data.total);
        }
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchData();
  }, [pageIndex, pageSize]);
  return (
    <div>
      {isService ? (
        <Tabs defaultValue="product">
          <TabsList>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
          </TabsList>
          <TabsContent value="product">
            <DataTable
              onAdd={undefined}
              columns={addProductColumns({
                handleAddProduct,
              })}
              data={products}
              total={total}
              pageIndex={pageIndex}
              pageSize={pageSize}
              setPageIndex={setPageIndex}
              setPageSize={setPageSize}
            />
          </TabsContent>
          <TabsContent value="service">
            <DataTable
              onAdd={undefined}
              columns={addServiceColumns({
                handleAddService,
              })}
              data={services}
              total={total}
              pageIndex={pageIndex}
              pageSize={pageSize}
              setPageIndex={setPageIndex}
              setPageSize={setPageSize}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <DataTable
          onAdd={undefined}
          columns={addProductColumns({
            handleAddProduct,
          })}
          data={products}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
        />
      )}
    </div>
  );
};
export default CreateItemRow;
