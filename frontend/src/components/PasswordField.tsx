import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface PasswordFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
}

const PasswordField = <T extends FieldValues>({
  control,
  name,
  label = "Password",
  placeholder = "Password",
}: PasswordFieldProps<T>) => {
  const [isShow, setIsShow] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative ">
              <Input
                type={isShow ? "text" : "password"}
                placeholder={placeholder}
                bg-transparent
                hover:bg-transparent
                {...field}
              />
              <Button
                type="button"
                className="absolute right-0 -translate-y-1/2 top-4.5 bg-transparent hover:bg-transparent"
                onClick={() => setIsShow(!isShow)}
              >
                {isShow ? (
                  <FaEye className="text-primary" />
                ) : (
                  <FaEyeSlash className=" text-gray-500" />
                )}
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PasswordField;
