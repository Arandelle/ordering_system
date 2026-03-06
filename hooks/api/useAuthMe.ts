import { Customer } from "@/types/CustomerAccountType"
import { useQuery } from "@tanstack/react-query"

export const useCustomerMe = () =>{
    return useQuery<Customer>({
        queryKey: ["customers"],
        queryFn: async () =>{
            const response = await fetch("/api/auth/customer/me");
            const data = await response.json();
            if(!response.ok) throw data;
            return data;
        },
        retry: false, // don't retry on 401
        staleTime: 1000 * 60 * 5 // cache for 5 mins
    })
};