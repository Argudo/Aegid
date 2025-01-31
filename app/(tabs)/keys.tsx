
import { View, Text,  StyleSheet, Pressable, Dimensions, Modal, Button, ScrollView } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import DropdownAlert, { DropdownAlertData, DropdownAlertType, } from 'react-native-dropdownalert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { create } from 'react-test-renderer';
import { red } from 'react-native-reanimated/lib/typescript/Colors';

const RDCORE_URL = 'http://192.168.1.170:4321';
const AGORAPP_URL = 'http://192.168.1.170:8080';

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
        <Text style={[styles.text, props.textStyles, {textAlign: 'center', lineHeight: 28, fontSize: props.fontSize || 16}]}>
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

export default function KeysScreen() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const toggleShowPassword = () => {
    if(keys != null){
      setShowPassword(!showPassword);
      showPassword ? setPassword(keys.vkc.split('-').join(' ')) : setPassword(keys.vkc.split('-').join(' ').replace(/\S/gm, '·'));
    }
  };

  let alert = (_data: DropdownAlertData) => new Promise<DropdownAlertData>(res => res);

  const [keys, setKeys] = useState<KeyModel>();
  const [history, setHistory] = useState<KeyModel[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [removeAllModalVisible, setRemoveAllModalVisible] = useState(false);
  const handleCloseModal = () => { setModalVisible(false); }
  const generateKeys = async () => {
    // Si existen claves, guardarlas en el historial
    if(keys != null){
      console.log("Saving old keys...")
      AsyncStorage.getItem('history').then((history) => {
        let storedHistory = [];
        if (history != null) {
          storedHistory = JSON.parse(history);
          console.log(`[KeysScreen] ${history}`);
          storedHistory.unshift(keys);
        }
        AsyncStorage.setItem('history', JSON.stringify(storedHistory));
        setHistory(storedHistory);
        console.log("Old keys saved");
      });
    }
    else{
      console.log("Not old key found");
    }

    // Try to request new keys 
    try{
      console.log(`Creating new keys...`);

      var keys_model: KeyModel;
      const create_keys_response = await (await fetch(`${RDCORE_URL}/create-keys`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })).json();
      console.log(`[RDCore Query] create-keys\n public_hash: ${create_keys_response.public_hash}\n private_key: ${create_keys_response.private_key}`);

      const vkc_generate_response = await (await fetch(`${RDCORE_URL}/generate-keycode/${create_keys_response.public_hash}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })).json();
      console.log(`[RDCore Query] generate-keycode\n vkc: ${vkc_generate_response.keycode}`);

      keys_model = {
        vkc: vkc_generate_response.keycode,
        private_key: create_keys_response.private_key,
        public_hash: create_keys_response.public_hash,
        created_at: Date.now().toString()
      };
      
      setModalVisible(false);
      AsyncStorage.setItem('keys', JSON.stringify(keys_model));
      setKeys(keys_model);
      setPassword(keys_model.vkc.split('-').join(' '));

      console.log(`New keys created succesfully!`);
    } catch(error){
        console.error('Error:', error);
    }
  }
  
  useEffect(() => {
    // Cargar datos desde AsyncStorage
    const fetchData = async () => {
      try {
        // Recuperar clave activa
        const stored_keys = await AsyncStorage.getItem('keys');
        if (stored_keys !== null) {
          // Si hay datos, guardarlos en el estado
          setKeys(JSON.parse(stored_keys));
          if(keys != undefined){
            setPassword(keys.vkc);
          }
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
    <View style={{ flex: 1, backgroundColor: '#404462' }}>
      <SafeAreaView style={{ backgroundColor: '#404462' }}>
      </SafeAreaView>
      <View style={{  backgroundColor: '#696b86'}}>
        <Text style={styles.header}>VKC ACTIVO</Text>
        <View style={{
              marginHorizontal : Dimensions.get('window').width / 18,
              marginTop: 16,
              backgroundColor: '#404462',
              borderRadius: 8,
            }}>
          <Text style={{
              color: 'white',
              fontSize: showPassword ? 40 : 24,
              lineHeight: showPassword ? 40 : 40,
              paddingTop: showPassword ? 26 : 16,
              padding: 16,
              fontFamily: 'Avenir-Roman',
              fontWeight: 'bold',
              textAlign: 'center',
              }}>
            {password}
          </Text>
        </View>
        <View style={{height: 120, marginHorizontal : Dimensions.get('window').width / 18}}>
          <LargeButton
                title="Sincronizar"
                iconSuplier={MaterialCommunityIcons}
                icon="cloud-upload"
                onPress={ async () => { 
                  console.log("Uploading keys...")
                  try{
                    if (keys == null) throw "key is not initalized"

                    const vkc_upload_response = await fetch(`${AGORAPP_URL}/api/vkc`, {
                      method: 'POST',
                      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                      body: JSON.stringify({dni: "32093901X", vkc: `${keys.public_hash}`})
                    }); 

                    console.log("Keys uploaded succesfully!...")
                    console.log(`[Agorapp Query] response: ${vkc_upload_response.status}`);
                  } catch (error) {
                    console.error('Error uploading keys, ', error);
                  }
                    
              }}
              accessibilityLabel="Upload keys to agorapp"
          />
        </View>
          
        <View style={{flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', marginHorizontal : Dimensions.get('window').width / 18, marginTop: 16, gap: 16}}>
          <IconButton
              title={showPassword ? "Mostrar" : "Ocultar"} 
              iconSuplier={FontAwesome5}
              icon={showPassword ? "eye" : "eye-slash"} 
              onPress={() => {toggleShowPassword()}}
              accessibilityLabel="Learn more about this purple button"
            />
            <IconButton
              title="Copiar"
              iconSuplier={FontAwesome5}
              icon="copy"
              onPress={async () => { 
                await Clipboard.setStringAsync(password); 
                await alert({
                  type: DropdownAlertType.Success,
                  title: 'Éxito',
                  message: 'Su clave ha sido copiada al portapapeles',
              });}}
              accessibilityLabel="Learn more about this purple button"
            />
            <IconButton
              title="Regenerar"
              iconSuplier={MaterialCommunityIcons}
              icon="reload"
              onPress={ async () => { await AsyncStorage.removeItem('keys'); setModalVisible(true); setPassword('');}}
              accessibilityLabel="Learn more about this purple button"
            />
        </View>
    </View>
    <View style={{ flex: 2,  backgroundColor: '#696b86'}}>
        <Text style={styles.header}>HISTORIAL DE CLAVES</Text>
        <ScrollView style={styles.keyContainer}>
          {history.map((item, index) => (
            item.vkc ? (
              <KeyEntry
                key={index}
                title={showPassword? item.vkc.split('-').join(' ').replace(/\S/gm, '·') : item.vkc.split('-').join(' ')}
                fontSize = {showPassword? 26 : 16}
                iconSuplier={FontAwesome5}
                onPress={() => console.log(`${item.vkc}`)}
                icon="eye"
                accessibilityLabel="Learn more about this purple button"
              />
            ) : null
          ))}
          { history.length > 0 && 
              <Text onPress={ () => setRemoveAllModalVisible(true) } style={{textDecorationLine: 'underline', color: 'white', textAlign: 'center', marginBottom: 24}}>{'Remove all'}</Text>
          }
        </ScrollView>
            

    </View>
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{lineHeight: 20, color: 'white'}}>No se encontró ninguna clave almacenada en el almacenamiento del dispostivo.</Text>
            <Text style={{margin: 14, fontWeight: 'bold', color: 'white'}}>¿Deseas solicitar un nuevo VKC?</Text>
            <Button title="Generar" onPress={generateKeys} />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={removeAllModalVisible}
        onRequestClose={ () => setRemoveAllModalVisible(false) }
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{margin: 14, fontWeight: 'bold', color: 'orange', textAlign: 'center'}}>¡ATENCIÓN!{"\n"}ESTA ACCIÓN ES IRREVOCABLE</Text>
            <Text style={{lineHeight: 20, color: 'white', fontSize: 18, marginBottom: 14}}>¿Estás seguro que quieres borrar todas tus claves guardadas?.</Text>
            <Button title="BORRAR" color={'red'} onPress= { () => {
                setHistory([]);
                AsyncStorage.removeItem('history');
                setRemoveAllModalVisible(false);
              }
            } />
          </View>
        </View>
      </Modal>
    <DropdownAlert alert={func => (alert = func)} />
  </View>
  );
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
    backgroundColor: '#404462',
    borderRadius: 10,
    alignItems: 'center',
  },
});