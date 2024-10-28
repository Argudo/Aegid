import { Image, StyleSheet, Platform, Dimensions } from 'react-native';
import { View, Text,  Button, Pressable, TouchableHighlight } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const AppButton = (props : any) => {
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
};

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#404462' }}>
    <SafeAreaView style={{ backgroundColor: '#404462' }}>
      <Text style={styles.title}>AEGID</Text>
    </SafeAreaView>
      <View style={{ flex: 1, padding: 'auto', alignSelf: 'stretch', backgroundColor: '#696b86'}}>
        <View style={{ margin: 'auto', gap: 24, marginHorizontal: Dimensions.get('window').width / 18 }}>
          <View style={styles.titleContainer}>
            <AppButton
                title="FIRMAR VOTO"
                iconSuplier={FontAwesome5}
                icon="signature"
                onPress={() => {}}
                accessibilityLabel="Learn more about this purple button"
              />
          </View>
          <View style={styles.titleContainer}>
            <AppButton
                title="CONSULTAR  VOTO"
                iconSuplier={FontAwesome5}
                icon="vote-yea"
                accessibilityLabel="Learn more about this purple button"
            />
            {/* <AppButton
              title="REGENERAR CLAVES"
              iconSuplier={FontAwesome5}
              icon="key"
              accessibilityLabel="Learn more about this purple button"
            /> */}
          </View>
        </View>
      </View>
  </View>
  );
}

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
