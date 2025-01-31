import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface RadioButtonProps {
    options: String[];
    checkedValue: String;
    onChange: (value: String) => void;
    style?: object;
}

const RadioButton: React.FC<RadioButtonProps> = ({ options, checkedValue, onChange, style }) => {
    return (
        <View style={[styles.container, style]}>
            {options.map((option) => (
                <TouchableOpacity 
                style={[styles.radioButton, option == checkedValue? styles.activeRadio : {}]}  
                key={option.toString()} 
                onPress={
                    () => onChange(option)
                }>
                    <MaterialIcons
                    name={checkedValue == option? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={24}
                    color={option == checkedValue? "#c8a130" : "white"}/>
                    <Text style={checkedValue == option? styles.selectedText : styles.text}>{option}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    radioButton: {
        height: 60,
        flexDirection: "row",
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: "#8187a8",
        marginHorizontal: 15,
        paddingHorizontal: 15,
        borderRadius: 15,
    },
    activeRadio: {
        backgroundColor: "#c8a130" + "30",
    },
    text: {
        fontSize: 16,
        marginLeft: 15,
        color: "white",
    },
    selectedText: {
        fontSize: 16,
        marginLeft: 15,
        color: "white",
        fontWeight: "bold",
    }
});

export default RadioButton;
