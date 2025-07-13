// @ts-ignore
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal, Alert, TouchableOpacity, Vibration } from 'react-native';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import RadioButton from '../../components/RadioButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RDCORE_URL = 'http://100.72.111.104:4321';
const AGORAPP_URL = 'http://100.72.111.104:8080';

interface Election {
  title: string;
  description: string;
  options: string[];
}

const ElectionTitleScreen = () => {
  const [election, setElection] = useState<Election>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [option, setOption] = useState<String>("");
  const [logVisible, setLogVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [validSignature, setValidSignature] = useState<boolean | null>(null);
  const { uuid } = useLocalSearchParams();

  useEffect(() => {
    if (!uuid || Array.isArray(uuid)) {
      setLoading(false);
      router.push('/scanner');
    }
  }, []);

  useEffect(() => {
    if (!uuid || Array.isArray(uuid)) return;

    const fetchElectionTitle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${AGORAPP_URL}/api/election?uuid=${encodeURIComponent(uuid as string)}`);
        if (!response.ok) throw new Error('Error al obtener la información');
        const data = await response.json();
        setElection(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionTitle();
  }, [uuid]);

  const appendLog = (message: string) => setLogs((prev) => [...prev, message]);

  const playSound = async (success: boolean) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        success
          ? require('../../assets/success.mp3')
          : require('../../assets/error.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.warn("No se pudo reproducir el sonido:", error);
    }
  };

  const sendVote = async () => {
    setLogs([]);
    setProgress(0);
    setValidSignature(null);
    setLogVisible(true);
    appendLog('Solicitando Censo...');
    setProgress(0.1);

    try {
      const stored = await AsyncStorage.getItem('keys');
      const keys = stored ? JSON.parse(stored) : null;
      if (!keys) throw new Error('No existen claves');

      const pathRes = await fetch(`${AGORAPP_URL}/api/election/generate-path?uuid=${encodeURIComponent(uuid as string)}&vkc=${encodeURIComponent(keys.public_hash)}`);
      if (!pathRes.ok) throw new Error('Error al obtener el censo');

      const { rootHash, siblings } = await pathRes.json();
      appendLog('Censo obtenido.');
      setProgress(0.3);

      appendLog('Generando firma...');
      setProgress(0.5);

      const proofRes = await fetch(`${RDCORE_URL}/generate-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          root: rootHash,
          private_key: keys.private_key,
          siblings,
        }),
      });

      const proofData = await proofRes.json();

      appendLog('Verificando firma...');
      setProgress(0.7);

      const verifyRes = await fetch(`${RDCORE_URL}/verify-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof: proofData.proof,
          public_signals: proofData.public_signals,
          depth: proofData.depth,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.valid) {
        appendLog('Firma válida');
        appendLog('Voto emitido.');
        setProgress(1);
        setValidSignature(true);
        Vibration.vibrate(200);
        playSound(true);
      } else {
        appendLog('Firma no válida');
        setValidSignature(false);
        Vibration.vibrate([100, 200, 100, 200]);
        playSound(false);
        setLogVisible(false);
        Alert.alert('Error', 'La firma generada no es válida.');
        router.replace('/scanner');
      }
    } catch (e: any) {
      appendLog(`Error: ${e.message}`);
      setValidSignature(false);
      Vibration.vibrate([100, 200, 100, 200]);
      playSound(false);
      setLogVisible(false);
      Alert.alert('Error al emitir el voto', e.message);
      router.replace('/scanner');
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (election) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ backgroundColor: '#404462' }} />
        <Text style={styles.title}>{election.title}</Text>
        <ProgressSteps activeStep={0}>
          <ProgressStep label="Información" nextBtnText="Siguiente" nextBtnStyle={styles.next} nextBtnTextStyle={{ color: 'white' }} title="Descripción">
            <Text style={{ fontSize: 22, margin: 16, color: 'white', fontFamily: 'Times New Roman' }}>{election.description}</Text>
          </ProgressStep>
          <ProgressStep label="Votación" nextBtnText="Siguiente" nextBtnStyle={styles.next} nextBtnTextStyle={{ color: 'white' }} previousBtnText="Anterior" previousBtnStyle={styles.prev} previousBtnTextStyle={{ color: 'white' }} scrollable={false} title="Elige tu opción">
            <RadioButton options={election.options} checkedValue={option} onChange={setOption} />
          </ProgressStep>
          <ProgressStep label="Envío" nextBtnText="Siguiente" nextBtnStyle={styles.next} nextBtnTextStyle={{ color: 'white' }} previousBtnText="Anterior" previousBtnStyle={styles.prev} previousBtnTextStyle={{ color: 'white' }} finishBtnText="Enviar" finishBtnStyle={styles.finish} scrollable={false} title="Enviar voto" onSubmit={sendVote}>
            <Text style={{ fontSize: 18, margin: 16, color: 'white' }}>
              ¿Estás seguro que quieres firmar y emitir el voto con la siguiente información?
            </Text>
            <View style={{ backgroundColor: '#8187a8', borderColor: '#404462', borderWidth: 1, marginHorizontal: 20, paddingTop: 10, paddingBottom: 24, gap: 20, marginVertical: 16, borderRadius: 6 }}>
              <Text style={{ fontSize: 20, fontFamily: 'bold', margin: 16, textAlign: 'center', color: 'white' }}>{election.title}</Text>
              <Text style={{ fontSize: 22, fontFamily: 'bold', margin: 16, textAlign: 'center', color: 'white' }}>{option}</Text>
            </View>
          </ProgressStep>
        </ProgressSteps>

        <Modal visible={logVisible} transparent animationType="slide" onRequestClose={() => setLogVisible(false)}>
          <View style={styles.logModalContainer}>
            <View style={styles.logModalContent}>
              <Text style={styles.logTitle}>FIRMAR VOTO</Text>
              <View style={styles.separator} />

              {logs.length > 0 && (
                <Text style={styles.logTextSingle}>{logs[logs.length - 1]}</Text>
              )}

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.round(progress * 100)}%`,
                      backgroundColor: progress === 1 ? '#4CAF50' : '#c8a130',
                    },
                  ]}
                />
              </View>

              {validSignature && (
                <TouchableOpacity
                  style={styles.finalizeButton}
                  onPress={() => {
                    setLogVisible(false);
                    router.replace('/scanner');
                  }}
                >
                  <Text style={styles.finalizeButtonText}>Finalizar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <SafeAreaView style={{ backgroundColor: '#404462' }} />
      <Text style={styles.title}>No se ha escaneado ninguna votación</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#696b86',
  },
  title: {
    fontSize: 34,
    marginLeft: 18,
    marginRight: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  next: {
    backgroundColor: '#404462',
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
  },
  prev: {
    backgroundColor: '#404462',
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
  },
  finish: {
    backgroundColor: '#c8a130',
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
  },
  logModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logModalContent: {
    width: '90%',
    backgroundColor: '#404462',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  logTitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#777',
    marginBottom: 16,
  },
  logTextSingle: {
    color: 'lightgray',
    marginBottom: 12,
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#555',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
  },
  finalizeButton: {
    backgroundColor: '#c8a130',
    borderRadius: 6,
    padding: 12,
    width: '100%',
  },
  finalizeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ElectionTitleScreen;
