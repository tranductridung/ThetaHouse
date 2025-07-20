import type {
  CombineFormManagerType,
  CreateFormManagerType,
  EditFormManagerType,
  SelectedItemFormManagerType,
} from "@/types/form";
import { useState } from "react";

export const useCombineFormManager = <T>() => {
  const [formManager, setFormManager] = useState<CombineFormManagerType<T>>({
    isShow: false,
    type: "add",
    data: null,
  });

  const onAdd = () => {
    setFormManager({
      isShow: true,
      type: "add",
      data: null,
    });
  };

  const onEdit = (data: T) => {
    setFormManager({
      isShow: true,
      type: "edit",
      data,
    });
  };

  const onClose = () => {
    setFormManager({
      isShow: false,
      type: "add",
      data: null,
    });
  };

  return {
    formManager,
    setFormManager,
    onAdd,
    onEdit,
    onClose,
  };
};

export const useCreateFormManager = () => {
  const [formManager, setFormManager] = useState<CreateFormManagerType>({
    isShow: false,
  });

  const onAdd = () => {
    setFormManager({
      isShow: true,
    });
  };

  const onClose = () => {
    setFormManager({
      isShow: false,
    });
  };

  return {
    formManager,
    setFormManager,
    onAdd,
    onClose,
  };
};

export const useEditFormManager = <T>() => {
  const [formManager, setFormManager] = useState<EditFormManagerType<T>>({
    isShow: false,
    data: null,
  });

  const onEdit = (data: T) => {
    setFormManager({
      isShow: true,
      data,
    });
  };

  const onClose = () => {
    setFormManager({
      isShow: false,
      data: null,
    });
  };

  return {
    formManager,
    setFormManager,
    onEdit,
    onClose,
  };
};

export const useSelectedItemFormManager = () => {
  const [formManager, setFormManager] = useState<SelectedItemFormManagerType>({
    selectedItemId: null,
    isShow: false,
  });

  const onAdd = (id: number) => {
    setFormManager({
      selectedItemId: id,
      isShow: true,
    });
  };

  const onClose = () => {
    setFormManager({
      isShow: false,
      selectedItemId: null,
    });
  };

  return {
    formManager,
    setFormManager,
    onAdd,
    onClose,
  };
};
