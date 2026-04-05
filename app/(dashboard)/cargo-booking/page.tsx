"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Paperclip,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  MapPin,
  Calendar,
  Box,
  Container,
  ArrowRight,
  Loader2,
  X,
  Eye,
  Upload,
  Image as ImageIcon,
  Snowflake,
  Wind,
  Package,
  Briefcase,
  Mail,
  Layers,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import imgCargoShip from "@/app/assets/3f7d36fbe26222b564747f69753922efbd74194d.png";
import imgContainer from "@/app/assets/5edceaf79f7be705450710aa82c190c67fbcaf62.png";
import imgPassport from "@/app/assets/bbad37ee24906289e97d640c601d7cafe55963b5.png";
import imgIdCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ServiceType = 'CONTAINER' | 'PALLET' | 'LUGGAGE' | 'BOX' | 'ENVELOPE' | 'BUNDLE' | 'OTHER';
type BoxSubType = 'DRY' | 'FROZEN' | 'COOLER';
type CargoSizeType = 'Small' | 'Medium' | 'Large';

interface CargoItem {
  id: number;
  icon: string;
  type: string;
  unitPrice: number;
  quantity: number;
  total: number;
  isPaid: boolean;
  // Extended form data
  service: ServiceType;
  boxSubType?: BoxSubType;
  cargoSize: CargoSizeType;
  flags: { fragile: boolean; hazardous: boolean; live: boolean };
  value?: string;
  // Service-specific fields
  containerNo?: string;
  chassisNo?: string;
  temperature?: string;
  containerSize?: string;
  containerType?: string;
  contents?: string;
  palletNo?: string;
  reeferNo?: string;
  palletHeight?: string;
  palletType?: string;
  deckNo?: string;
  material?: string;
  color?: string;
  luggageType?: string;
  envelopeType?: string;
  bundleQuantity?: string;
  bundleLength?: string;
  bundleSize?: string;
  itemLocation?: string;
  itemNumber?: string;
  itemName?: string;
  // Deficiency
  damageFound?: string;
  damageLocation?: string;
  deficiencyComment?: string;
}

interface Location {
  id: string;
  code: string;
  name: string;
}

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  caption?: string;
  preview?: string;
}

interface ServiceConfig {
  label: string;
  icon: React.ReactNode;
  headerBg: string;
  accentColor: string;
}

// ============================================================================
// SERVICE CONFIGURATIONS
// ============================================================================

const SERVICE_CONFIGS: Record<ServiceType, ServiceConfig> = {
  CONTAINER: {
    label: 'Container Entry',
    icon: <Container className="w-8 h-8" />,
    headerBg: 'from-emerald-600 to-emerald-800',
    accentColor: '#296341'
  },
  PALLET: {
    label: 'Pallet Entry',
    icon: <Layers className="w-8 h-8" />,
    headerBg: 'from-emerald-600 to-emerald-800',
    accentColor: '#296341'
  },
  LUGGAGE: {
    label: 'Luggage Entry',
    icon: <Briefcase className="w-8 h-8" />,
    headerBg: 'from-emerald-600 to-emerald-800',
    accentColor: '#296341'
  },
  BOX: {
    label: 'Box Entry',
    icon: <Box className="w-8 h-8" />,
    headerBg: 'from-emerald-600 to-emerald-800',
    accentColor: '#296341'
  },
  ENVELOPE: {
    label: 'Envelope',
    icon: <Mail className="w-8 h-8" />,
    headerBg: 'from-emerald-600 to-emerald-800',
    accentColor: '#296341'
  },
  BUNDLE: {
    label: 'Bundle Entry',
    icon: <Package className="w-8 h-8" />,
    headerBg: 'from-emerald-600 to-emerald-800',
    accentColor: '#296341'
  },
  OTHER: {
    label: 'Other',
    icon: <MoreHorizontal className="w-8 h-8" />,
    headerBg: 'from-emerald-600 to-emerald-800',
    accentColor: '#296341'
  }
};

const BOX_SUBTYPE_CONFIGS: Record<BoxSubType, { label: string; icon: React.ReactNode; bgColor: string }> = {
  DRY: { label: 'Dry', icon: <Box className="w-6 h-6" />, bgColor: 'bg-gray-100' },
  FROZEN: { label: 'Frozen', icon: <Snowflake className="w-6 h-6 text-cyan-500" />, bgColor: 'bg-cyan-50' },
  COOLER: { label: 'Cooler', icon: <Wind className="w-6 h-6 text-blue-400" />, bgColor: 'bg-blue-50' }
};

const DAMAGE_TYPES = [
  { value: '', label: 'None' },
  { value: 'BROKEN', label: 'Broken' },
  { value: 'IMPROPERLY_PACKAGED', label: 'Improperly Packaged' },
  { value: 'ITEM_MISSING', label: 'Item Missing' },
  { value: 'BENT', label: 'Bent' },
  { value: 'SCRATCHED', label: 'Scratched' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'WET', label: 'Wet' },
  { value: 'TORN', label: 'Torn' },
  { value: 'OTHER', label: 'Other' }
];

const DAMAGE_LOCATIONS = [
  { value: '', label: 'Select location' },
  { value: 'LEFT_UPPER_CORNER', label: 'Left Upper Corner' },
  { value: 'RIGHT_UPPER_CORNER', label: 'Right Upper Corner' },
  { value: 'LEFT_LOWER_CORNER', label: 'Left Lower Corner' },
  { value: 'RIGHT_LOWER_CORNER', label: 'Right Lower Corner' },
  { value: 'TOP', label: 'Top' },
  { value: 'BOTTOM', label: 'Bottom' },
  { value: 'LEFT', label: 'Left' },
  { value: 'RIGHT', label: 'Right' },
  { value: 'LEFT_CENTER', label: 'Left Center' },
  { value: 'RIGHT_CENTER', label: 'Right Center' },
  { value: 'FRONT', label: 'Front' },
  { value: 'BACK', label: 'Back' },
  { value: 'MULTIPLE', label: 'Multiple Areas' }
];

// ============================================================================
// REUSABLE FORM COMPONENTS
// ============================================================================

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}

const InputField = ({ label, value, onChange, placeholder, type = 'text', required, className = '' }: InputFieldProps) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-[14px] font-bold text-gray-500 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-[48px] border-b-2 border-gray-200 outline-none focus:border-[#296341] text-[16px] font-medium transition-colors bg-transparent"
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}

const SelectField = ({ label, value, onChange, options, required, className = '' }: SelectFieldProps) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-[14px] font-bold text-gray-500 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[48px] border-b-2 border-gray-200 outline-none focus:border-[#296341] text-[16px] font-bold appearance-none bg-transparent cursor-pointer transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
    </div>
  </div>
);

interface BoxedInputFieldProps extends InputFieldProps {
  icon?: React.ReactNode;
}

const BoxedInputField = ({ label, value, onChange, placeholder, type = 'text', required, icon, className = '' }: BoxedInputFieldProps) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-[14px] font-bold text-gray-500 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#296341]">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-[48px] bg-white border border-gray-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[16px] font-medium transition-all ${icon ? 'pl-10 pr-4' : 'px-4'}`}
      />
    </div>
  </div>
);

interface BoxedSelectFieldProps extends SelectFieldProps {
  icon?: React.ReactNode;
  disabled?: boolean;
}

const BoxedSelectField = ({ label, value, onChange, options, required, icon, disabled, className = '' }: BoxedSelectFieldProps) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-[14px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
      {icon && <span className="text-[#296341]">{icon}</span>}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-[48px] bg-white border border-gray-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[16px] font-bold appearance-none px-4 cursor-pointer transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#296341] w-5 h-5 pointer-events-none" />
    </div>
  </div>
);

// Size & Flag Radio Group Component
interface SizeFlagsProps {
  size: CargoSizeType;
  onSizeChange: (size: CargoSizeType) => void;
  flags: { fragile: boolean; hazardous: boolean; live: boolean };
  onFlagChange: (flag: 'fragile' | 'hazardous' | 'live', value: boolean) => void;
}

