type BaseFormManagerType = {
  isShow: boolean;
};

export type CombineFormManagerType<T> = BaseFormManagerType & {
  type: "add" | "edit";
  data: T | null;
};

export type CreateFormManagerType = BaseFormManagerType;

export type EditFormManagerType<T> = BaseFormManagerType & {
  data: T | null;
};

export type SelectedItemFormManagerType = BaseFormManagerType & {
  selectedItemId: number | null;
};
