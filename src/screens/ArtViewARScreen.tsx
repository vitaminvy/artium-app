import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  NativeModules,
  Platform,
  Pressable,
  Share,
  Text,
  TurboModuleRegistry,
  View,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";

type Dimension = {
  w?: number;
  h?: number;
  unit?: string;
};

type ArtViewARRouteParams = {
  artworkId: string;
  title: string;
  imageUrl?: string;
  dimension?: Dimension;
};

type ArtViewSceneProps = {
  imageUrl: string;
  artworkWidthMeters: number;
  artworkHeightMeters: number;
  onPlaneFound: () => void;
  onPlaneSelected: () => void;
  onTrackingUpdated: (state: number, reason: number) => void;
  registerPlaceHandler: (handler: (() => boolean) | null) => void;
  registerResetHandler: (handler: (() => void) | null) => void;
  viro: any;
};

type PlacedArtworkTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
};

const VIRO_PINCH_START = 1;
const VIRO_TRACKING_NORMAL = 3;
const VIRO_TRACKING_REASON_EXCESSIVE_MOTION = 2;
const VIRO_TRACKING_REASON_INSUFFICIENT_FEATURES = 3;
const TRACKING_HINT_THROTTLE_MS = 700;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hasNativeModule = (moduleName: string) => {
  if (NativeModules[moduleName]) return true;
  try {
    return Boolean(TurboModuleRegistry.get(moduleName));
  } catch {
    return false;
  }
};

const toCm = (value: number, unit?: string) => {
  if (!value || value <= 0) return 0;
  const normalized = (unit || "cm").toLowerCase();
  if (normalized === "m") return value * 100;
  if (normalized === "mm") return value / 10;
  if (normalized === "inch" || normalized === "in" || normalized === "inches") return value * 2.54;
  return value;
};

const resolveArtworkSizeMeters = (widthCm: number, heightCm: number) => {
  const fallbackWidth = 0.5;
  const fallbackHeight = 0.5;
  if (widthCm <= 0 || heightCm <= 0) {
    return { width: fallbackWidth, height: fallbackHeight };
  }

  const widthMeters = widthCm / 100;
  const heightMeters = heightCm / 100;
  const maxSide = Math.max(widthMeters, heightMeters);
  if (maxSide <= 1.8) {
    return { width: widthMeters, height: heightMeters };
  }

  const downscale = 1.8 / maxSide;
  return {
    width: widthMeters * downscale,
    height: heightMeters * downscale,
  };
};

function ArtWallScene({
  imageUrl,
  artworkWidthMeters,
  artworkHeightMeters,
  onPlaneFound,
  onPlaneSelected,
  onTrackingUpdated,
  registerPlaceHandler,
  registerResetHandler,
  viro,
}: ArtViewSceneProps) {
  const {
    ViroAmbientLight,
    ViroARScene,
    ViroImage,
    ViroNode,
  } = viro;
  const [artScale, setArtScale] = useState(1);
  const [placedTransform, setPlacedTransform] = useState<PlacedArtworkTransform | null>(null);
  const pinchStartScaleRef = useRef(1);
  const selectedPlaneRef = useRef(false);
  const surfaceReadyRef = useRef(false);
  const latestSurfaceHitRef = useRef<any>(null);

  useEffect(() => {
    registerPlaceHandler(() => {
      const hit = latestSurfaceHitRef.current;
      if (!hit?.transform?.position || !hit?.transform?.rotation) {
        return false;
      }

      selectedPlaneRef.current = true;
      pinchStartScaleRef.current = 1;
      setArtScale(1);
      setPlacedTransform({
        position: hit.transform.position,
        rotation: hit.transform.rotation,
      });
      onPlaneSelected();
      return true;
    });

    registerResetHandler(() => {
      selectedPlaneRef.current = false;
      surfaceReadyRef.current = false;
      latestSurfaceHitRef.current = null;
      pinchStartScaleRef.current = 1;
      setArtScale(1);
      setPlacedTransform(null);
    });

    return () => {
      registerPlaceHandler(null);
      registerResetHandler(null);
    };
  }, [onPlaneSelected, registerPlaceHandler, registerResetHandler]);

  const handlePinch = useCallback((pinchState: number, scaleFactor: number) => {
    if (pinchState === VIRO_PINCH_START) {
      pinchStartScaleRef.current = artScale;
      return;
    }

    const nextScale = clamp(pinchStartScaleRef.current * scaleFactor, 0.45, 2.2);
    setArtScale((currentScale) => (
      Math.abs(currentScale - nextScale) < 0.01 ? currentScale : nextScale
    ));
  }, [artScale]);

  const handleCameraHitTest = useCallback((event: any) => {
    const hit = event.hitTestResults?.find((result: any) => (
      result?.transform?.position &&
      result?.transform?.rotation &&
      (result.type === "ExistingPlaneUsingExtent" || result.type === "ExistingPlane")
    ));

    if (!hit) return;
    latestSurfaceHitRef.current = hit;

    if (!surfaceReadyRef.current && !selectedPlaneRef.current) {
      surfaceReadyRef.current = true;
      onPlaneFound();
    }
  }, [onPlaneFound]);

  return (
    <ViroARScene
      anchorDetectionTypes={["PlanesVertical"]}
      onCameraARHitTest={handleCameraHitTest}
      onTrackingUpdated={onTrackingUpdated}
    >
      <ViroAmbientLight color="#ffffff" intensity={600} />

      {placedTransform ? (
        <ViroNode position={placedTransform.position} rotation={placedTransform.rotation}>
          <ViroNode position={[0, 0.015, 0]} rotation={[-90, 0, 0]} scale={[artScale, artScale, artScale]}>
            <ViroImage
              source={{ uri: imageUrl }}
              width={artworkWidthMeters}
              height={artworkHeightMeters}
              resizeMode="ScaleToFit"
              onPinch={handlePinch}
            />
          </ViroNode>
        </ViroNode>
      ) : null}
    </ViroARScene>
  );
}