const SizeFlagsSection = ({ size, onSizeChange, flags, onFlagChange }: SizeFlagsProps) => {
  const sizes: CargoSizeType[] = ['Small', 'Medium', 'Large'];
  const flagOptions: { key: 'fragile' | 'hazardous' | 'live'; label: string }[] = [
    { key: 'fragile', label: 'Fragile' },
    { key: 'hazardous', label: 'Hazardous' },
    { key: 'live', label: 'Live' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
      {/* Size options */}
      {sizes.map((s) => (
        <label key={s} className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${size === s ? 'border-[#296341]' : 'border-gray-300 group-hover:border-gray-400'}`}
            onClick={() => onSizeChange(s)}
          >
            {size === s && <div className="w-3 h-3 rounded-full bg-[#296341]" />}
          </div>
          <span className="text-[16px] font-medium text-gray-700 group-hover:text-black transition-colors">{s}</span>
        </label>
      ))}
      {/* Flag options */}
      {flagOptions.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${flags[key] ? 'border-[#296341]' : 'border-gray-300 group-hover:border-gray-400'}`}
            onClick={() => onFlagChange(key, !flags[key])}
          >
            {flags[key] && <div className="w-3 h-3 rounded-full bg-[#296341]" />}
          </div>
          <span className="text-[16px] font-medium text-gray-700 group-hover:text-black transition-colors">{label}</span>
        </label>
      ))}
    </div>
  );
};

// Deficiency Section Component
interface DeficiencySectionProps {
  damageFound: string;
  onDamageFoundChange: (value: string) => void;
  damageLocation: string;
  onDamageLocationChange: (value: string) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  showDamageLocation?: boolean;
}

const DeficiencySection = ({
  damageFound,
  onDamageFoundChange,
  damageLocation,
  onDamageLocationChange,
  comment,
  onCommentChange,
  showDamageLocation = true
}: DeficiencySectionProps) => (
  <div className="bg-[#f0f7f3] rounded-2xl p-6 space-y-6">
    <h3 className="text-[20px] font-bold text-[#296341] border-b-2 border-[#296341] pb-2 inline-block">
      DEFICIENCY
    </h3>
    <div className="space-y-4">
      <SelectField
        label="Damages Found"
        value={damageFound}
        onChange={onDamageFoundChange}
        options={DAMAGE_TYPES}
      />
      {damageFound && (
        <p className="text-sm text-gray-500 italic">
          {DAMAGE_TYPES.filter(d => d.value && d.value !== damageFound).map(d => d.label).join(', ')}
        </p>
      )}
      {showDamageLocation && (
        <SelectField
          label="Damage Location"
          value={damageLocation}
          onChange={onDamageLocationChange}
          options={DAMAGE_LOCATIONS}
        />
      )}
    </div>
  </div>
);

// ============================================================================
// SERVICE-SPECIFIC FORM SECTIONS
// ============================================================================

interface ContainerFormProps {
  containerNo: string;
  setContainerNo: (v: string) => void;
  chassisNo: string;
  setChassisNo: (v: string) => void;
  temperature: string;
  setTemperature: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  containerType: string;
  setContainerType: (v: string) => void;
  value: string;
  setValue: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  contents: string;
  setContents: (v: string) => void;
}

const ContainerFormFields = ({
  containerNo, setContainerNo,
  chassisNo, setChassisNo,
  temperature, setTemperature,
  size, setSize,
  containerType, setContainerType,
  value, setValue,
  price, setPrice,
  contents, setContents
}: ContainerFormProps) => (
  <div className="space-y-8">
    <h3 className="text-[20px] font-bold text-gray-800 uppercase tracking-wide">Container Inspection</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField label="Container#" value={containerNo} onChange={setContainerNo} placeholder="e.g., 134" />
      <InputField label="Chassis#" value={chassisNo} onChange={setChassisNo} placeholder="e.g., 2" />
      <InputField label="Temperature" value={temperature} onChange={setTemperature} placeholder="e.g., 70°" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField label="Value" value={value} onChange={setValue} placeholder="$5,000" />
      <SelectField
        label="Size"
        value={size}
        onChange={setSize}
        options={[
          { value: '', label: 'Select size' },
          { value: '20FT', label: '20 FT' },
          { value: '40FT', label: '40 FT' },
          { value: '40FT_HC', label: '40 FT HC' },
          { value: '45FT', label: '45 FT' }
        ]}
      />
      <SelectField
        label="Type"
        value={containerType}
        onChange={setContainerType}
        options={[
          { value: '', label: 'Select type' },
          { value: 'DRY', label: 'Dry' },
          { value: 'REEFER', label: 'Reefer' },
          { value: 'OPEN_TOP', label: 'Open Top' },
          { value: 'FLAT_RACK', label: 'Flat Rack' }
        ]}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Price" value={price} onChange={setPrice} placeholder="$500" />
    </div>
    <InputField label="Contents" value={contents} onChange={setContents} placeholder="Describe container contents..." />
  </div>
);

interface PalletFormProps {
  palletNo: string;
  setPalletNo: (v: string) => void;
  reeferNo: string;
  setReeferNo: (v: string) => void;
  containerNo: string;
  setContainerNo: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  palletType: string;
  setPalletType: (v: string) => void;
  deckNo: string;
  setDeckNo: (v: string) => void;
  cargoSize: CargoSizeType;
  setCargoSize: (v: CargoSizeType) => void;
  flags: { fragile: boolean; hazardous: boolean; live: boolean };
  setFlags: (flags: { fragile: boolean; hazardous: boolean; live: boolean }) => void;
  value: string;
  setValue: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
}

const PalletFormFields = ({
  palletNo, setPalletNo,
  reeferNo, setReeferNo,
  containerNo, setContainerNo,
  height, setHeight,
  palletType, setPalletType,
  deckNo, setDeckNo,
  cargoSize, setCargoSize,
  flags, setFlags,
  value, setValue,
  price, setPrice
}: PalletFormProps) => (
  <div className="space-y-8">
    <h3 className="text-[20px] font-bold text-gray-800 uppercase tracking-wide">Pallet Inspection</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField label="Pallet#" value={palletNo} onChange={setPalletNo} placeholder="Enter pallet number" />
      <InputField label="Reefer#" value={reeferNo} onChange={setReeferNo} placeholder="e.g., 2" />
      <InputField label="Container#" value={containerNo} onChange={setContainerNo} placeholder="e.g., 2" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SelectField
        label="Height"
        value={height}
        onChange={setHeight}
        options={[
          { value: '', label: 'Select height' },
          { value: '4ft', label: '4 ft' },
          { value: '5ft', label: '5 ft' },
          { value: '6ft', label: '6 ft' }
        ]}
      />
      <SelectField
        label="Type"
        value={palletType}
        onChange={setPalletType}
        options={[
          { value: 'DRY', label: 'Dry' },
          { value: 'FROZEN', label: 'Frozen' },
          { value: 'REFRIGERATED', label: 'Refrigerated' }
        ]}
      />
      <InputField label="Deck#" value={deckNo} onChange={setDeckNo} placeholder="e.g., 2" />
    </div>

    <SizeFlagsSection
      size={cargoSize}
      onSizeChange={setCargoSize}
      flags={flags}
      onFlagChange={(flag, val) => setFlags({ ...flags, [flag]: val })}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Value" value={value} onChange={setValue} placeholder="Enter value" />
      <InputField label="Price" value={price} onChange={setPrice} placeholder="Enter price" />
    </div>
  </div>
);

interface LuggageFormProps {
  material: string;
  setMaterial: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  luggageType: string;
  setLuggageType: (v: string) => void;
  cargoSize: CargoSizeType;
  setCargoSize: (v: CargoSizeType) => void;
  flags: { fragile: boolean; hazardous: boolean; live: boolean };
  setFlags: (flags: { fragile: boolean; hazardous: boolean; live: boolean }) => void;
  value: string;
  setValue: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
}

