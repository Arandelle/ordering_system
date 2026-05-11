import {
  OrderParams,
  useOrderBase,
  useOrdersBase,
  useUpdateOrder,
} from "../shared/useOrdersBase";

const userType = "admin"

export const useAdminOrders = (params?: OrderParams) => {
  return useOrdersBase(userType, params);
};

export const useAdminOrder = (id: string) => {
  return useOrderBase(userType, id);
};

/**
 * Update order status with validation
 * Uses STATUS_TRANSITIONS from constants for safety
 */

export const useAdminUpdateOrder = () => {
  return useUpdateOrder(userType);
};
