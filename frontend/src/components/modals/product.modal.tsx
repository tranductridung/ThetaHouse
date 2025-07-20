import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import ProductForm from "../forms/product.form";
import type { CombineFormManagerType } from "@/types/form";
import type {
  CreateProductFormType,
  EditProductFormType,
  ProductType,
} from "@/components/schemas/product.schema";

type ProductModalProps = {
  formManager: CombineFormManagerType<ProductType>;
  handleSubmit: (formData: CreateProductFormType | EditProductFormType) => void;
  onClose: () => void;
};

const ProductModal = ({
  formManager,
  onClose,
  handleSubmit,
}: ProductModalProps) => {
  return (
    <Dialog
      open={formManager.isShow}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogTitle></DialogTitle>
        <ProductForm
          productData={formManager.data}
          onSubmit={handleSubmit}
          type={formManager.type}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