const LuggageFormFields = ({
  material, setMaterial,
  color, setColor,
  luggageType, setLuggageType,
  cargoSize, setCargoSize,
  flags, setFlags,
  value, setValue,
  price, setPrice
}: LuggageFormProps) => (
  <div className="space-y-8">
    <h3 className="text-[20px] font-bold text-gray-800 uppercase tracking-wide">Luggage Inspection</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField label="Material" value={material} onChange={setMaterial} placeholder="e.g., Leather, Fabric" />
      <SelectField
        label="Color"
        value={color}
        onChange={setColor}
        options={[
          { value: '', label: 'Select color' },
          { value: 'BLACK', label: 'Black' },
          { value: 'BROWN', label: 'Brown' },
          { value: 'BLUE', label: 'Blue' },
          { value: 'RED', label: 'Red' },
          { value: 'GREEN', label: 'Green' },
          { value: 'GRAY', label: 'Gray' },
          { value: 'WHITE', label: 'White' },
          { value: 'OTHER', label: 'Other' }
        ]}
      />
      <InputField label="Type" value={luggageType} onChange={setLuggageType} placeholder="e.g., Suitcase, Duffel" />
    </div>

    <SizeFlagsSection
      size={cargoSize}
      onSizeChange={setCargoSize}
      flags={flags}
      onFlagChange={(flag, val) => setFlags({ ...flags, [flag]: val })}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Value" value={value} onChange={setValue} placeholder="Enter value" />
      <InputField label="Price" value={price} onChange={setPrice} placeholder="Enter price" />
    </div>
  </div>
);

interface BoxFormProps {
  boxSubType: BoxSubType;
  setBoxSubType: (v: BoxSubType) => void;
  cargoSize: CargoSizeType;
  setCargoSize: (v: CargoSizeType) => void;
  flags: { fragile: boolean; hazardous: boolean; live: boolean };
  setFlags: (flags: { fragile: boolean; hazardous: boolean; live: boolean }) => void;
  value: string;
  setValue: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  palletNo: string;
  setPalletNo: (v: string) => void;
}

