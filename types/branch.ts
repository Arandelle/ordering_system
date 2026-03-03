// types/branch.ts
export type BranchAddress = {
  street: string;
  city: string;
  zipCode?: string;
};

export type OperatingHours = {
  open: string;
  close: string;
  daysOpen: string[];
};

export type Branch = {
  _id: string;
  name: string;
  code: string;
  address: BranchAddress;
  contactNumber?: string;
  operatingHours: OperatingHours;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BranchFormData = {
  name: string;
  street: string;
  city: string;
  zipCode?: string;
  contactNumber?: string;
  open: string;
  close: string;
  daysOpen: string[];
};

export type BranchFormErrors = Partial<Record<keyof BranchFormData, string>>;