import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Svg, { Rect, Defs, Mask } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const innerDimension = 300;

export const Overlay = () => {
  return (
    <View
      pointerEvents="none"
      style={Platform.OS === "android" ? { flex: 1 } : StyleSheet.absoluteFillObject}
    >
      <Svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Defs>
          <Mask id="mask" x="0" y="0" width={width} height={height}>
            {/* Área visible (blanca = visible, negra = transparente) */}
            <Rect width={width} height={height} fill="white" />
            <Rect
              x={width / 2 - innerDimension / 2}
              y={height / 2 - innerDimension / 2}
              width={innerDimension}
              height={innerDimension}
              rx={50}
              ry={50}
              fill="black"
            />
          </Mask>
        </Defs>

        {/* Overlay negra semitransparente con máscara recortada */}
        <Rect
          width={width}
          height={height}
          fill="black"
          opacity={0.5}
          mask="url(#mask)"
        />
      </Svg>
    </View>
  );
};

export default Overlay;
