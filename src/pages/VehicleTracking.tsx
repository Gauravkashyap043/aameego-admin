import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  FiMapPin, 
  FiBattery, 
  FiZap, 
  FiNavigation, 
  FiClock, 
  FiThermometer,
  FiActivity,
  FiArrowLeft,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiMaximize2,
  FiMinimize2,
  FiTruck
} from 'react-icons/fi';

// Dummy data based on API response structure
const dummyLocationData = {
  status: "SUCCESS",
  data: {
    commtime: "1704067200000", // UTC epoch
    lat: "28.6139",
    lng: "77.2090",
    alti: "216",
    devbattery: "3.7",
    vehbattery: "48.2",
    speed: "25",
    heading: "180",
    ignstatus: "1",
    mobili: "0", // 0 = mobilized, 1 = immobilized
    dout_1: "1",
    dout_2: "0"
  },
  err: null,
  msg: "Data retrieved successfully"
};

// New dummy data for Distance API
const dummyDistanceData = {
  status: "SUCCESS",
  data: {
    startodo: "1250.5",
    endodo: "1287.3",
    starttime: "1704060000000",
    endtime: "1704067200000",
    lastignon: "1704060000000",
    lastignoff: "1704067200000",
    distance: "36.8",
    startLoc: ["28.6150", "77.2080"],
    endLoc: ["28.6139", "77.2090"]
  },
  err: null,
  msg: "Distance data retrieved successfully"
};

const dummyDistanceBulkData = {
  status: "SUCCESS",
  data: [
    {
      distance: "36.8",
      vehicleno: "DL01AB1234"
    },
    {
      distance: "42.1",
      vehicleno: "DL01AB1235"
    },
    {
      distance: "28.9",
      vehicleno: "DL01AB1236"
    }
  ],
  err: null,
  msg: "Bulk distance data retrieved successfully"
};

// New dummy data for Fuel API
const dummyFuelHistory = {
  status: "SUCCESS",
  data: [
    {
      time: "1704067200000",
      value: "85.2"
    },
    {
      time: "1704063600000",
      value: "87.1"
    },
    {
      time: "1704060000000",
      value: "89.5"
    },
    {
      time: "1704056400000",
      value: "91.2"
    },
    {
      time: "1704052800000",
      value: "92.8"
    }
  ],
  err: null,
  msg: "Fuel history retrieved successfully"
};

const dummyFuelUsed = {
  status: "SUCCESS",
  data: {
    fuelused: "12.5",
    starttime: "1704060000000",
    endtime: "1704067200000",
    startfl: "92.8",
    endfl: "85.2",
    startfl_litres: "45.6",
    endfl_litres: "33.1",
    lastignon: "1704060000000",
    lastignoff: "1704067200000",
    refueling_events: [
      {
        time: "1704063600000",
        fuel_added: "5.2",
        fuel_level_before: "87.1",
        fuel_level_after: "92.3"
      }
    ]
  },
  err: null,
  msg: "Fuel usage data retrieved successfully"
};

const dummyLastFuelStatus = {
  status: "SUCCESS",
  data: {
    fueltime: "1704067200000",
    fuellevel: "85.2",
    fuellevellitres: "33.1"
  },
  err: null,
  msg: "Last fuel status retrieved successfully"
};

const dummyCANData = {
  status: "SUCCESS",
  data: {
    soc: {
      value: "85",
      timestamp: "1704067200000"
    },
    battery_temp: {
      value: "32.5",
      timestamp: "1704067200000"
    },
    battery_voltage: {
      value: "48.2",
      timestamp: "1704067200000"
    },
    current: {
      value: "2.1",
      timestamp: "1704067200000"
    },
    motor_temperature: {
      value: "45.2",
      timestamp: "1704067200000"
    }
  },
  err: null,
  msg: "CAN data retrieved successfully"
};

