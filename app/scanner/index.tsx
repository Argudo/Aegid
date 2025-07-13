import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import Overlay from "./Overlay";

export default function QRHome() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  if (hasPermission === null) {
    return null; // o un loading
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No se concedió permiso para la cámara.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            console.log(`QR Encontrado con data: ${data}`);
            router.replace(`/election?uuid=${encodeURIComponent(data)}`);
            setTimeout(() => {
              qrLock.current = false;
            }, 1000);
          }
        }}
      />
      <Overlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
