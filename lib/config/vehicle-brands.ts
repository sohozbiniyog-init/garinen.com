export const VEHICLE_BRANDS = [
  'Audi',
  'BMW',
  'Chevrolet',
  'Ford',
  'GMC',
  'Honda',
  'Hyundai',
  'Kia',
  'Lexus',
  'Mazda',
  'Mercedes-Benz',
  'Mitsubishi',
  'Nissan',
  'Suzuki',
  'Tata',
  'Toyota',
] as const;

export type VehicleBrand = (typeof VEHICLE_BRANDS)[number];
