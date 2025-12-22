import { useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AddressForm, DeliveryMethod } from "../types";
import { createEmptyAddress } from "../constants";

export function useCheckoutForm() {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("artium");
  const [promoCode, setPromoCode] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const [addressByMethod, setAddressByMethod] = useState<Record<DeliveryMethod, AddressForm>>({
    artium: createEmptyAddress(),
    seller: createEmptyAddress(),
  });

  const addressSheetRef = useRef<BottomSheetModal>(null);
  const guaranteeSheetRef = useRef<BottomSheetModal>(null);

  const currentAddress = addressByMethod[deliveryMethod];
  const hasAddress = Object.values(currentAddress).some((value) => value.trim().length > 0);
  const addressTitle = deliveryMethod === "artium" ? "Shipping Address" : "Pick up / ship address";

  const handleSaveAddress = (address: AddressForm) => {
    setAddressByMethod((prev) => ({
      ...prev,
      [deliveryMethod]: address,
    }));
  };

  const openAddressSheet = () => {
    addressSheetRef.current?.present();
  };

  const openGuaranteeSheet = () => {
    guaranteeSheetRef.current?.present();
  };

  const handleDeliveryMethodChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
  };

  return {
    deliveryMethod,
    promoCode,
    setPromoCode,
    showExitConfirm,
    setShowExitConfirm,
    addressByMethod,
    currentAddress,
    hasAddress,
    addressTitle,
    addressSheetRef,
    guaranteeSheetRef,
    openAddressSheet,
    openGuaranteeSheet,
    handleSaveAddress,
    handleDeliveryMethodChange,
  };
}
