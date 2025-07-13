// @ts-ignore
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal, ScrollView } from 'react-native';
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
  const { uuid } = useLocalSearchParams();

  useEffect(() => {
    if (!uuid || Array.isArray(uuid)) {
      setLoading(false);
      router.push('/scanner');
    }
  }, []);

  useEffect(() => {
    if (!uuid || Array.isArray(uuid)) {
      return;
    }

    const fetchElectionTitle = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${AGORAPP_URL}/api/election?uuid=${encodeURIComponent(uuid as string)}`,
        );
        if (!response.ok) {
          throw new Error('Error al obtener la información');
        }
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

  const sendVote = async () => {
    setLogs([]);
    setProgress(0);
    setLogVisible(true);
    appendLog('Solicitando Censo...');
    console.log('[Firma] solicitando árbol de merkle del censo');
    setProgress(0.1);
    try {
      const merkleRes = await fetch(`${AGORAPP_URL}/api/merkle`);
      const { root } = await merkleRes.json();
      appendLog('Censo obtenido');
      console.log('[Firma] árbol obtenido');
      setProgress(0.3);

      const stored = await AsyncStorage.getItem('keys');
      const keys = stored ? JSON.parse(stored) : null;
      appendLog('Generando firma...');
      console.log('[Firma] generando prueba');
      setProgress(0.5);
      const proofRes = await fetch(
        `${RDCORE_URL}/generate-proof/${root}/${keys?.private_key}/${keys?.public_hash}`,
      );
      const proofData = await proofRes.json();
      console.log('[Firma] prueba generada', proofData);
      appendLog('Verificando firma...');
      console.log('[Firma] verificando prueba');
      setProgress(0.7);
      const verifyRes = await fetch(`${RDCORE_URL}/verify-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof: proofData.proof, public_signals: proofData.public_signals }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.valid) {
        appendLog('Firma válida');
        appendLog('Voto emitido')
        console.log('[Firma] prueba válida. voto firmado');
        setProgress(1);
      } else {
        appendLog('Firma no válida');
        console.log('[Firma] prueba inválida');
      }
    } catch (e: any) {
      appendLog(`Error: ${e.message}`);
      console.log('[Firma] error', e);
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
          <ProgressStep
            label="Información"
            nextBtnText="Siguiente"
            nextBtnStyle={styles.next}
            nextBtnTextStyle={{ color: 'white' }}
            title="Descripción"
          >
            <Text style={{ fontSize: 22, margin: 16, color: 'white' }}>{
              election.description
            }</Text>
          </ProgressStep>
          <ProgressStep
            label="Votación"
            nextBtnText="Siguiente"
            nextBtnStyle={styles.next}
            nextBtnTextStyle={{ color: 'white' }}
            previousBtnText="Anterior"
            previousBtnStyle={styles.prev}
            previousBtnTextStyle={{ color: 'white' }}
            scrollable={false}
            title="Elige tu opción"
          >
            <RadioButton options={election.options} checkedValue={option} onChange={setOption} />
          </ProgressStep>
          <ProgressStep
            label="Envío"
            nextBtnText="Siguiente"
            nextBtnStyle={styles.next}
            nextBtnTextStyle={{ color: 'white' }}
            previousBtnText="Anterior"
            previousBtnStyle={styles.prev}
            previousBtnTextStyle={{ color: 'white' }}
            finishBtnText="Enviar"
            finishBtnStyle={styles.finish}
            scrollable={false}
            title="Enviar voto"
            onSubmit={sendVote}
          >
            <Text style={{ fontSize: 18, margin: 16, color: 'white' }}>
              ¿Estás seguro que quieres firmar y emitir el voto con la siguiente información?
            </Text>
            <View
              style={{
                backgroundColor: '#8187a8',
                borderColor: '#404462',
                borderWidth: 1,
                marginHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 24,
                gap: 20,
                marginVertical: 16,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 20, fontFamily: 'bold', margin: 16, textAlign: 'center', color: 'white' }}>{election.title}</Text>
              <Text style={{ fontSize: 22, fontFamily: 'bold', margin: 16, textAlign: 'center', color: 'white' }}>{option}</Text>
            </View>
          </ProgressStep>
        </ProgressSteps>
        <Modal
          visible={logVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setLogVisible(false)}
        >
          <View style={styles.logModalContainer}>
            <View style={styles.logModalContent}>
              <Text style={styles.logTitle}>Proceso de Firma</Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]}
                />
              </View>
              <ScrollView style={styles.logScroll}>
                {logs.map((l, i) => (
                  <Text key={i} style={styles.logText}>
                    {l}
                  </Text>
                ))}
              </ScrollView>
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
    padding: 16,
    maxHeight: '80%',
  },
  logTitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#555',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    backgroundColor: '#c8a130',
    height: '100%',
  },
  logScroll: {
    maxHeight: '70%',
  },
  logText: {
    color: 'white',
    marginBottom: 4,
  },
});

export default ElectionTitleScreen;