export default function ArtViewARScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { setHidden } = useTabBarVisibility();
  const arNavigatorRef = useRef<any>(null);
  const scenePlaceRef = useRef<(() => boolean) | null>(null);
  const sceneResetRef = useRef<(() => void) | null>(null);
  const params = (route.params || {}) as ArtViewARRouteParams;
  const [isCheckingSupport, setIsCheckingSupport] = useState(true);
  const [arSupported, setArSupported] = useState(false);
  const [viroModule, setViroModule] = useState<any>(null);
  const [scanHint, setScanHint] = useState("Đang kiểm tra hỗ trợ AR trên thiết bị");
  const scanHintRef = useRef(scanHint);
  const placementStateRef = useRef({ planeDetected: false, isPlaced: false });
  const lastTrackingHintRef = useRef({ key: "", updatedAt: 0 });
  const [surfaceReady, setSurfaceReady] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);

  const dim = params.dimension || {};
  const widthCm = toCm(dim.w || 0, dim.unit);
  const heightCm = toCm(dim.h || 0, dim.unit);
  const artworkSize = useMemo(
    () => resolveArtworkSizeMeters(widthCm, heightCm),
    [heightCm, widthCm]
  );

  useFocusEffect(
    useCallback(() => {
      setHidden(true);
      return () => setHidden(false);
    }, [setHidden])
  );

  const setScanHintOnce = useCallback((nextHint: string) => {
    if (scanHintRef.current === nextHint) return;
    scanHintRef.current = nextHint;
    setScanHint(nextHint);
  }, []);

  const registerResetHandler = useCallback((handler: (() => void) | null) => {
    sceneResetRef.current = handler;
  }, []);

  const registerPlaceHandler = useCallback((handler: (() => boolean) | null) => {
    scenePlaceRef.current = handler;
  }, []);

  useEffect(() => {
    let active = true;

    const prepareAR = async () => {
      if (Platform.OS === "web") {
        if (!active) return;
        setArSupported(false);
        setIsCheckingSupport(false);
        setScanHintOnce("AR thật cần chạy trên thiết bị iOS/Android có ARKit hoặc ARCore");
        return;
      }

      try {
        const missingModules = [
          "VRTARSceneNavigatorModule",
          "VRTMaterialManager",
          "VRTAnimationManager",
          ...(Platform.OS === "ios" ? ["VRTARUtils"] : []),
        ].filter((moduleName) => !hasNativeModule(moduleName));

        if (missingModules.length > 0) {
          setArSupported(false);
          console.log("Viro native modules missing:", missingModules.join(", "));
          setScanHintOnce("Native AR module chưa có trong app. Hãy rebuild dev client/native app.");
          return;
        }

        const viro = require("@reactvision/react-viro");
        setViroModule(viro);

        const support = await viro.isARSupportedOnDevice();
        if (!active) return;

        if (!support?.isARSupported) {
          setArSupported(false);
          setScanHintOnce("Thiết bị này không hỗ trợ ARKit/ARCore");
          return;
        }

        const currentPermissions = await viro.checkPermissions(["camera"]);
        const permissions = currentPermissions.camera
          ? currentPermissions
          : await viro.requestRequiredPermissions(["camera"]);

        if (!active) return;

        if (!permissions.camera) {
          setArSupported(false);
          setScanHintOnce("Cần quyền camera để mở AR thật");
          return;
        }

        setArSupported(true);
        setScanHintOnce("Di chuyển điện thoại chậm để tìm mặt tường");
      } catch (err) {
        console.error("Failed to prepare Viro AR:", err);
        if (!active) return;
        setArSupported(false);
        setScanHintOnce("Không thể khởi động AR. Hãy rebuild app native sau khi cài ViroReact.");
      } finally {
        if (active) setIsCheckingSupport(false);
      }
    };

    void prepareAR();
    return () => {
      active = false;
    };
  }, [setScanHintOnce]);

  const handleTrackingUpdated = useCallback((state: number, reason: number) => {
    const { planeDetected: hasPlaneDetected, isPlaced: hasPlacedArtwork } = placementStateRef.current;
    let nextHint: string | null = null;

    if (state === VIRO_TRACKING_NORMAL) {
      if (!hasPlaneDetected && !hasPlacedArtwork) {
        nextHint = "Di chuyển điện thoại chậm để tìm mặt tường";
      }
    } else if (reason === VIRO_TRACKING_REASON_EXCESSIVE_MOTION) {
      nextHint = "Di chuyển máy chậm hơn để AR bắt tường ổn định";
    } else if (reason === VIRO_TRACKING_REASON_INSUFFICIENT_FEATURES) {
      nextHint = "Hướng camera vào bức tường có đủ ánh sáng và chi tiết";
    } else {
      nextHint = "Đang ổn định tracking AR";
    }

    if (!nextHint) return;

    const now = Date.now();
    const trackingKey = `${state}:${reason}:${nextHint}`;
    if (
      lastTrackingHintRef.current.key !== trackingKey ||
      now - lastTrackingHintRef.current.updatedAt >= TRACKING_HINT_THROTTLE_MS
    ) {
      lastTrackingHintRef.current = { key: trackingKey, updatedAt: now };
      setScanHintOnce(nextHint);
    }
  }, [setScanHintOnce]);

  const handlePlaneFound = useCallback(() => {
    if (!placementStateRef.current.planeDetected) {
      placementStateRef.current = { ...placementStateRef.current, planeDetected: true };
      setSurfaceReady(true);
    }

    if (!placementStateRef.current.isPlaced) {
      setScanHintOnce("Đã bắt được mặt tường. Nhắm tâm camera rồi bấm Đặt tranh.");
    }
  }, [setScanHintOnce]);

  const handlePlaneSelected = useCallback(() => {
    if (!placementStateRef.current.isPlaced) {
      placementStateRef.current = { planeDetected: true, isPlaced: true };
      setSurfaceReady(true);
      setIsPlaced(true);
    }
    setScanHintOnce("Tranh đã bám vào mặt tường thật. Chụm/mở hai ngón để đổi kích thước.");
  }, [setScanHintOnce]);

  const handlePlaceArtwork = useCallback(() => {
    const didPlace = scenePlaceRef.current?.() ?? false;
    if (!didPlace) {
      setSurfaceReady(false);
      placementStateRef.current = { planeDetected: false, isPlaced: false };
      setScanHintOnce("Chưa bắt được tường. Di chuyển máy chậm rồi hướng camera vào mặt tường.");
    }
  }, [setScanHintOnce]);

  const handleResetPlacement = useCallback(() => {
    placementStateRef.current = { planeDetected: false, isPlaced: false };
    setSurfaceReady(false);
    setIsPlaced(false);
    if (sceneResetRef.current) {
      sceneResetRef.current();
    } else {
      setSceneKey((key) => key + 1);
    }
    setScanHintOnce("Di chuyển điện thoại chậm để tìm mặt tường");
  }, [setScanHintOnce]);

  const handleSnapshot = useCallback(async () => {
    if (!isPlaced || isTakingSnapshot) return;
    try {
      setIsTakingSnapshot(true);
      const result = await arNavigatorRef.current?._takeScreenshot?.(
        `artview-${params.artworkId}-${Date.now()}`,
        false
      );
      const snapshotUri = result?.url || result?.uri;
      if (!result?.success || !snapshotUri) {
        throw new Error(result?.errorCode || "Viro screenshot failed");
      }
      await Share.share({
        url: snapshotUri,
        message: `ArtView AR: ${params.title}`,
      });
    } catch (err) {
      console.error("Failed to take AR snapshot:", err);
      Alert.alert("Không thể tạo ảnh AR", "Vui lòng thử lại.");
    } finally {
      setIsTakingSnapshot(false);
    }
  }, [isPlaced, isTakingSnapshot, params.artworkId, params.title]);

  if (!params.imageUrl) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-white text-lg font-semibold text-center">
          Không tìm thấy ảnh tranh để hiển thị AR.
        </Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-5 bg-[#0B73FF] px-6 py-3 rounded-full">
          <Text className="text-white font-semibold">Quay lại chi tiết</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {arSupported && viroModule ? (
        <viroModule.ViroARSceneNavigator
          key={sceneKey}
          ref={arNavigatorRef}
          autofocus
          provider="none"
          worldAlignment="Gravity"
          initialScene={{
            scene: ArtWallScene,
            passProps: {
              imageUrl: params.imageUrl,
              artworkWidthMeters: artworkSize.width,
              artworkHeightMeters: artworkSize.height,
              onPlaneFound: handlePlaneFound,
              onPlaneSelected: handlePlaneSelected,
              onTrackingUpdated: handleTrackingUpdated,
              registerPlaceHandler,
              registerResetHandler,
              viro: viroModule,
            },
          } as any}
          style={{ flex: 1 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="scan-outline" size={40} color="#E2E8F0" />
          <Text className="text-white text-lg font-semibold text-center mt-4">
            {isCheckingSupport ? "Đang chuẩn bị AR" : "Không mở được AR thật"}
          </Text>
          <Text className="text-slate-300 text-center mt-2">{scanHint}</Text>
          {!isCheckingSupport ? (
            <Pressable onPress={() => Linking.openSettings()} className="mt-5 bg-white/90 px-6 py-3 rounded-full">
              <Text className="text-slate-900 font-semibold">Mở cài đặt</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      <View
        className="absolute left-0 right-0"
        style={{ top: Math.max(insets.top + 10, 22), paddingHorizontal: 16 }}
        pointerEvents="box-none"
      >
        <View className="rounded-2xl bg-black/60 px-4 py-3">
          <Text className="text-white font-semibold">{params.title}</Text>
          <Text className="text-slate-200 text-xs mt-1">ArtView AR - ARKit/ARCore wall placement</Text>
          <Text className="text-slate-100 text-sm mt-2">{scanHint}</Text>
          {widthCm > 0 && heightCm > 0 ? (
            <Text className="text-slate-300 text-xs mt-1">
              Kích thước thật: {Math.round(widthCm)} x {Math.round(heightCm)} cm
            </Text>
          ) : null}
        </View>
      </View>

      <View className="absolute left-0 right-0 px-4" style={{ bottom: Math.max(insets.bottom + 18, 18) }}>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={isPlaced ? handleSnapshot : () => navigation.goBack()}
            disabled={isPlaced && isTakingSnapshot}
            className={`flex-1 rounded-full bg-white/90 py-3 px-4 flex-row items-center justify-center ${
              isPlaced && isTakingSnapshot ? "opacity-60" : "opacity-100"
            }`}
          >
            <Ionicons name={isPlaced ? "camera-outline" : "arrow-back-outline"} size={18} color="#0F172A" />
            <Text className="ml-2 text-slate-900 font-semibold">
              {isPlaced
                ? isTakingSnapshot
                  ? "Đang tạo ảnh..."
                  : "Chia sẻ ảnh AR"
                : "Quay lại"}
            </Text>
          </Pressable>
          <Pressable
            onPress={isPlaced ? handleResetPlacement : handlePlaceArtwork}
            disabled={!isPlaced && !surfaceReady}
            className={`flex-1 rounded-full bg-[#0B73FF] py-3 px-4 flex-row items-center justify-center ${
              !isPlaced && !surfaceReady ? "opacity-60" : "opacity-100"
            }`}
          >
            <Ionicons name={isPlaced ? "reload-outline" : "scan-outline"} size={18} color="#ffffff" />
            <Text className="ml-2 text-white font-semibold">
              {isPlaced ? "Đặt lại" : surfaceReady ? "Đặt tranh" : "Đang tìm tường"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
