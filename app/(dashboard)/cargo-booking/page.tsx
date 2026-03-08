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
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import imgCargoShip from "@/app/assets/3f7d36fbe26222b564747f69753922efbd74194d.png";
import imgContainer from "@/app/assets/5edceaf79f7be705450710aa82c190c67fbcaf62.png";
import imgPassport from "@/app/assets/bbad37ee24906289e97d640c601d7cafe55963b5.png";
import imgIdCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

interface CargoItem {
  id: number;
  icon: string;
  type: string;
  unitPrice: number;
  quantity: number;
  total: number;
  isPaid: boolean;
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

export default function CargoBooking() {
  const { apiFetch, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [upcomingVoyages, setUpcomingVoyages] = useState<any[]>([]);
  const [selectedVoyageId, setSelectedVoyageId] = useState("");
  const [isLoadingVoyages, setIsLoadingVoyages] = useState(false);

  // Form State
  const [service, setService] = useState('CONTAINER');
  const [cargoSize, setCargoSize] = useState('Medium');
  const [quantity, setQuantity] = useState("");
  const [pallets, setPallets] = useState("");
  const [type, setType] = useState("DRY");
  const [containerNo, setContainerNo] = useState("");
  const [size, setSize] = useState("");
  const [height, setHeight] = useState("");
  const [reefer, setReefer] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [temperature, setTemperature] = useState("");
  const [decksNo, setDecksNo] = useState("");
  const [boxContains, setBoxContains] = useState("");
  const [voyageNo, setVoyageNo] = useState("");

  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState("Passport");

  const [damageFound, setDamageFound] = useState("");
  const [damageLocation, setDamageLocation] = useState("");
  const [comment, setComment] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [remark, setRemark] = useState("");

  // Items state
  const [items, setItems] = useState<CargoItem[]>([]);

  // Image upload state
  const [containerImages, setContainerImages] = useState<UploadedImage[]>([]);
  const [userDocuments, setUserDocuments] = useState<UploadedImage[]>([]);
  const containerImageRef = useRef<HTMLInputElement>(null);
  const userDocumentRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CargoItem | null>(null);
  const [newItemType, setNewItemType] = useState("DRY BOX(S)");
  const [newItemUnitPrice, setNewItemUnitPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemIsPaid, setNewItemIsPaid] = useState(false);

  // Created booking state
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
          url: '', // Will be set after upload
          file,
          preview,
        });
      }
    });

    setContainerImages([...containerImages, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);

    // Reset input
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

  // Upload image to server (you'll need to implement this endpoint)
  // const uploadImage = async (file: File): Promise<string> => {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('folder', 'cargo-bookings');

  //   try {
  //     const res = await apiFetch('/api/upload', {
  //       method: 'POST',
  //       body: formData,
  //       // Don't set Content-Type header - browser will set it with boundary
  //     });

  //     if (res.ok) {
  //       const data = await res.json();
  //       return data.url;
  //     }
  //     throw new Error('Upload failed');
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     throw error;
  //   }
  // };

  // Add/Edit Item Handler
  const handleAddItem = () => {
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

    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, type: newItemType, unitPrice, quantity: qty, total, isPaid: newItemIsPaid }
          : item
      ));
      toast.success("Item updated successfully");
    } else {
      const newItem: CargoItem = {
        id: Date.now(),
        icon: newItemType.includes('BOX') ? 'box' : 'container',
        type: newItemType,
        unitPrice,
        quantity: qty,
        total,
        isPaid: newItemIsPaid
      };
      setItems([...items, newItem]);
      toast.success("Item added successfully");
    }

    // Reset modal
    setShowAddItemModal(false);
    setEditingItem(null);
    setNewItemType("DRY BOX(S)");
    setNewItemUnitPrice("");
    setNewItemQuantity("");
    setNewItemIsPaid(false);
  };

  const handleEditItem = (item: CargoItem) => {
    setEditingItem(item);
    setNewItemType(item.type);
    setNewItemUnitPrice(item.unitPrice.toString());
    setNewItemQuantity(item.quantity.toString());
    setNewItemIsPaid(item.isPaid);
    setShowAddItemModal(true);
  };

  const handleDeleteItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId));
    toast.success("Item removed");
  };

  // Reset Form
  const resetForm = () => {
    // Show confirmation
    if (items.length > 0 || containerImages.length > 0 || userDocuments.length > 0) {
      if (!confirm("Are you sure you want to reset the form? All data will be lost.")) {
        return;
      }
    }

    setService('CONTAINER');
    setCargoSize('Medium');
    setQuantity("");
    setPallets("");
    setType("DRY");
    setContainerNo("");
    setSize("");
    setHeight("");
    setReefer("");
    setMaterial("");
    setColor("");
    setChassisNo("");
    setTemperature("");
    setDecksNo("");
    setBoxContains("");
    setVoyageNo("");
    setBookingDate(new Date().toISOString().split('T')[0]);
    setDamageFound("");
    setDamageLocation("");
    setComment("");
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

  // Form Validation with toast messages
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
      console.log("Validation failed");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the booking WITHOUT images
      const payload = {
        service,
        cargoSize: cargoSize.toUpperCase(),
        quantity: quantity ? parseInt(quantity) : null,
        pallets: pallets ? parseInt(pallets) : null,
        type,
        containerNo: containerNo || null,
        size: size || null,
        height: height || null,
        reeferNo: reefer || null,
        material: material || null,
        color: color || null,
        chassisNo: chassisNo || null,
        temperature: temperature || null,
        decksNo: decksNo || null,
        boxContains: boxContains || null,
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
        damageFound: damageFound || null,
        damageLocation: damageLocation || null,
        deficiencyComment: comment || null,
        paymentStatus,
        remark: remark || null,
        items: items.map(item => ({
          itemType: item.type,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          total: item.total,
          isPaid: item.isPaid
        })),
        // Don't send images here initially
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

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: string) => toast.error(err));
        } else {
          toast.error(data.error || "Failed to create booking");
        }
        return;
      }

      // Booking created successfully, now upload images
      const bookingId = data.booking.id;
      let uploadErrors = 0;

      // Upload container images
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

      // Upload user documents
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

  // Updated upload function with required parameters
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

    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Upload failed');
  };

  const cargoRadioTypes = ['Small', 'Medium', 'Large', 'Fragile', 'Hazardous', 'Live'];
  const itemTypes = ['DRY BOX(S)', 'FROZEN BOX(S)', 'CONTAINER', 'PALLET', 'CRATE', 'OTHER'];
  const { subtotal, vatAmount, grandTotal } = calculateTotals();

  // Get location name by code
  const getLocationName = (code: string) => {
    const loc = locations.find(l => l.code === code);
    return loc ? `${loc.code} - ${loc.name}` : code;
  };

  return (
    <div>
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

      {/* Hero Illustration */}
      <div className="flex justify-center mb-6 px-4 sm:px-8">
        <img
          src={imgCargoShip.src}
          alt="Cargo Booking Illustration"
          className="w-full max-w-[800px] h-auto object-contain"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-32 flex-1 w-full relative">
        {/* Title Section */}
        <div className="mb-6 md:mb-10 text-center md:text-left">
          <h1 className="text-2xl md:text-[32px] font-bold text-black tracking-wide">
            <span className="border-b-4 border-black pb-1">CARGO</span> BOOKING
          </h1>
        </div>

        {/* Form Section */}
        <div className="space-y-10 max-w-[1100px]">
          {/* Service Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <label className="text-lg md:text-[20px] font-bold text-gray-800 md:min-w-[80px]">
              Service <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full max-w-[500px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#296341]">
                <Container className="w-5 h-5" />
              </div>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full h-12 md:h-[54px] bg-[#eef6f2] border border-[#d1e5da] rounded-md pl-14 pr-10 text-base md:text-[18px] font-bold text-[#244234] appearance-none outline-none focus:ring-2 focus:ring-[#296341]"
              >
                <option value="CONTAINER">CONTAINER</option>
                <option value="PALLET">PALLET</option>
                <option value="BOX">BOX</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
            </div>
          </div>

          {/* Radio Grid (2x3) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-12 max-w-[900px]">
            {cargoRadioTypes.map((sizeType) => (
              <label key={sizeType} className="flex items-center gap-4 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cargoSize === sizeType ? 'border-[#296341]' : 'border-gray-300'}`}
                  onClick={() => setCargoSize(sizeType)}
                >
                  {cargoSize === sizeType && <div className="w-3 h-3 rounded-full bg-[#296341]" />}
                </div>
                <span className="text-[18px] font-medium text-gray-700 group-hover:text-black">{sizeType}</span>
              </label>
            ))}
          </div>

          <div className="h-px bg-gray-200 w-full" />

          {/* Detailed Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Pallets#</label>
              <input
                type="number"
                value={pallets}
                onChange={(e) => setPallets(e.target.value)}
                placeholder="Number of pallets"
                className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold"
                >
                  <option value="DRY">DRY</option>
                  <option value="FROZEN">FROZEN</option>
                  <option value="REFRIGERATED">REFRIGERATED</option>
                  <option value="HAZARDOUS">HAZARDOUS</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Container#</label>
              <input
                value={containerNo}
                onChange={(e) => setContainerNo(e.target.value)}
                placeholder="Container number"
                className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Size</label>
              <div className="relative">
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold"
                >
                  <option value="">Select size</option>
                  <option value="20FT">20 FT</option>
                  <option value="40FT">40 FT</option>
                  <option value="40FT_HC">40 FT HC</option>
                  <option value="45FT">45 FT</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Height</label>
              <div className="relative">
                <select
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold"
                >
                  <option value="">Select height</option>
                  <option value="STANDARD">Standard (8'6")</option>
                  <option value="HIGH_CUBE">High Cube (9'6")</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Reefer#</label>
              <input
                value={reefer}
                onChange={(e) => setReefer(e.target.value)}
                placeholder="Reefer number"
                className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Material</label>
              <input
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Material type"
                className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Color</label>
              <div className="relative">
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold"
                >
                  <option value="">Select color</option>
                  <option value="WHITE">White</option>
                  <option value="BLUE">Blue</option>
                  <option value="GREEN">Green</option>
                  <option value="RED">Red</option>
                  <option value="GRAY">Gray</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Chassis#</label>
              <input
                value={chassisNo}
                onChange={(e) => setChassisNo(e.target.value)}
                placeholder="Chassis number"
                className="w-full h-[45px] border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Temperature</label>
              <input
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g., -18°C"
                className="w-full h-[45px] border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Decks#</label>
              <input
                value={decksNo}
                onChange={(e) => setDecksNo(e.target.value)}
                placeholder="Number of decks"
                className="w-full h-[45px] border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]"
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full" />

          {/* Date / Location row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/10" />
                From <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  disabled={isLoadingLocations}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px] font-bold disabled:bg-gray-100"
                >
                  {isLoadingLocations ? (
                    <option>Loading...</option>
                  ) : locations.length === 0 ? (
                    <option>No locations available</option>
                  ) : (
                    // If a voyage is selected, only show locations from its stops
                    (selectedVoyageId
                      ? upcomingVoyages.find(v => v.id === selectedVoyageId)?.stops.map((s: any) => ({
                        code: s.location.code,
                        name: s.location.name,
                        id: s.location.id
                      })) || locations
                      : locations
                    ).map((loc: any) => (
                      <option key={loc.id} value={loc.code}>{loc.code} - {loc.name}</option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/10" />
                To <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  disabled={isLoadingLocations}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px] font-bold disabled:bg-gray-100"
                >
                  {isLoadingLocations ? (
                    <option>Loading...</option>
                  ) : locations.length === 0 ? (
                    <option>No locations available</option>
                  ) : (
                    // If a voyage is selected, only show locations from its stops
                    (selectedVoyageId
                      ? upcomingVoyages.find(v => v.id === selectedVoyageId)?.stops.map((s: any) => ({
                        code: s.location.code,
                        name: s.location.name,
                        id: s.location.id
                      })) || locations
                      : locations
                    ).map((loc: any) => (
                      <option key={loc.id} value={loc.code}>{loc.code} - {loc.name}</option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
              </div>
            </div>
          </div>

          {/* Voyage Picker */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[18px] font-bold text-gray-700">Select Voyage <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={selectedVoyageId}
                  onChange={(e) => {
                    const vid = e.target.value;
                    setSelectedVoyageId(vid);
                    const v = upcomingVoyages.find(voy => voy.id === vid);
                    if (v) {
                      setVoyageNo(String(v.voyageNo));
                      setBookingDate(new Date(v.date).toISOString().split('T')[0]);
                      if (v.stops && v.stops.length >= 2) {
                        setFromLocation(v.stops[0].location.code);
                        setToLocation(v.stops[v.stops.length - 1].location.code);
                      }
                    }
                  }}
                  disabled={isLoadingVoyages}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px] font-bold disabled:bg-gray-100"
                >
                  <option value="">-- Select an upcoming voyage --</option>
                  {upcomingVoyages.map(v => (
                    <option key={v.id} value={v.id}>
                      Voyage #{v.voyageNo} - {v.shipName} ({new Date(v.date).toLocaleDateString()}) - {v.from.code} to {v.to.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
              </div>
              {isLoadingVoyages && <p className="text-sm text-gray-500">Loading voyages...</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-700">Voyage Number</label>
              <input
                value={voyageNo}
                onChange={(e) => setVoyageNo(e.target.value)}
                placeholder="e.g., 209"
                className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]"
              />
            </div>
          </div>

          {/* Container Image Gallery */}
          <div className="space-y-4 pt-6">
            <h3 className="text-[20px] font-bold text-gray-700">Container Images</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex sm:flex-col gap-4 mt-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => containerImageRef.current?.click()}
                  className="w-12 h-12 flex items-center justify-center bg-[#eef6f2] rounded-lg hover:bg-[#d1e5da] transition-colors"
                >
                  <Camera className="w-6 h-6 text-[#296341]" />
                </button>
                <button
                  onClick={() => containerImageRef.current?.click()}
                  className="w-12 h-12 flex items-center justify-center bg-[#eef6f2] rounded-lg hover:bg-[#d1e5da] transition-colors"
                >
                  <Paperclip className="w-6 h-6 text-[#296341]" />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 flex-1 w-full">
                {containerImages.length === 0 ? (
                  <div
                    onClick={() => containerImageRef.current?.click()}
                    className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Click to upload container images</p>
                  </div>
                ) : (
                  containerImages.map((img, index) => (
                    <div key={img.id} className="relative w-[150px] h-[150px] rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                      <img
                        src={img.preview || img.url || imgContainer.src}
                        alt={`Container ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeContainerImage(img.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                          Main Image
                        </div>
                      )}
                    </div>
                  ))
                )}
                {containerImages.length > 0 && (
                  <div
                    onClick={() => containerImageRef.current?.click()}
                    className="w-[150px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                  >
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Box Contains row */}
          <div className="space-y-2 pt-4 border-b border-gray-100 pb-4">
            <label className="text-[18px] font-bold text-gray-500">Box Contains</label>
            <input
              value={boxContains}
              onChange={(e) => setBoxContains(e.target.value)}
              placeholder="e.g., clothing, shoes, non-perishables"
              className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2"
            />
          </div>

          {/* Deficiency Section */}
          <div className="space-y-6 pt-6">
            <h2 className="text-[26px] font-bold text-[#296341]">DEFICIENCY</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-gray-500">Damage Found</label>
                <div className="relative">
                  <select
                    value={damageFound}
                    onChange={(e) => setDamageFound(e.target.value)}
                    className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] font-bold appearance-none bg-transparent"
                  >
                    <option value="">None</option>
                    <option value="BROKEN">Broken</option>
                    <option value="SCRATCHED">Scratched</option>
                    <option value="DENTED">Dented</option>
                    <option value="WET">Wet</option>
                    <option value="TORN">Torn</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-gray-500">Damage Location</label>
                <div className="relative">
                  <select
                    value={damageLocation}
                    onChange={(e) => setDamageLocation(e.target.value)}
                    className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] font-bold appearance-none bg-transparent"
                  >
                    <option value="">Select location</option>
                    <option value="TOP">Top</option>
                    <option value="BOTTOM">Bottom</option>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                    <option value="LEFT_CENTER">Left Center</option>
                    <option value="RIGHT_CENTER">Right Center</option>
                    <option value="FRONT">Front</option>
                    <option value="BACK">Back</option>
                    <option value="MULTIPLE">Multiple Areas</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-gray-500">Comment</label>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the deficiency..."
                  className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px]"
                />
              </div>
            </div>
          </div>

          {/* Add Item Button */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-6">
            <button
              onClick={() => {
                setEditingItem(null);
                setNewItemType("DRY BOX(S)");
                setNewItemUnitPrice("");
                setNewItemQuantity("");
                setNewItemIsPaid(false);
                setShowAddItemModal(true);
              }}
              className="bg-[#132540] text-white px-8 md:px-12 py-3 rounded-lg text-lg md:text-[22px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95 flex items-center justify-center gap-3"
            >
              <Plus className="w-6 h-6" /> ADD ITEM <span className="text-red-300">*</span>
            </button>
          </div>

          <div className="h-0.5 bg-gray-200 w-full" />

          {/* User Details */}
          <div className="space-y-8">
            <h2 className="text-[26px] font-bold text-[#296341]">USER DETAILS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2 border-l-4 border-gray-100 pl-4">
                <label className="text-[14px] font-bold text-gray-500">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full h-[45px] text-[18px] font-bold uppercase outline-none border-b border-transparent focus:border-[#296341]"
                />
              </div>
              <div className="space-y-2 border-l-4 border-gray-100 pl-4">
                <label className="text-[14px] font-bold text-gray-500">Address</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  className="w-full h-[45px] text-[18px] font-bold outline-none border-b border-transparent focus:border-[#296341]"
                />
              </div>
              <div className="space-y-2 border-l-4 border-gray-100 pl-4">
                <label className="text-[14px] font-bold text-gray-500">Email Address</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>
              <div className="space-y-2 border-l-4 border-gray-100 pl-4">
                <label className="text-[14px] font-bold text-gray-500">Contact Number</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[16px] font-bold text-gray-600">ID Type :</span>
                <div className="relative flex-1">
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full h-[45px] bg-white border border-gray-100 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] font-bold"
                  >
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                    <option value="National ID">National ID</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>
            </div>

            {/* User Document Upload */}
            <div className="space-y-4 pt-6">
              <h3 className="text-[20px] font-bold text-gray-700">Identity Documents</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex sm:flex-col gap-4 mt-2 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => userDocumentRef.current?.click()}
                    className="w-12 h-12 flex items-center justify-center bg-[#eef6f2] rounded-lg hover:bg-[#d1e5da] transition-colors"
                  >
                    <Camera className="w-6 h-6 text-[#296341]" />
                  </button>
                  <button
                    onClick={() => userDocumentRef.current?.click()}
                    className="w-12 h-12 flex items-center justify-center bg-[#eef6f2] rounded-lg hover:bg-[#d1e5da] transition-colors"
                  >
                    <Paperclip className="w-6 h-6 text-[#296341]" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 flex-1 w-full">
                  {userDocuments.length === 0 ? (
                    <div
                      onClick={() => userDocumentRef.current?.click()}
                      className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">Click to upload {idType} images</p>
                    </div>
                  ) : (
                    userDocuments.map((doc, index) => (
                      <div key={doc.id} className="relative w-[150px] h-[200px] rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                        <img
                          src={doc.preview || doc.url || imgPassport.src}
                          alt={`${idType} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeUserDocument(doc.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                          {idType}
                        </div>
                      </div>
                    ))
                  )}
                  {userDocuments.length > 0 && userDocuments.length < 4 && (
                    <div
                      onClick={() => userDocumentRef.current?.click()}
                      className="w-[150px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                    >
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cargo Summary Section */}
        <div className="mt-16 bg-[#c2dccf] rounded-[40px] p-8 lg:p-12 shadow-inner border-b-8 border-emerald-800/20">
          {/* Cargo Items */}
          <div className="space-y-4 mb-10 max-w-[1000px]">
            {items.length === 0 ? (
              <div className="bg-white rounded-xl py-8 px-4 text-center text-gray-500">
                No items added yet. Click "ADD ITEM" to add cargo items.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl py-4 px-4 sm:px-8 flex flex-col sm:flex-row items-center shadow-sm group gap-4 sm:gap-0">
                  <div className="w-12 h-12 flex items-center justify-center text-[#296341]">
                    {item.icon === 'box' || item.type.includes('BOX') ? <Box /> : <Container />}
                  </div>
                  <div className="flex-1 text-lg md:text-[20px] font-bold text-gray-700 sm:ml-4 text-center sm:text-left">
                    {item.type} (${item.unitPrice}) x {item.quantity}
                    {item.isPaid && <span className="ml-2 text-green-600 text-sm">(Paid)</span>}
                  </div>
                  <div className="text-[20px] font-black text-black sm:mr-12">
                    ${item.total.toLocaleString()}
                  </div>
                  <div className="flex gap-6 sm:gap-4">
                    <Edit2
                      onClick={() => handleEditItem(item)}
                      className="w-6 h-6 text-gray-400 group-hover:text-[#296341] cursor-pointer transition-colors"
                    />
                    <Trash2
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-6 h-6 text-gray-400 group-hover:text-red-500 cursor-pointer transition-colors"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-12 mb-20">
            <div className="space-y-6">
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Name</p>
                <p className="text-[20px] font-black">{contactName || '-'}</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Invoice Date</p>
                <p className="text-[20px] font-black">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' / ')}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Voyage {voyageNo || '-'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Contact no.</p>
                <p className="text-[20px] font-black">{contactPhone || '-'}</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Location</p>
                <p className="text-[22px] font-black flex items-center gap-2">
                  {fromLocation || '-'} <ArrowRight className="w-5 h-5" /> {toLocation || '-'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentStatus("PAID")}
                  className={`flex-1 py-1 rounded-full font-bold transition-all shadow-sm ${paymentStatus === 'PAID' ? 'bg-[#296341] text-white' : 'bg-white text-gray-400'}`}
                >
                  PAID
                </button>
                <button
                  onClick={() => setPaymentStatus("UNPAID")}
                  className={`flex-1 py-1 rounded-full font-bold transition-all ${paymentStatus === 'UNPAID' ? 'bg-[#ff4b4b] text-white' : 'bg-white text-gray-400'}`}
                >
                  UNPAID
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Booking Date</p>
                <p className="text-[20px] font-black">
                  {bookingDate ? new Date(bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' / ') : '-'}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Invoice No.</p>
                <p className="text-[22px] font-black">{createdBooking?.invoiceNo ? `#${createdBooking.invoiceNo}` : 'Pending'}</p>
              </div>
              <input
                placeholder="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full h-[45px] bg-[#e1ece6] rounded-lg px-4 shadow-inner outline-none font-bold text-[#244234]"
              />
            </div>
          </div>

          {/* Total Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-gray-50 flex flex-col items-center w-full max-w-[320px] mx-auto">
            <p className="text-[16px] md:text-[18px] font-bold text-gray-400 tracking-widest uppercase">Total Amount</p>
            <p className="text-[36px] md:text-[48px] font-black text-black leading-tight">
              ${grandTotal.toFixed(2)}
            </p>
            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-tight">(Including 12% VAT)</p>
            {subtotal > 0 && (
              <p className="text-[14px] text-gray-500 mt-2">
                Subtotal: ${subtotal.toFixed(2)} + VAT: ${vatAmount.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-16 flex flex-col sm:flex-row justify-center gap-4 md:gap-8">
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-12 md:px-16 py-3 rounded-lg text-lg md:text-[20px] font-bold tracking-widest hover:bg-gray-600 transition-all shadow-lg active:scale-95"
          >
            Reset
          </button>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="bg-[#1e4a2e] text-white px-12 md:px-16 py-3 rounded-lg text-lg md:text-[20px] font-bold tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" /> Preview
          </button>
          <button
            onClick={handleSubmit}
            // onClick={() => console.log("Submitting booking...")}
            disabled={isSubmitting}
            className="bg-[#1e4a2e] text-white px-12 md:px-16 py-3 rounded-lg text-lg md:text-[20px] font-bold tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save & Send'}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#296341] py-6 md:py-8 mt-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd." className="h-12 md:h-[75px]" />
          </div>
          <div className="text-white text-xl md:text-[28px] font-semibold text-center md:text-left">
            Freight Agent | <span className="font-normal">Smith Frank</span>
          </div>
        </div>
      </footer>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[500px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[24px] font-bold text-[#296341]">
                {editingItem ? 'Edit Item' : 'Add New Item'}
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
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-gray-500">Item Type</label>
                <div className="relative">
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    className="w-full h-[50px] border border-gray-200 rounded-lg px-4 text-[18px] font-bold appearance-none outline-none focus:ring-2 focus:ring-[#296341]"
                  >
                    {itemTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-gray-500">Unit Price ($)</label>
                  <input
                    type="number"
                    value={newItemUnitPrice}
                    onChange={(e) => setNewItemUnitPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full h-[50px] border border-gray-200 rounded-lg px-4 text-[18px] outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-gray-500">Quantity</label>
                  <input
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full h-[50px] border border-gray-200 rounded-lg px-4 text-[18px] outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={newItemIsPaid}
                  onChange={(e) => setNewItemIsPaid(e.target.checked)}
                  className="w-5 h-5 accent-[#296341]"
                />
                <label htmlFor="isPaid" className="text-[16px] font-medium text-gray-700">
                  Mark as Paid
                </label>
              </div>

              {newItemUnitPrice && newItemQuantity && (
                <div className="bg-[#eef6f2] rounded-lg p-4 text-center">
                  <p className="text-[14px] text-gray-500">Total</p>
                  <p className="text-[28px] font-black text-[#296341]">
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
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="flex-1 py-3 rounded-lg bg-[#296341] text-white font-bold hover:bg-emerald-800 transition-colors"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
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
                  <div><span className="text-gray-500">Size:</span> <strong>{cargoSize}</strong></div>
                  <div><span className="text-gray-500">Type:</span> <strong>{type}</strong></div>
                  {containerNo && <div><span className="text-gray-500">Container#:</span> <strong>{containerNo}</strong></div>}
                  {quantity && <div><span className="text-gray-500">Quantity:</span> <strong>{quantity}</strong></div>}
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
                    {containerImages.length} container image(s), {userDocuments.length} document(s)
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-lg bg-[#296341] text-white font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50"
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