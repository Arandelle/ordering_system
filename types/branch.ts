// types/branch.ts
export type Location = {
  type: "Point";
  coordinates: [number, number] // [longitude, latitude] - GeoJSON format
}

export type Branch = {
  _id: string;
  name: string;
  code: string;
  address: string;
  location: Location,
  isActive: boolean;
  openingSoon: boolean;
  maxActiveOrders: number | null;
  isBusy: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BranchFormData = {
  name: string;
  address: string;
  location?: {
    latitude: string;
    longitude: string
  }
  openingSoon: boolean;
  isBusy: boolean;
  maxActiveOrders: number | null;
};

export type BranchFormErrors = Partial<Record<keyof BranchFormData | "location", string>>;