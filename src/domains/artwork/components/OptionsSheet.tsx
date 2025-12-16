import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
  onChange?: (open: boolean) => void;
};

const OptionsSheet = forwardRef<BottomSheetModal, Props>(function OptionsSheet(
  { visible, onClose, onReport, onChange }: Props,
  ref
) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["28%"], []);

  useImperativeHandle(ref, () => sheetRef.current, []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      onChange?.(true);
    } else {
      sheetRef.current?.dismiss();
      onChange?.(false);
    }
  }, [visible, onChange]);

  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
      backdropComponent={backdrop}
      onDismiss={onClose}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
      backgroundStyle={{ backgroundColor: "white" }}
    >
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 12) + 8,
        }}
      >
        <Pressable
          onPress={onReport}
          className="flex-row items-center gap-3 py-4"
        >
          <Ionicons name="alert-outline" size={22} color="#0F172A" />
          <Text className="text-base font-semibold text-slate-900">Report</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
});

export default OptionsSheet;