const dummyBatteryHistory = {
  status: "SUCCESS",
  data: [
    {
      soc: "85",
      soh: "92",
      battery_temp: "32.5",
      battery_voltage: "48.2",
      charge_cycle: "45",
      current: "2.1",
      time: "1704067200000"
    },
    {
      soc: "83",
      soh: "92",
      battery_temp: "33.1",
      battery_voltage: "47.8",
      charge_cycle: "45",
      current: "2.3",
      time: "1704063600000"
    },
    {
      soc: "80",
      soh: "92",
      battery_temp: "34.2",
      battery_voltage: "47.2",
      charge_cycle: "45",
      current: "2.5",
      time: "1704060000000"
    }
  ],
  err: null,
  msg: "Battery history retrieved successfully"
};

const dummyLocationHistory = {
  status: "SUCCESS",
  data: [
    {
      commtime: "1704067200000",
      lat: "28.6139",
      lng: "77.2090",
      alti: "216",
      devbattery: "3.7",
      vehbattery: "48.2",
      speed: "25",
      heading: "180",
      ignstatus: "1",
      mobili: "0"
    },
    {
      commtime: "1704063600000",
      lat: "28.6145",
      lng: "77.2085",
      alti: "215",
      devbattery: "3.8",
      vehbattery: "48.5",
      speed: "30",
      heading: "175",
      ignstatus: "1",
      mobili: "0"
    },
    {
      commtime: "1704060000000",
      lat: "28.6150",
      lng: "77.2080",
      alti: "214",
      devbattery: "3.9",
      vehbattery: "48.8",
      speed: "28",
      heading: "170",
      ignstatus: "1",
      mobili: "0"
    }
  ],
  err: null,
  msg: "Location history retrieved successfully"
};

