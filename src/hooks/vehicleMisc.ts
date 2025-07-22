import { useFetchList } from './useFetchList';

export const useCities = () => useFetchList('/vehicle-misc/city', 'cities');
export const useHubs = () => useFetchList('/vehicle-misc/hub', 'hubs');
export const useVehicleTypes = () => useFetchList('/vehicle-misc/vehicle-type', 'vehicleTypes');
export const useOEMs = () => useFetchList('/vehicle-misc/oem', 'oems');
export const useVehicleModels = () => useFetchList('/vehicle-misc/vehicle-model', 'vehicleModels');
export const useBatteryTypes = () => useFetchList('/vehicle-misc/battery-type', 'batteryTypes');
export const useVehicleOwnerships = () => useFetchList('/vehicle-misc/vehicle-ownership', 'vehicleOwnerships');
export const useVehicleVendors = () => useFetchList('/vehicle-misc/vehicle-vendor', 'vehicleVendors');
export const useSupervisors = () => useFetchList('/user/supervisors', 'supervisors'); 