const BoxFormFields = ({
  boxSubType, setBoxSubType,
  cargoSize, setCargoSize,
  flags, setFlags,
  value, setValue,
  price, setPrice,
  palletNo, setPalletNo
}: BoxFormProps) => (
  <div className="space-y-8">
    {/* Box Sub-Type Selector */}
    <div className="space-y-4">
      <h3 className="text-[20px] font-bold text-gray-800 uppercase tracking-wide">Select Box Type</h3>
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(BOX_SUBTYPE_CONFIGS) as BoxSubType[]).map((subType) => {
          const config = BOX_SUBTYPE_CONFIGS[subType];
          const isSelected = boxSubType === subType;
          return (
            <button
              key={subType}
              onClick={() => setBoxSubType(subType)}
              className={`relative p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${isSelected
                  ? 'border-[#296341] bg-[#eef6f2] shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                {config.icon}
              </div>
              <span className="font-bold text-gray-700">{config.label}</span>
              {isSelected && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#296341]" />
              )}
            </button>
          );
        })}
      </div>
    </div>

    <h3 className="text-[20px] font-bold text-gray-800 uppercase tracking-wide">Item Inspection</h3>

    <SizeFlagsSection
      size={cargoSize}
      onSizeChange={setCargoSize}
      flags={flags}
      onFlagChange={(flag, val) => setFlags({ ...flags, [flag]: val })}
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField label="Value" value={value} onChange={setValue} placeholder="Enter value" />
      <InputField label="Price" value={price} onChange={setPrice} placeholder="Enter price" />
      <InputField label="Pallet#" value={palletNo} onChange={setPalletNo} placeholder="Enter pallet number" />
    </div>
  </div>
);

interface EnvelopeFormProps {
  envelopeType: string;
  setEnvelopeType: (v: string) => void;
  value: string;
  setValue: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
}

const EnvelopeFormFields = ({
  envelopeType, setEnvelopeType,
  value, setValue,
  price, setPrice
}: EnvelopeFormProps) => {
  const envelopeTypes = ['Small Box', 'Envelope', 'Parcel'];

  return (
    <div className="space-y-8">
      <h3 className="text-[20px] font-bold text-gray-800 uppercase tracking-wide">Item Inspection</h3>

      {/* Envelope Type Radio Selection */}
      <div className="flex gap-8">
        {envelopeTypes.map((type) => (
          <label key={type} className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${envelopeType === type ? 'border-[#296341]' : 'border-gray-300 group-hover:border-gray-400'
                }`}
              onClick={() => setEnvelopeType(type)}
            >
              {envelopeType === type && <div className="w-3 h-3 rounded-full bg-[#296341]" />}
            </div>
            <span className="text-[16px] font-medium text-gray-700 group-hover:text-black transition-colors">
              {type}
            </span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Value" value={value} onChange={setValue} placeholder="Enter value" />
        <InputField label="Price" value={price} onChange={setPrice} placeholder="Enter price" />
      </div>
    </div>
  );
};

interface BundleFormProps {
  material: string;
  setMaterial: (v: string) => void;
  quantity: string;
  setQuantity: (v: string) => void;
  length: string;
  setLength: (v: string) => void;
  bundleSize: string;
  setBundleSize: (v: string) => void;
  deckNo: string;
  setDeckNo: (v: string) => void;
  flags: { fragile: boolean; hazardous: boolean; live: boolean };
  setFlags: (flags: { fragile: boolean; hazardous: boolean; live: boolean }) => void;
  value: string;
  setValue: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  itemLocation: string;
  setItemLocation: (v: string) => void;
  itemNumber: string;
  setItemNumber: (v: string) => void;
}

const BundleFormFields = ({
  material, setMaterial,
  quantity, setQuantity,
  length, setLength,
  bundleSize, setBundleSize,
  deckNo, setDeckNo,
  flags, setFlags,
  value, setValue,
  price, setPrice,
  itemLocation, setItemLocation,
  itemNumber, setItemNumber
}: BundleFormProps) => (
  <div className="space-y-8">
    <h3 className="text-[20px] font-bold text-gray-800 uppercase tracking-wide">Bundle Inspection</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField label="Material" value={material} onChange={setMaterial} placeholder="e.g., Wood, Metal" />
      <InputField label="Quantity" value={quantity} onChange={setQuantity} placeholder="Enter quantity" type="number" />
      <InputField label="Length" value={length} onChange={setLength} placeholder="e.g., 4'" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Size" value={bundleSize} onChange={setBundleSize} placeholder={'e.g., 1" x 4"'} />
      <InputField label="Deck#" value={deckNo} onChange={setDeckNo} placeholder="Enter deck number" />
    </div>

    <div className="flex gap-8">
      {['Fragile', 'Hazardous', 'Live'].map((flag) => {
        const key = flag.toLowerCase() as 'fragile' | 'hazardous' | 'live';
        return (
          <label key={flag} className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${flags[key] ? 'border-[#296341]' : 'border-gray-300 group-hover:border-gray-400'
                }`}
              onClick={() => setFlags({ ...flags, [key]: !flags[key] })}
            >
              {flags[key] && <div className="w-3 h-3 rounded-full bg-[#296341]" />}
            </div>
            <span className="text-[16px] font-medium text-gray-700 group-hover:text-black transition-colors">{flag}</span>
          </label>
        );
      })}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Value" value={value} onChange={setValue} placeholder="Enter value" />
      <InputField label="Price" value={price} onChange={setPrice} placeholder="Enter price" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SelectField
        label="Item Location"
        value={itemLocation}
        onChange={setItemLocation}
        options={[
          { value: '', label: 'Select location' },
          { value: 'PALLET', label: 'Pallet' },
          { value: 'CONTAINER', label: 'Container' },
          { value: 'DECK', label: 'Deck' }
        ]}
      />
      <InputField label="Item Number" value={itemNumber} onChange={setItemNumber} placeholder="e.g., 14" />
    </div>
  </div>
);

interface OtherFormProps {
  itemName: string;
  setItemName: (v: string) => void;
  cargoSize: CargoSizeType;
  setCargoSize: (v: CargoSizeType) => void;
  flags: { fragile: boolean; hazardous: boolean; live: boolean };
  setFlags: (flags: { fragile: boolean; hazardous: boolean; live: boolean }) => void;
  value: string;
  setValue: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
}

const OtherFormFields = ({
  itemName, setItemName,
  cargoSize, setCargoSize,
  flags, setFlags,
  value, setValue,
  price, setPrice
}: OtherFormProps) => (
  <div className="space-y-8">
    <h3 className="text-[20px] font-bold text-gray-800 uppercase tracking-wide">Item Inspection</h3>
    <InputField label="Item" value={itemName} onChange={setItemName} placeholder="Identify Item" />

    <SizeFlagsSection
      size={cargoSize}
      onSizeChange={setCargoSize}
      flags={flags}
      onFlagChange={(flag, val) => setFlags({ ...flags, [flag]: val })}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Value" value={value} onChange={setValue} placeholder="Enter value" />
      <InputField label="Price" value={price} onChange={setPrice} placeholder="Enter price" />
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CargoBooking() {
  const { apiFetch, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [upcomingVoyages, setUpcomingVoyages] = useState<any[]>([]);
  const [selectedVoyageId, setSelectedVoyageId] = useState("");
  const [isLoadingVoyages, setIsLoadingVoyages] = useState(false);

  // =========== SERVICE TYPE STATE ===========
  const [service, setService] = useState<ServiceType>('CONTAINER');
  const [boxSubType, setBoxSubType] = useState<BoxSubType>('DRY');

  // =========== COMMON FORM STATE ===========
  const [cargoSize, setCargoSize] = useState<CargoSizeType>('Medium');
  const [flags, setFlags] = useState({ fragile: false, hazardous: false, live: false });
  const [value, setValue] = useState("");
  const [price, setPrice] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [voyageNo, setVoyageNo] = useState("");

  // =========== CONTAINER SPECIFIC ===========
  const [containerNo, setContainerNo] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [temperature, setTemperature] = useState("");
  const [containerSize, setContainerSize] = useState("");
  const [containerType, setContainerType] = useState("");
  const [contents, setContents] = useState("");

  // =========== PALLET SPECIFIC ===========
  const [palletNo, setPalletNo] = useState("");
  const [reeferNo, setReeferNo] = useState("");
  const [palletHeight, setPalletHeight] = useState("");
  const [palletType, setPalletType] = useState("DRY");
  const [deckNo, setDeckNo] = useState("");

  // =========== LUGGAGE SPECIFIC ===========
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [luggageType, setLuggageType] = useState("");

  // =========== ENVELOPE SPECIFIC ===========
  const [envelopeType, setEnvelopeType] = useState("Envelope");

  // =========== BUNDLE SPECIFIC ===========
  const [bundleQuantity, setBundleQuantity] = useState("");
  const [bundleLength, setBundleLength] = useState("");
  const [bundleSize, setBundleSize] = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [itemNumber, setItemNumber] = useState("");

  // =========== OTHER SPECIFIC ===========
  const [itemName, setItemName] = useState("");

  // =========== DEFICIENCY STATE ===========
  const [damageFound, setDamageFound] = useState("");
  const [damageLocation, setDamageLocation] = useState("");
  const [comment, setComment] = useState("");

  // =========== USER DETAILS STATE ===========
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState("Passport");

  // =========== PAYMENT & REMARKS ===========
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [remark, setRemark] = useState("");

  // =========== ITEMS STATE ===========
  const [items, setItems] = useState<CargoItem[]>([]);

  // =========== IMAGE UPLOAD STATE ===========
  const [containerImages, setContainerImages] = useState<UploadedImage[]>([]);
  const [userDocuments, setUserDocuments] = useState<UploadedImage[]>([]);
  const containerImageRef = useRef<HTMLInputElement>(null);
  const userDocumentRef = useRef<HTMLInputElement>(null);

  // =========== MODAL STATES ===========
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CargoItem | null>(null);
  const [newItemUnitPrice, setNewItemUnitPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemIsPaid, setNewItemIsPaid] = useState(false);

  // =========== CREATED BOOKING STATE ===========
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Set user details when user loads
  useEffect(() => {
    if (user) {
      setContactName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      setContactEmail(user.email || "");
      setContactPhone(user.mobileNumber || "");
    }
  }, [user]);

  // Fetch Locations
  useEffect(() => {
    async function fetchLocations() {
      setIsLoadingLocations(true);
      try {
        const res = await apiFetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);
          if (data.locations && data.locations.length > 0) {
            setFromLocation(data.locations[0].code);
            if (data.locations.length > 1) {
              setToLocation(data.locations[1].code);
            }
          }
        } else {
          toast.error("Failed to load locations");
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        toast.error("Failed to load locations");
      } finally {
        setIsLoadingLocations(false);
      }
    }
    fetchLocations();
  }, [apiFetch]);

  // Fetch Upcoming Voyages
  useEffect(() => {
    async function fetchVoyages() {
      setIsLoadingVoyages(true);
      try {
        const res = await apiFetch('/api/voyages?upcoming=true&limit=50');
        if (res.ok) {
          const data = await res.json();
          setUpcomingVoyages(data.voyages || []);
        }
      } catch (err) {
        console.error("Failed to fetch voyages:", err);
      } finally {
        setIsLoadingVoyages(false);
      }
    }
    fetchVoyages();
  }, [apiFetch]);

  // Get current service config
  const currentServiceConfig = SERVICE_CONFIGS[service];

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * 0.12;
    const grandTotal = subtotal + vatAmount;
    return { subtotal, vatAmount, grandTotal };
  };

  // Image upload handlers
  const handleContainerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: '',
          file,
          preview,
        });
      }
    });

    setContainerImages([...containerImages, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);

    if (containerImageRef.current) {
      containerImageRef.current.value = '';
    }
  };

  const handleUserDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        newDocs.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: '',
          file,
          preview,
          caption: idType,
        });
      }
    });

    setUserDocuments([...userDocuments, ...newDocs]);
    toast.success(`${newDocs.length} document(s) added`);

    if (userDocumentRef.current) {
      userDocumentRef.current.value = '';
    }
  };

  const removeContainerImage = (id: string) => {
    setContainerImages(containerImages.filter(img => img.id !== id));
    toast.success("Image removed");
  };

  const removeUserDocument = (id: string) => {
    setUserDocuments(userDocuments.filter(doc => doc.id !== id));
    toast.success("Document removed");
  };

  // Generate item type label based on current form state
  const getItemTypeLabel = (): string => {
    switch (service) {
      case 'CONTAINER':
        const sizeLabel = containerSize ? ` (${containerSize})` : '';
        const typeLabel = containerType ? ` ${containerType}` : '';
        return `Container${typeLabel}${sizeLabel}`;
      case 'PALLET':
        const palletTypeLabel = palletType ? ` ${palletType}` : '';
        const heightLabel = palletHeight ? ` ${palletHeight}` : '';
        return `Pallet${palletTypeLabel}${heightLabel}`;
      case 'LUGGAGE':
        return luggageType ? `Luggage - ${luggageType}` : 'Luggage';
      case 'BOX':
        return `${boxSubType} BOX (${cargoSize})`;
      case 'ENVELOPE':
        return envelopeType || 'Envelope';
      case 'BUNDLE':
        const bundleDesc = material ? `${material} Bundle` : 'Bundle';
        return bundleLength ? `${bundleDesc} (${bundleLength})` : bundleDesc;
      case 'OTHER':
        return itemName || 'Other Item';
      default:
        return service;
    }
  };

  // Get icon type based on service
  const getItemIcon = (): string => {
    switch (service) {
      case 'CONTAINER':
        return 'container';
      case 'BOX':
        return 'box';
      case 'ENVELOPE':
        return 'envelope';
      case 'LUGGAGE':
        return 'luggage';
      case 'PALLET':
        return 'pallet';
      case 'BUNDLE':
        return 'bundle';
      default:
        return 'other';
    }
  };

  // Add Item from Form - creates item based on current form state
  const handleAddItemFromForm = () => {
    // Validate required fields
    if (!price) {
      toast.error("Please enter a price for this item");
      return;
    }

    const unitPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (isNaN(unitPrice) || unitPrice <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    // Get quantity (default to 1, or use bundleQuantity for bundles)
    let qty = 1;
    if (service === 'BUNDLE' && bundleQuantity) {
      qty = parseInt(bundleQuantity) || 1;
    }

    const total = unitPrice * qty;
    const itemType = getItemTypeLabel();

    const newItem: CargoItem = {
      id: Date.now(),
      icon: getItemIcon(),
      type: itemType,
      unitPrice,
      quantity: qty,
      total,
      isPaid: false,
      // Store all form data
      service,
      boxSubType: service === 'BOX' ? boxSubType : undefined,
      cargoSize,
      flags: { ...flags },
      value: value || undefined,
      // Container specific
      containerNo: containerNo || undefined,
      chassisNo: chassisNo || undefined,
      temperature: temperature || undefined,
      containerSize: containerSize || undefined,
      containerType: containerType || undefined,
      contents: contents || undefined,
      // Pallet specific
      palletNo: palletNo || undefined,
      reeferNo: reeferNo || undefined,
      palletHeight: palletHeight || undefined,
      palletType: palletType || undefined,
      deckNo: deckNo || undefined,
      // Luggage specific
      material: material || undefined,
      color: color || undefined,
      luggageType: luggageType || undefined,
      // Envelope specific
      envelopeType: envelopeType || undefined,
      // Bundle specific
      bundleQuantity: bundleQuantity || undefined,
      bundleLength: bundleLength || undefined,
      bundleSize: bundleSize || undefined,
      itemLocation: itemLocation || undefined,
      itemNumber: itemNumber || undefined,
      // Other specific
      itemName: itemName || undefined,
      // Deficiency
      damageFound: damageFound || undefined,
      damageLocation: damageLocation || undefined,
      deficiencyComment: comment || undefined,
    };

    setItems([...items, newItem]);
    toast.success(`${itemType} added to booking`);

    // Reset form fields for next item (but keep location/date)
    resetServiceFields();
  };

  // Edit Item Handler - opens modal with item data for editing
  const handleEditItem = (item: CargoItem) => {
    setEditingItem(item);
    setNewItemUnitPrice(item.unitPrice.toString());
    setNewItemQuantity(item.quantity.toString());
    setNewItemIsPaid(item.isPaid);
    setShowAddItemModal(true);
  };

  // Update edited item
  const handleUpdateItem = () => {
    if (!editingItem) return;

    if (!newItemUnitPrice || !newItemQuantity) {
      toast.error("Please fill in unit price and quantity");
      return;
    }

    const unitPrice = parseFloat(newItemUnitPrice);
    const qty = parseInt(newItemQuantity);

    if (unitPrice <= 0) {
      toast.error("Unit price must be greater than 0");
      return;
    }

    if (qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const total = unitPrice * qty;

    setItems(items.map(item =>
      item.id === editingItem.id
        ? { ...item, unitPrice, quantity: qty, total, isPaid: newItemIsPaid }
        : item
    ));
    toast.success("Item updated successfully");

    setShowAddItemModal(false);
    setEditingItem(null);
    setNewItemUnitPrice("");
    setNewItemQuantity("");
    setNewItemIsPaid(false);
  };

  const handleDeleteItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId));
    toast.success("Item removed");
  };

  // Reset Form - resets service-specific fields based on current service
  const resetServiceFields = () => {
    // Reset common fields
    setCargoSize('Medium');
    setFlags({ fragile: false, hazardous: false, live: false });
    setValue("");
    setPrice("");
    setDamageFound("");
    setDamageLocation("");
    setComment("");

    // Reset service-specific fields
    setContainerNo("");
    setChassisNo("");
    setTemperature("");
    setContainerSize("");
    setContainerType("");
    setContents("");
    setPalletNo("");
    setReeferNo("");
    setPalletHeight("");
    setPalletType("DRY");
    setDeckNo("");
    setMaterial("");
    setColor("");
    setLuggageType("");
    setEnvelopeType("Envelope");
    setBundleQuantity("");
    setBundleLength("");
    setBundleSize("");
    setItemLocation("");
    setItemNumber("");
    setItemName("");
    setBoxSubType('DRY');
  };

  // Reset entire form
  const resetForm = () => {
    if (items.length > 0 || containerImages.length > 0 || userDocuments.length > 0) {
      if (!confirm("Are you sure you want to reset the form? All data will be lost.")) {
        return;
      }
    }

    setService('CONTAINER');
    resetServiceFields();
    setBookingDate(new Date().toISOString().split('T')[0]);
    setVoyageNo("");
    setSelectedVoyageId("");
    setPaymentStatus("UNPAID");
    setRemark("");
    setItems([]);
    setContainerImages([]);
    setUserDocuments([]);
    setCreatedBooking(null);

    if (locations.length > 0) {
      setFromLocation(locations[0].code);
      if (locations.length > 1) {
        setToLocation(locations[1].code);
      }
    }

    toast.success("Form has been reset");
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!service) errors.push("Please select a service type");
    if (!fromLocation) errors.push("Please select a 'From' location");
    if (!toLocation) errors.push("Please select a 'To' location");
    if (fromLocation && toLocation && fromLocation === toLocation) {
      errors.push("'From' and 'To' locations cannot be the same");
    }
    if (!contactName.trim()) errors.push("Please enter contact name");
    if (!bookingDate) errors.push("Please select a booking date");
    if (items.length === 0) errors.push("Please add at least one cargo item");

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    return true;
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // For single item bookings, use the item's stored data
      // For multi-item bookings, the items array contains all the details
      const primaryItem = items.length === 1 ? items[0] : null;
      
      const payload = {
        // Use primary item's service type, or the current form state for multi-item
        service: primaryItem?.service || service,
        boxSubType: primaryItem?.boxSubType || (service === 'BOX' ? boxSubType : null),
        cargoSize: (primaryItem?.cargoSize || cargoSize).toUpperCase(),
        flags: primaryItem?.flags || flags,
        value: primaryItem?.value || value || null,
        price: primaryItem ? primaryItem.unitPrice.toString() : (price || null),

        // Container specific (from primary item or current form)
        containerNo: primaryItem?.containerNo || containerNo || null,
        chassisNo: primaryItem?.chassisNo || chassisNo || null,
        temperature: primaryItem?.temperature || temperature || null,
        size: primaryItem?.containerSize || containerSize || null,
        containerType: primaryItem?.containerType || containerType || null,
        contents: primaryItem?.contents || contents || null,

        // Pallet specific
        palletNo: primaryItem?.palletNo || palletNo || null,
        reeferNo: primaryItem?.reeferNo || reeferNo || null,
        height: primaryItem?.palletHeight || palletHeight || null,
        palletType: primaryItem?.palletType || palletType || null,
        decksNo: primaryItem?.deckNo || deckNo || null,

        // Luggage specific
        material: primaryItem?.material || material || null,
        color: primaryItem?.color || color || null,
        luggageType: primaryItem?.luggageType || luggageType || null,

        // Envelope specific
        envelopeType: primaryItem?.envelopeType || envelopeType || null,

        // Bundle specific
        bundleQuantity: primaryItem?.bundleQuantity || bundleQuantity || null,
        bundleLength: primaryItem?.bundleLength || bundleLength || null,
        bundleSize: primaryItem?.bundleSize || bundleSize || null,
        itemLocation: primaryItem?.itemLocation || itemLocation || null,
        itemNumber: primaryItem?.itemNumber || itemNumber || null,

        // Other specific
        itemName: primaryItem?.itemName || itemName || null,

        // Common fields
        voyageId: selectedVoyageId || null,
        voyageNo: voyageNo || null,
        bookingDate,
        fromLocation,
        toLocation,
        contactName: contactName.trim(),
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        address: address || null,
        idType,
        // Use primary item's deficiency data or current form
        damageFound: primaryItem?.damageFound || damageFound || null,
        damageLocation: primaryItem?.damageLocation || damageLocation || null,
        deficiencyComment: primaryItem?.deficiencyComment || comment || null,
        paymentStatus,
        remark: remark || null,
        // Items array with full details for each item
        items: items.map(item => ({
          itemType: item.type,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          total: item.total,
          isPaid: item.isPaid,
          // Include service-specific details per item
          service: item.service,
          boxSubType: item.boxSubType,
          cargoSize: item.cargoSize,
          flags: item.flags,
          value: item.value,
          containerNo: item.containerNo,
          chassisNo: item.chassisNo,
          temperature: item.temperature,
          containerSize: item.containerSize,
          containerType: item.containerType,
          contents: item.contents,
          palletNo: item.palletNo,
          reeferNo: item.reeferNo,
          palletHeight: item.palletHeight,
          palletType: item.palletType,
          deckNo: item.deckNo,
          material: item.material,
          color: item.color,
          luggageType: item.luggageType,
          envelopeType: item.envelopeType,
          bundleQuantity: item.bundleQuantity,
          bundleLength: item.bundleLength,
          bundleSize: item.bundleSize,
          itemLocation: item.itemLocation,
          itemNumber: item.itemNumber,
          itemName: item.itemName,
          damageFound: item.damageFound,
          damageLocation: item.damageLocation,
          deficiencyComment: item.deficiencyComment,
        })),
        containerImages: [],
        userDocuments: [],
      };

      console.log("Submitting payload:", payload);

      const res = await apiFetch('/api/bookings/cargo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = "Failed to create booking";
        try {
          const data = JSON.parse(text);
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err: string) => toast.error(err));
            setIsSubmitting(false);
            return;
          }
          errorMsg = data.error || errorMsg;
        } catch (e) {
          if (text.includes("<!DOCTYPE html>")) {
            errorMsg = "Server returned an error page. You may need to log out and log back in (especially if you recently switched databases).";
          }
        }
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();

      // Upload images after booking creation
      const bookingId = data.booking.id;
      let uploadErrors = 0;

      for (const img of containerImages) {
        if (img.file) {
          try {
            await uploadImage(img.file, bookingId, 'CONTAINER', img.caption);
          } catch (error) {
            console.error('Failed to upload container image:', error);
            uploadErrors++;
          }
        }
      }

      for (const doc of userDocuments) {
        if (doc.file) {
          try {
            await uploadImage(doc.file, bookingId, 'USER_DOCUMENT', doc.caption);
          } catch (error) {
            console.error('Failed to upload user document:', error);
            uploadErrors++;
          }
        }
      }

      setCreatedBooking(data);

      if (uploadErrors > 0) {
        toast.success(`Booking created! Invoice: #${data.invoiceNo}`);
        toast.warning(`${uploadErrors} image(s) failed to upload`);
      } else {
        toast.success(`Booking created successfully! Invoice: #${data.invoiceNo}`);
      }

    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (
    file: File,
    bookingId: string,
    imageType: 'CONTAINER' | 'USER_DOCUMENT',
    caption?: string
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    formData.append('imageType', imageType);
    formData.append('bookingType', 'cargo');
    if (caption) {
      formData.append('caption', caption);
    }

    const res = await apiFetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.url;
    }

    const text = await res.text();
    let errorMsg = "Upload failed";
    try {
      const errorData = JSON.parse(text);
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      if (text.includes("<!DOCTYPE html>")) {
        errorMsg = "Upload failed with a server error (HTML). Check your session.";
      }
    }
    throw new Error(errorMsg);
  };

  const { subtotal, vatAmount, grandTotal } = calculateTotals();

  const getLocationName = (code: string) => {
    const loc = locations.find(l => l.code === code);
    return loc ? `${loc.code} - ${loc.name}` : code;
  };

  // Get the title for the current service
  const getServiceTitle = () => {
    if (service === 'BOX') {
      return `${BOX_SUBTYPE_CONFIGS[boxSubType].label.toUpperCase()} ENTRY`;
    }
    return currentServiceConfig.label.toUpperCase();
  };

  // Render service-specific form fields
  const renderServiceFields = () => {
    switch (service) {
      case 'CONTAINER':
        return (
          <ContainerFormFields
            containerNo={containerNo}
            setContainerNo={setContainerNo}
            chassisNo={chassisNo}
            setChassisNo={setChassisNo}
            temperature={temperature}
            setTemperature={setTemperature}
            size={containerSize}
            setSize={setContainerSize}
            containerType={containerType}
            setContainerType={setContainerType}
            value={value}
            setValue={setValue}
            price={price}
            setPrice={setPrice}
            contents={contents}
            setContents={setContents}
          />
        );

      case 'PALLET':
        return (
          <PalletFormFields
            palletNo={palletNo}
            setPalletNo={setPalletNo}
            reeferNo={reeferNo}
            setReeferNo={setReeferNo}
            containerNo={containerNo}
            setContainerNo={setContainerNo}
            height={palletHeight}
            setHeight={setPalletHeight}
            palletType={palletType}
            setPalletType={setPalletType}
            deckNo={deckNo}
            setDeckNo={setDeckNo}
            cargoSize={cargoSize}
            setCargoSize={setCargoSize}
            flags={flags}
            setFlags={setFlags}
            value={value}
            setValue={setValue}
            price={price}
            setPrice={setPrice}
          />
        );

      case 'LUGGAGE':
        return (
          <LuggageFormFields
            material={material}
            setMaterial={setMaterial}
            color={color}
            setColor={setColor}
            luggageType={luggageType}
            setLuggageType={setLuggageType}
            cargoSize={cargoSize}
            setCargoSize={setCargoSize}
            flags={flags}
            setFlags={setFlags}
            value={value}
            setValue={setValue}
            price={price}
            setPrice={setPrice}
          />
        );

      case 'BOX':
        return (
          <BoxFormFields
            boxSubType={boxSubType}
            setBoxSubType={setBoxSubType}
            cargoSize={cargoSize}
            setCargoSize={setCargoSize}
            flags={flags}
            setFlags={setFlags}
            value={value}
            setValue={setValue}
            price={price}
            setPrice={setPrice}
            palletNo={palletNo}
            setPalletNo={setPalletNo}
          />
        );

      case 'ENVELOPE':
        return (
          <EnvelopeFormFields
            envelopeType={envelopeType}
            setEnvelopeType={setEnvelopeType}
            value={value}
            setValue={setValue}
            price={price}
            setPrice={setPrice}
          />
        );

      case 'BUNDLE':
        return (
          <BundleFormFields
            material={material}
            setMaterial={setMaterial}
            quantity={bundleQuantity}
            setQuantity={setBundleQuantity}
            length={bundleLength}
            setLength={setBundleLength}
            bundleSize={bundleSize}
            setBundleSize={setBundleSize}
            deckNo={deckNo}
            setDeckNo={setDeckNo}
            flags={flags}
            setFlags={setFlags}
            value={value}
            setValue={setValue}
            price={price}
            setPrice={setPrice}
            itemLocation={itemLocation}
            setItemLocation={setItemLocation}
            itemNumber={itemNumber}
            setItemNumber={setItemNumber}
          />
        );

      case 'OTHER':
        return (
          <OtherFormFields
            itemName={itemName}
            setItemName={setItemName}
            cargoSize={cargoSize}
            setCargoSize={setCargoSize}
            flags={flags}
            setFlags={setFlags}
            value={value}
            setValue={setValue}
            price={price}
            setPrice={setPrice}
          />
        );

      default:
        return null;
    }
  };

  // Check if deficiency section should show damage location (Container has more detailed damage locations)
  const shouldShowDamageLocation = ['CONTAINER', 'PALLET', 'BUNDLE'].includes(service);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={containerImageRef}
        onChange={handleContainerImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={userDocumentRef}
        onChange={handleUserDocumentUpload}
        accept="image/*,.pdf"
        multiple
        className="hidden"
      />

      {/* Hero Section with Service Title */}
      <div className={`bg-gradient-to-r ${currentServiceConfig.headerBg} text-white py-8 px-4 sm:px-8`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronDown className="w-6 h-6 rotate-90" />
            </button>
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">ENTRY</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              {service === 'BOX' ? BOX_SUBTYPE_CONFIGS[boxSubType].icon : currentServiceConfig.icon}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-wide">
              {getServiceTitle()}
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 pb-32">
        {/* Service Type Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <label className="text-lg font-bold text-gray-800 md:min-w-[120px]">
              Service Type <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full max-w-[400px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#296341]">
                {currentServiceConfig.icon}
              </div>
              <select
                value={service}
                onChange={(e) => {
                  setService(e.target.value as ServiceType);
                  resetServiceFields();
                }}
                className="w-full h-14 bg-[#eef6f2] border border-[#d1e5da] rounded-xl pl-14 pr-12 text-lg font-bold text-[#244234] appearance-none outline-none focus:ring-2 focus:ring-[#296341] cursor-pointer transition-all"
              >
                <option value="CONTAINER">Container</option>
                <option value="PALLET">Pallet</option>
                <option value="LUGGAGE">Luggage</option>
                <option value="BOX">Box</option>
                <option value="ENVELOPE">Envelope</option>
                <option value="BUNDLE">Bundle</option>
                <option value="OTHER">Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dynamic Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          {renderServiceFields()}
        </div>

        {/* Deficiency Section */}
        {['CONTAINER', 'PALLET', 'LUGGAGE', 'BUNDLE'].includes(service) && (
          <div className="mb-8">
            <DeficiencySection
              damageFound={damageFound}
              onDamageFoundChange={setDamageFound}
              damageLocation={damageLocation}
              onDamageLocationChange={setDamageLocation}
              comment={comment}
              onCommentChange={setComment}
              showDamageLocation={shouldShowDamageLocation}
            />
          </div>
        )}

        {/* From / To / Date Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BoxedSelectField
              label="From"
              value={fromLocation}
              onChange={setFromLocation}
              icon={<MapPin className="w-5 h-5 fill-[#296341]/10" />}
              disabled={isLoadingLocations}
              required
              options={
                isLoadingLocations
                  ? [{ value: '', label: 'Loading...' }]
                  : locations.length === 0
                    ? [{ value: '', label: 'No locations available' }]
                    : (selectedVoyageId
                      ? upcomingVoyages.find(v => v.id === selectedVoyageId)?.stops.map((s: any) => ({
                        value: s.location.code,
                        label: `${s.location.code} - ${s.location.name}`
                      })) || locations.map(loc => ({ value: loc.code, label: `${loc.code} - ${loc.name}` }))
                      : locations.map(loc => ({ value: loc.code, label: `${loc.code} - ${loc.name}` }))
                    )
              }
            />
            <BoxedSelectField
              label="To"
              value={toLocation}
              onChange={setToLocation}
              icon={<MapPin className="w-5 h-5 fill-[#296341]/10" />}
              disabled={isLoadingLocations}
              required
              options={
                isLoadingLocations
                  ? [{ value: '', label: 'Loading...' }]
                  : locations.length === 0
                    ? [{ value: '', label: 'No locations available' }]
                    : (selectedVoyageId
                      ? upcomingVoyages.find(v => v.id === selectedVoyageId)?.stops.map((s: any) => ({
                        value: s.location.code,
                        label: `${s.location.code} - ${s.location.name}`
                      })) || locations.map(loc => ({ value: loc.code, label: `${loc.code} - ${loc.name}` }))
                      : locations.map(loc => ({ value: loc.code, label: `${loc.code} - ${loc.name}` }))
                    )
              }
            />
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#296341]" />
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-[48px] bg-white border border-gray-200 rounded-lg px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[16px] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <h3 className="text-[20px] font-bold text-gray-800 mb-6">Photos</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex sm:flex-col gap-4">
              <button
                onClick={() => containerImageRef.current?.click()}
                className="w-14 h-14 flex items-center justify-center bg-[#eef6f2] rounded-xl hover:bg-[#d1e5da] transition-colors border-2 border-dashed border-[#296341]/30"
              >
                <Camera className="w-6 h-6 text-[#296341]" />
              </button>
              <button
                onClick={() => containerImageRef.current?.click()}
                className="w-14 h-14 flex items-center justify-center bg-[#eef6f2] rounded-xl hover:bg-[#d1e5da] transition-colors border-2 border-dashed border-[#296341]/30"
              >
                <Paperclip className="w-6 h-6 text-[#296341]" />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 flex-1 w-full">
              {containerImages.length === 0 ? (
                <div
                  onClick={() => containerImageRef.current?.click()}
                  className="w-full h-[180px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#296341] transition-colors bg-gray-50"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">Click to upload images</p>
                </div>
              ) : (
                <>
                  {containerImages.map((img, index) => (
                    <div key={img.id} className="relative w-[140px] h-[140px] rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                      <img
                        src={img.preview || img.url || imgContainer.src}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeContainerImage(img.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {containerImages.length > 4 && index === 3 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl">
                          +{containerImages.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                  {containerImages.length > 0 && (
                    <div
                      onClick={() => containerImageRef.current?.click()}
                      className="w-[140px] h-[140px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                    >
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Notes / Comments */}
          <div className="mt-6">
            <label className="text-[14px] font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              Comments / Details
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any additional notes or details..."
              className="w-full h-[100px] bg-[#f5f5f5] border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#296341] resize-none text-[16px]"
            />
          </div>
        </div>

        {/* Add Item Button */}
        <div className="mb-8">
          <button
            onClick={handleAddItemFromForm}
            className="w-full bg-[#132540] text-white py-4 rounded-xl text-lg font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            ADD ITEM <span className="text-red-300">*</span>
          </button>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="bg-[#f0f7f3] rounded-2xl p-6 mb-8 space-y-3">
            {items.map((item) => {
              // Get the right icon based on service type
              const getIcon = () => {
                switch (item.icon) {
                  case 'container':
                    return <Container className="w-5 h-5" />;
                  case 'pallet':
                    return <Layers className="w-5 h-5" />;
                  case 'luggage':
                    return <Briefcase className="w-5 h-5" />;
                  case 'box':
                    return <Box className="w-5 h-5" />;
                  case 'envelope':
                    return <Mail className="w-5 h-5" />;
                  case 'bundle':
                    return <Package className="w-5 h-5" />;
                  default:
                    return <MoreHorizontal className="w-5 h-5" />;
                }
              };

              // Get item subtitle with key details
              const getSubtitle = () => {
                const parts: string[] = [];
                if (item.cargoSize) parts.push(item.cargoSize);
                if (item.flags?.fragile) parts.push('Fragile');
                if (item.flags?.hazardous) parts.push('Hazardous');
                if (item.flags?.live) parts.push('Live');
                if (item.damageFound) parts.push(`Damage: ${item.damageFound}`);
                return parts.length > 0 ? parts.join(' • ') : `$${item.unitPrice.toFixed(2)} × ${item.quantity}`;
              };

              return (
                <div key={item.id} className="bg-white rounded-xl py-4 px-6 flex items-center shadow-sm group hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 flex items-center justify-center text-[#296341] bg-[#eef6f2] rounded-lg mr-4">
                    {getIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{item.type}</p>
                    <p className="text-sm text-gray-500 truncate">{getSubtitle()}</p>
                  </div>
                  <div className="text-lg font-black text-[#296341] mx-4 whitespace-nowrap">
                    ${item.total.toFixed(2)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-2 text-gray-400 hover:text-[#296341] hover:bg-[#eef6f2] rounded-lg transition-colors"
                      title="Edit price/quantity"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Services Button */}
        <div className="mb-8">
          <button className="w-full bg-[#132540] text-white py-4 rounded-xl text-lg font-bold hover:bg-[#1a3254] transition-all shadow-md">
            ADDITIONAL SERVICES
          </button>
        </div>

        {/* Summary Section */}
        <div className="bg-[#c2dccf] rounded-3xl p-8 mb-8">
          <h3 className="text-[14px] font-bold text-gray-600 uppercase tracking-wider mb-6">Total Amount</h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-[12px] text-gray-500 uppercase">Quantity</p>
              <p className="text-2xl font-black">{items.reduce((sum, i) => sum + i.quantity, 0)}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 uppercase">Value</p>
              <p className="text-2xl font-black">${subtotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 uppercase">
                {service === 'PALLET' ? 'Pallet#' : service === 'LUGGAGE' ? 'Luggage#' : 'Item#'}
              </p>
              <p className="text-2xl font-black">{items.length > 0 ? items.map((_, i) => 134 + i).join(', ') : '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#296341]" />
              <span className="font-bold">{fromLocation || 'NAS'}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#296341]" />
              <span className="font-bold">{toLocation || 'MAH'}</span>
            </div>
            <div className="ml-auto">
              <p className="text-[12px] text-gray-500 uppercase">Price</p>
              <p className="text-2xl font-black">${grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-[20px] font-bold text-[#296341] mb-6">USER DETAILS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              value={contactName}
              onChange={setContactName}
              placeholder="Enter full name"
              required
            />
            <InputField
              label="Address"
              value={address}
              onChange={setAddress}
              placeholder="Enter address"
            />
            <BoxedInputField
              label="Email Address"
              value={contactEmail}
              onChange={setContactEmail}
              placeholder="Enter email"
              type="email"
            />
            <BoxedInputField
              label="Contact Number"
              value={contactPhone}
              onChange={setContactPhone}
              placeholder="Enter phone number"
              type="tel"
            />
            <BoxedSelectField
              label="ID Type"
              value={idType}
              onChange={setIdType}
              options={[
                { value: 'Passport', label: 'Passport' },
                { value: 'Driver License', label: 'Driver License' },
                { value: 'National ID', label: 'National ID' },
                { value: 'Other', label: 'Other' }
              ]}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-[16px] font-bold text-gray-700 mb-4">Identity Documents</h3>
            <div className="flex flex-wrap gap-4">
              {userDocuments.length === 0 ? (
                <div
                  onClick={() => userDocumentRef.current?.click()}
                  className="w-[150px] h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                >
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center px-2">Upload {idType}</p>
                </div>
              ) : (
                <>
                  {userDocuments.map((doc, index) => (
                    <div key={doc.id} className="relative w-[150px] h-[200px] rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                      <img
                        src={doc.preview || doc.url || imgPassport.src}
                        alt={`${idType} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeUserDocument(doc.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-2 font-medium">
                        {idType}
                      </div>
                    </div>
                  ))}
                  {userDocuments.length < 4 && (
                    <div
                      onClick={() => userDocumentRef.current?.click()}
                      className="w-[150px] h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                    >
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="w-full bg-[#132540] text-white py-4 rounded-xl text-lg font-bold hover:bg-[#1a3254] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT BOOKING'}
          </button>
          {items.length === 0 && (
            <p className="text-center text-sm text-gray-500">
              Fill in the form above and click "Add Item" to add cargo items to your booking
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#296341] py-6 mt-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd." className="h-12 md:h-16" />
          </div>
          <div className="text-white text-lg font-semibold">
            Dock Manager | <span className="font-normal">{contactName || 'Myron Dean'}</span>
          </div>
        </div>
      </footer>

      {/* Edit Item Modal - for editing price/quantity of existing items */}
      {showAddItemModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[500px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[24px] font-bold text-[#296341]">
                Edit Item
              </h3>
              <button
                onClick={() => {
                  setShowAddItemModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Show item type (read-only) */}
              <div className="bg-[#eef6f2] rounded-xl p-4">
                <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">Item Type</p>
                <p className="text-lg font-bold text-[#296341]">{editingItem.type}</p>
                {editingItem.cargoSize && (
                  <p className="text-sm text-gray-600">Size: {editingItem.cargoSize}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <BoxedInputField
                  label="Unit Price ($)"
                  value={newItemUnitPrice}
                  onChange={setNewItemUnitPrice}
                  placeholder="0.00"
                  type="number"
                />
                <BoxedInputField
                  label="Quantity"
                  value={newItemQuantity}
                  onChange={setNewItemQuantity}
                  placeholder="1"
                  type="number"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={newItemIsPaid}
                  onChange={(e) => setNewItemIsPaid(e.target.checked)}
                  className="w-5 h-5 accent-[#296341] rounded"
                />
                <label htmlFor="isPaid" className="text-[16px] font-medium text-gray-700">
                  Mark as Paid
                </label>
              </div>

              {newItemUnitPrice && newItemQuantity && (
                <div className="bg-[#eef6f2] rounded-xl p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-[32px] font-black text-[#296341]">
                    ${(parseFloat(newItemUnitPrice || '0') * parseInt(newItemQuantity || '0')).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateItem}
                  className="flex-1 py-3 rounded-xl bg-[#296341] text-white font-bold hover:bg-emerald-800 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[800px] shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[24px] font-bold text-[#296341]">Booking Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Service Details */}
              <div className="border-b pb-4">
                <h4 className="font-bold text-gray-700 mb-2">Service Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Service:</span> <strong>{service}</strong></div>
                  {service === 'BOX' && <div><span className="text-gray-500">Box Type:</span> <strong>{boxSubType}</strong></div>}
                  <div><span className="text-gray-500">Size:</span> <strong>{cargoSize}</strong></div>
                </div>
              </div>

              {/* Route */}
              <div className="border-b pb-4">
                <h4 className="font-bold text-gray-700 mb-2">Route</h4>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{getLocationName(fromLocation)}</span>
                  <ArrowRight className="w-5 h-5 text-[#296341]" />
                  <span className="font-bold">{getLocationName(toLocation)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Booking Date: {new Date(bookingDate).toLocaleDateString()}</p>
              </div>

              {/* Items */}
              <div className="border-b pb-4">
                <h4 className="font-bold text-gray-700 mb-2">Items ({items.length})</h4>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span>{item.type} x {item.quantity}</span>
                    <span className="font-bold">${item.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 mt-2 border-t-2">
                  <span className="font-bold">Total (incl. 12% VAT)</span>
                  <span className="font-black text-[#296341]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="border-b pb-4">
                <h4 className="font-bold text-gray-700 mb-2">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Name:</span> <strong>{contactName}</strong></div>
                  <div><span className="text-gray-500">Phone:</span> <strong>{contactPhone || '-'}</strong></div>
                  <div><span className="text-gray-500">Email:</span> <strong>{contactEmail || '-'}</strong></div>
                  <div><span className="text-gray-500">ID Type:</span> <strong>{idType}</strong></div>
                </div>
              </div>

              {/* Images */}
              {(containerImages.length > 0 || userDocuments.length > 0) && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">Attachments</h4>
                  <p className="text-sm text-gray-500">
                    {containerImages.length} image(s), {userDocuments.length} document(s)
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#296341] text-white font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}