const VehicleTracking: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  
  // State for tracking data
  const [locationData, setLocationData] = useState(dummyLocationData);
  const [canData, setCanData] = useState(dummyCANData);
  const [batteryHistory, setBatteryHistory] = useState(dummyBatteryHistory);
  const [locationHistory, setLocationHistory] = useState(dummyLocationHistory);
  
  // New state for distance and fuel data
  const [distanceData, setDistanceData] = useState(dummyDistanceData);
  const [distanceBulkData, setDistanceBulkData] = useState(dummyDistanceBulkData);
  const [fuelHistory, setFuelHistory] = useState(dummyFuelHistory);
  const [fuelUsed, setFuelUsed] = useState(dummyFuelUsed);
  const [lastFuelStatus, setLastFuelStatus] = useState(dummyLastFuelStatus);
  
  // UI state
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'location' | 'battery' | 'history' | 'distance' | 'fuel'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Dummy vehicle data (in real app, this would come from props or API)
  const vehicle = {
    id: vehicleId || '1',
    vehicleNumber: 'DL01AB1234',
    vehicleModel: 'Motovolt M7',
    evType: 'm-swap',
    vehicleVendor: 'Motovolt',
    city: 'Delhi',
    hub: 'Central Hub'
  };

  // Simulate live tracking updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLiveTracking) {
      interval = setInterval(() => {
        // Simulate real-time updates
        setLastUpdated(new Date());
        
        // Update location with slight variations
        setLocationData(prev => ({
          ...prev,
          data: {
            ...prev.data,
            speed: Math.floor(Math.random() * 30 + 10).toString(),
            heading: Math.floor(Math.random() * 360).toString(),
            vehbattery: (parseFloat(prev.data.vehbattery) - Math.random() * 0.1).toFixed(1)
          }
        }));
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveTracking]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-100';
      case 'FAILURE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get mobility status
  const getMobilityStatus = (mobili: string) => {
    return mobili === '0' ? 'Mobilized' : 'Immobilized';
  };

  // Get mobility status color
  const getMobilityColor = (mobili: string) => {
    return mobili === '0' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  // Get ignition status
  const getIgnitionStatus = (ignstatus: string) => {
    return ignstatus === '1' ? 'ON' : 'OFF';
  };

  // Get ignition color
  const getIgnitionColor = (ignstatus: string) => {
    return ignstatus === '1' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  // Toggle live tracking
  const toggleLiveTracking = () => {
    setIsLiveTracking(!isLiveTracking);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Layout>
      <div className={`min-h-screen bg-[#f6f7ff] p-8 transition-all duration-300 ${
        isFullscreen ? 'p-2' : 'p-8'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vehicle-master')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#3B36FF]">Vehicle Tracking</h1>
              <p className="text-gray-600">
                {vehicle.vehicleNumber} • {vehicle.vehicleModel} • {vehicle.city}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={toggleLiveTracking}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex justify-center items-center ${
                isLiveTracking
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLiveTracking ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
              <span className="ml-2">{isLiveTracking ? 'Stop' : 'Start'} Live Tracking</span>
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-4 text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleString()}
          {isLiveTracking && <span className="ml-2 text-green-600">• Live tracking active</span>}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FiActivity },
            { id: 'location', label: 'Location', icon: FiMapPin },
            { id: 'battery', label: 'Battery', icon: FiBattery },
            { id: 'distance', label: 'Distance', icon: FiNavigation },
            { id: 'fuel', label: 'Fuel', icon: FiZap },
            { id: 'history', label: 'History', icon: FiClock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-[#3B36FF] shadow border-b-2 border-[#3B36FF]'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Location */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Current Location</h3>
                  <p className="text-sm text-gray-500">GPS Coordinates</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-medium">{locationData.data.lat}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-medium">{locationData.data.lng}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Altitude:</span>
                  <span className="font-medium">{locationData.data.alti}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-medium">{locationData.data.speed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heading:</span>
                  <span className="font-medium">{locationData.data.heading}°</span>
                </div>
              </div>
            </div>

            {/* Battery Status */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiBattery className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Battery Status</h3>
                  <p className="text-sm text-gray-500">Real-time metrics</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">SOC:</span>
                  <span className="font-medium">{canData.data.soc.value}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Voltage:</span>
                  <span className="font-medium">{canData.data.battery_voltage.value}V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-medium">{canData.data.battery_temp.value}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-medium">{canData.data.current.value}A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Motor Temp:</span>
                  <span className="font-medium">{canData.data.motor_temperature?.value || 'N/A'}°C</span>
                </div>
              </div>
            </div>

            {/* Vehicle Status */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiZap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Status</h3>
                  <p className="text-sm text-gray-500">System information</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobility:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getMobilityColor(locationData.data.mobili)}`}>
                    {getMobilityStatus(locationData.data.mobili)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ignition:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getIgnitionColor(locationData.data.ignstatus)}`}>
                    {getIgnitionStatus(locationData.data.ignstatus)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device Battery:</span>
                  <span className="font-medium">{locationData.data.devbattery}V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="font-medium text-sm">{formatTimestamp(locationData.data.commtime)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h3>
            
            {/* Map placeholder */}
            <div className="bg-gray-100 rounded-lg h-96 mb-6 flex items-center justify-center">
              <div className="text-center">
                <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Map integration would go here</p>
                <p className="text-sm text-gray-400">Coordinates: {locationData.data.lat}, {locationData.data.lng}</p>
              </div>
            </div>
            
            {/* Location metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiNavigation className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Speed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{locationData.data.speed} km/h</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiNavigation className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Heading</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{locationData.data.heading}°</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiMapPin className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Altitude</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{locationData.data.alti}m</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiClock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Last Update</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatTimestamp(locationData.data.commtime)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Battery Tab */}
        {activeTab === 'battery' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Battery Analytics</h3>
            
            {/* Battery metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiBattery className="w-5 h-5 text-green-600" />
                  <span className="font-medium">SOC</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{canData.data.soc.value}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${canData.data.soc.value}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiThermometer className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Temperature</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{canData.data.battery_temp.value}°C</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiZap className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Voltage</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{canData.data.battery_voltage.value}V</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Current</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{canData.data.current.value}A</p>
              </div>
            </div>
            
            {/* Battery history chart placeholder */}
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <FiBattery className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Battery history chart would go here</p>
                <p className="text-sm text-gray-400">SOC, temperature, and voltage over time</p>
              </div>
            </div>
          </div>
        )}

        {/* Distance Tab */}
        {activeTab === 'distance' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Distance Analytics</h3>
            
            {/* Current trip distance */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Current Trip</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiNavigation className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Distance Travelled</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{distanceData.data.distance} km</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Start Odometer</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{distanceData.data.startodo} km</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">End Odometer</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{distanceData.data.endodo} km</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Trip Duration</span>
                  </div>
                  <p className="text-sm font-medium text-orange-600">
                    {formatTimestamp(distanceData.data.starttime)} - {formatTimestamp(distanceData.data.endtime)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Location coordinates */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Trip Coordinates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Start Location</h5>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      {distanceData.data.startLoc[0]}, {distanceData.data.startLoc[1]}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">End Location</h5>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-600">
                      {distanceData.data.endLoc[0]}, {distanceData.data.endLoc[1]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fleet distance comparison */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Fleet Distance Comparison</h4>
              <div className="space-y-2">
                {distanceBulkData.data.map((vehicle, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiTruck className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{vehicle.vehicleno}</p>
                        <p className="text-sm text-gray-500">Distance travelled</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{vehicle.distance} km</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fuel Tab */}
        {activeTab === 'fuel' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Fuel Analytics</h3>
            
            {/* Current fuel status */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Current Fuel Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiZap className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Fuel Level</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{lastFuelStatus.data.fuellevel}%</p>
                  <p className="text-sm text-gray-600">{lastFuelStatus.data.fuellevellitres} litres</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Last Update</span>
                  </div>
                  <p className="text-sm font-medium text-blue-600">
                    {formatTimestamp(lastFuelStatus.data.fueltime)}
                  </p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiZap className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Fuel Used</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{fuelUsed.data.fuelused} litres</p>
                  <p className="text-sm text-gray-600">This trip</p>
                </div>
              </div>
            </div>
            
            {/* Fuel usage details */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Fuel Usage Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Trip Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Level:</span>
                      <span className="font-medium">{fuelUsed.data.startfl}% ({fuelUsed.data.startfl_litres}L)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Level:</span>
                      <span className="font-medium">{fuelUsed.data.endfl}% ({fuelUsed.data.endfl_litres}L)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Used:</span>
                      <span className="font-medium text-orange-600">{fuelUsed.data.fuelused} litres</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Ignition Times</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start:</span>
                      <span className="font-medium">{formatTimestamp(fuelUsed.data.starttime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End:</span>
                      <span className="font-medium">{formatTimestamp(fuelUsed.data.endtime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fuel history chart */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Fuel Level History</h4>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <FiZap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Fuel history chart would go here</p>
                  <p className="text-sm text-gray-400">Fuel level over time</p>
                </div>
              </div>
            </div>
            
            {/* Refueling events */}
            {fuelUsed.data.refueling_events.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Refueling Events</h4>
                <div className="space-y-2">
                  {fuelUsed.data.refueling_events.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiZap className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium">Refueling Event</p>
                          <p className="text-sm text-gray-500">
                            Added: {event.fuel_added} litres
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatTimestamp(event.time)}</p>
                        <p className="text-xs text-gray-500">
                          {event.fuel_level_before}% → {event.fuel_level_after}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tracking History</h3>
            
            {/* Location history */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Location History</h4>
              <div className="space-y-2">
                {locationHistory.data.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiMapPin className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{location.lat}, {location.lng}</p>
                        <p className="text-sm text-gray-500">
                          Speed: {location.speed} km/h • Heading: {location.heading}°
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatTimestamp(location.commtime)}</p>
                      <p className="text-xs text-gray-500">Battery: {location.vehbattery}V</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Battery history */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Battery History</h4>
              <div className="space-y-2">
                {batteryHistory.data.map((battery, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiBattery className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium">SOC: {battery.soc}% • SOH: {battery.soh}%</p>
                        <p className="text-sm text-gray-500">
                          Temp: {battery.battery_temp}°C • Voltage: {battery.battery_voltage}V
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatTimestamp(battery.time)}</p>
                      <p className="text-xs text-gray-500">Cycle: {battery.charge_cycle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VehicleTracking;
