
import { View, Text,  StyleSheet, Pressable, Dimensions, Modal, Button, ScrollView } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import DropdownAlert, { DropdownAlertData, DropdownAlertType, } from 'react-native-dropdownalert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {BarCodeScanner} from 'expo-barcode-scanner';
import QRCodeScanner from 'expo-qrcode-scanner';

const RDCORE_URL = 'https://rnqzf-79-117-157-46.a.free.pinggy.link';
const AGORAPP_URL = 'https://62b4-79-117-157-46.ngrok-free.app';

const LargeButton = (props : any) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          marginTop: 15,
          borderColor: 'white',
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
      <View style={{alignItems:  'center', flexDirection: 'column', justifyContent: 'space-between', gap: 10}}>
        {props.iconSuplier === FontAwesome5 ? 
        <FontAwesome5 name={props.icon} size={20} color="white" /> 
        : 
        <MaterialCommunityIcons name={props.icon} size={25} color="white" />}
        <Text style={[styles.text, props.textStyles]}>
          {props.title || "Press Me"}
        </Text>
      </View>
    </Pressable>
  );
};

const IconButton = (props : any) => {
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
      <View style={{gap: 14, alignItems:  'center', flexDirection: 'column', justifyContent: 'space-between'}}>
        {props.iconSuplier === FontAwesome5 ? 
        <FontAwesome5 name={props.icon} size={20} color="white" /> 
        : 
        <MaterialCommunityIcons name={props.icon} size={25} color="white" />}
        <Text style={[styles.text, props.textStyles]}>
          {props.title || "Press Me"}
        </Text>
      </View>
    </Pressable>
  );
};

const KeyEntry = (props : any) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: props.disabled
            ? "#ccc"
            : pressed
            ? "#9699b0"
            : '#404462',
          marginBottom: 24,
        },
        styles.container,
        props.buttonStyles,
      ]}
      disabled={props.disabled}
      onPress={props.onPress}
      accessible
      accessibilityLabel={props.accessibilityLabel || "A Button"}
    >
      <View style={{gap: 14, alignItems:  'center', flexDirection: 'column', justifyContent: 'space-between'}}>
        <Text style={[styles.text, props.textStyles, {textAlign: 'center', lineHeight: 28}]}>
          {props.title || "Press Me"}
        </Text>
      </View>
    </Pressable>
  );
};

interface KeyModel {
  vkc: string;
  private_key: string;
  public_hash: string;
  created_at: string;
}

const KeyModel = {
  vkc: "",
  private_key: "",
  public_hash: "",
  created_at: "",
};


export default function KeysCopyScreen() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const toggleShowPassword = () => {
      setShowPassword(!showPassword);
      showPassword ? setPassword(keys.vkc.split('-').join(' ')) : setPassword(keys.vkc.split('-').join(' ').replace(/\S/gm, '·'));
  };

  let alert = (_data: DropdownAlertData) => new Promise<DropdownAlertData>(res => res);

  const [keys, setKeys] = useState(KeyModel);
  const [history, setHistory] = useState<KeyModel[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const handleCloseModal = () => { setModalVisible(false); }
  const generateKeys = async () => {

    // Si existen claves, guardarlas en el historial
    if(keys != null){
      AsyncStorage.getItem('history').then((history) => {
        let storedHistory = [];
        if (history !== null) {
          storedHistory = JSON.parse(history);
          console.log(`[KeysScreen] ${history}`);
          storedHistory.unshift(keys);
          AsyncStorage.setItem('history', JSON.stringify(storedHistory));
          setHistory(storedHistory);
        }
      });
    }

    const newKeys = await fetch(`${RDCORE_URL}/create-keys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((newKeys) => newKeys.json())
    .then((data) => {
      KeyModel.private_key = data.private_key;
      KeyModel.public_hash = data.public_hash;
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    console.log(KeyModel.public_hash);

    const newVKC = fetch(`${RDCORE_URL}/generate-keycode/${KeyModel.public_hash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((newVKC) => newVKC.json())
    .then((data) => {
      console.log(data);
      KeyModel.vkc = data.keycode;
      AsyncStorage.setItem('keys', JSON.stringify(KeyModel));
      setModalVisible(false);

      setKeys(KeyModel);
      setPassword(keys.vkc.split('-').join(' '));
    }).catch((error) => {
      console.error('Error:', error);
    });
  }

  // Solicitar permisos 
  const [hasPermission, setHasPermission] = useState(false);
  
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
  })();
    // Cargar datos desde AsyncStorage
    const fetchData = async () => {
      try {
        // Recuperar clave activa
        const stored_keys = await AsyncStorage.getItem('keys');
        if (stored_keys !== null) {
          // Si hay datos, guardarlos en el estado
          setKeys(JSON.parse(stored_keys));
          setPassword(keys.vkc);
        } else {
          // Si no hay datos, mostrar el modal
          setModalVisible(true);
        }

        const stored_history = await AsyncStorage.getItem('history');
        if (stored_history !== null) {
          setHistory(JSON.parse(stored_history));
        }
      } catch (error) {
        console.error('Error loading data', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (keys && keys.vkc) {
      setPassword(keys.vkc.split('-').join(' '));
    }
  }, [keys]);

  return (
    <View style={{ flex: 1 }}>
    <QRCodeScanner
        onScanSuccess={(scanData) => console.log(scanData)}
        onScanFail={() => console.log('Failed to scan')}
        // Additional props
    />
    </View>
  )
}

const styles = StyleSheet.create({
  text: { 
    color: "white", 
    fontSize: 16,  
    fontFamily: 'Avenir-Roman' 
  },
  container: {
    padding: 24,
    paddingVertical: 24,
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
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
  header: {
    backgroundColor: '#696b86', 
    paddingTop: 32,  
    marginHorizontal: Dimensions.get('window').width / 18, 
    color: 'white', 
    fontSize: 24,
    fontFamily: 'Avenir-Roman',
    fontWeight: 'bold',
  },
  keyContainer: {
    flexDirection: 'column',
    gap: 16,
    marginHorizontal: Dimensions.get('window').width / 18, 
    marginTop: 16,
    textAlign: 'center',
  },
  input: {
      flex: 1,
      color: '#333',
      paddingVertical: 10,
      paddingRight: 10,
      fontSize: 24,
  },
  icon: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
});