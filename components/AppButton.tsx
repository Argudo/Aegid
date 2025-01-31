import React, { forwardRef } from "react";
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Pressable, Text, View, Dimensions } from 'react-native';

const AppButton = forwardRef((props: any, ref: any) => {
    return (
        <Pressable
        style={({ pressed }) => [
            {
            backgroundColor: props.disabled
                ? "#ccc"
                : pressed
                ? "#9699b0"
                : '#404462',
            },
            styles.container,
            props.buttonStyles,
        ]}
        disabled={props.disabled}
        onPress={props.onPress}
        accessible
        accessibilityLabel={props.accessibilityLabel || "A Button"}
        >
        <View style={{gap: 24, alignItems:  'center'}}>
            {props.iconSuplier === FontAwesome5 ? 
            <FontAwesome5 name={props.icon} size={24} color="white" /> 
            : 
            <MaterialCommunityIcons name={props.icon} size={32} color="white" />}
            <Text style={[styles.text, props.textStyles]}>
            {props.title || "Press Me"}
            </Text>
        </View>
        </Pressable>
    );
});

  const styles = StyleSheet.create({
    text: { color: "white", fontSize: 16,  fontFamily: 'Avenir-Roman' },
    container: {
      flex: 1,
      padding: 24,
      paddingVertical: 40,
      alignItems: "center",
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

export default AppButton;