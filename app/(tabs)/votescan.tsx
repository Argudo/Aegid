import React, { forwardRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable, Dimensions } from "react-native";
import { Link, Stack } from "expo-router";
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions } from "expo-camera";

const AppButton = forwardRef((props: any, ref: any) => {
  return (
    <Pressable
      ref={ref}
      style={({ pressed }) => [
        {
          backgroundColor: props.disabled
            ? "#ccc"
            : pressed
            ? "#9699b0"
            : "#404462",
        },
        styles.container,
        props.buttonStyles,
      ]}
      disabled={props.disabled}
      onPress={props.onPress}
      accessible
      accessibilityLabel={props.accessibilityLabel || "A Button"}
    >
      <View style={{ gap: 24, alignItems: "center" }}>
        {props.iconSuplier === FontAwesome5 ? (
          <FontAwesome5 name={props.icon} size={24} color="white" />
        ) : (
          <MaterialCommunityIcons name={props.icon} size={32} color="white" />
        )}
        <Text style={[styles.text, props.textStyles]}>
          {props.title || "Press Me"}
        </Text>
      </View>
    </Pressable>
  );
});

export default function VoteScan() {
  const [permission, requestPermission] = useCameraPermissions();

  const isPermissionGranted = Boolean(permission?.granted);

  return (
    <SafeAreaView style={styles.main}>
        <Link href={"/scanner"} asChild>
            <AppButton
                title="ESCANEAR QR DE VOTACIÓN"
                iconSuplier={MaterialCommunityIcons}
                icon="qrcode-scan"
                onPress={() => {}}
                accessibilityLabel="Learn more about this purple button"
              />
        </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#696b86",
    justifyContent: "space-around",
    paddingVertical: 80,
  },
  // title: {
  //   color: "white",
  //   fontSize: 40,
  // },
  buttonStyle: {
    color: "#0E7AFE",
    fontSize: 20,
    textAlign: "center",
  },
  text: { color: "white", fontSize: 16,  fontFamily: 'Avenir-Roman' },
  container: {
    height: 200,
    width:  Dimensions.get('window').width - 100,
    margin: "auto",
    padding: 24,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 24,
    gap: 24,
  },
  title: {
    fontSize: 48,
    marginHorizontal: Dimensions.get('window').width / 18,
    textAlign: 'center',
    color: '#C2A33E',
    fontWeight: 'bold',
    fontFamily: 'Avenir-Book',
    marginTop: 16,
  },
});
