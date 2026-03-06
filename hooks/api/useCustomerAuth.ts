import { Customer, CustomerCreateInput } from "@/types/CustomerAccountType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const createUser = async (
  customerData: CustomerCreateInput,
): Promise<Customer> => {
  const response = await fetch("/api/auth/customer/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export const useCustomerSignup = () => {
  const queryClient = useQueryClient();

  return useMutation<Customer, { error: string }, CustomerCreateInput>({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Account created successfully!");
    },
    onError: (error) => {
      toast.error(
        error.error ?? "Failed to create an account!",
      );
    },
  });
};

const loginUser = async (authData: Omit<CustomerCreateInput, "phone" | "fullname">) => {
    const response = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(authData)
    });
    const data = await response.json();
    if(!response.ok) throw data;
    return data;
}

export const useCustomerLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["customers"]});
            toast.success("Login Successfully!")
        },
        onError: (error: any) =>{
            toast.error(error.error ?? "Failed to login!")
        }
    }) 
}
