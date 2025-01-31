// @ts-ignore
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import  RadioButton from '../../components/RadioButton';

const AGORAPP_URL = 'http://192.168.1.170:8080';

interface Election{
    title: String,
    description: String
    options: String[]
}

const ElectionTitleScreen = () => {
    const [election, setElection] = useState<Election>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [option, setOption] = useState<String>("");
    const { uuid } = useLocalSearchParams();

    useEffect(() =>{
        if (!uuid || Array.isArray(uuid)) {
            console.log('UUID no proporcionado o es un arreglo');
            setLoading(false);
            router.push('/scanner');
            return;
        }
    }, [])

    useEffect(() => {
        if (!uuid || Array.isArray(uuid)) {
            console.log('UUID no proporcionado o es un arreglo');
            // setLoading(false);
            // router.push('/scanner');
            // return;
        }
        else{
        const fetchElectionTitle = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${AGORAPP_URL}/api/election?uuid=${encodeURIComponent(uuid)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Error al obtener la información');
                }

                const data = await response.json();
                console.log(`[Agorapp Query] election: ${JSON.stringify(data)}`);
                setElection(data);
            } catch (error) {
                console.log(`[Agorapp Query] /api/election?uuid=${encodeURIComponent(uuid)}\n${error}`);
            } finally {
                setLoading(false);
            }
        };

        fetchElectionTitle();}
    }, [uuid]);

    if (loading) {
        return <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    if(election){
        return (
            <View style={styles.container}>
            <SafeAreaView style={{backgroundColor: '#404462'}}/>
                <Text style={styles.title}>{election.title}</Text>
                <ProgressSteps activeStep={0}>
                <ProgressStep label="Información"   
                nextBtnText="Siguiente"
                nextBtnStyle={{ backgroundColor: '#404462', padding: 10, paddingLeft: 30, paddingRight: 30,  borderRadius: 8, flex: 1 }}
                nextBtnTextStyle={{ color: 'white' }}
                title="Descripción"
                >
                    <Text style={{ fontSize: 22, margin: 16, color: 'white', fontFamily: 'Times New Roman' }}>
                        {election.description}/</Text>

                </ProgressStep>
                <ProgressStep label="Votación"   
                nextBtnText="Siguiente"
                nextBtnStyle={{ backgroundColor: '#404462', padding: 10, paddingLeft: 30, paddingRight: 30,  borderRadius: 8, flex: 1 }}
                nextBtnTextStyle={{ color: 'white' }}
                previousBtnText="Anterior"
                previousBtnStyle={{ backgroundColor: '#404462', padding: 10, paddingLeft: 30, paddingRight: 30,  borderRadius: 8, flex: 1 }}
                previousBtnTextStyle={{ color: 'white' }}
                scrollable={false}
                title="Elige tu opción"
                >
                   <RadioButton options={election.options} checkedValue={option} onChange={setOption}></RadioButton>
                </ProgressStep>
                <ProgressStep label="Envío"
                nextBtnText="Siguiente"
                nextBtnStyle={{ backgroundColor: '#404462', padding: 10, paddingHorizontal: 30,  borderRadius: 8, flex: 1 }}
                nextBtnTextStyle={{ color: 'white' }}
                previousBtnText="Anterior"
                previousBtnStyle={{ backgroundColor: '#404462', padding: 10, paddingHorizontal: 30,  borderRadius: 8, flex: 1 }}
                previousBtnTextStyle={{ color: 'white' }}
                finishBtnText="Enviar"
                finishBtnStyle={{ backgroundColor: '#c8a130', padding: 10, paddingHorizontal: 30,  borderRadius: 8, flex: 1 }}
                scrollable={false}
                title="Enviar voto">
                    <Text style={{ fontSize: 18, margin: 16, color: 'white'}}>¿Estás seguro que quieres firmar y emitir el voto con la siguiente información?</Text>
                    <View style={{backgroundColor: "#8187a8", borderColor: '#404462', borderWidth: 1, marginHorizontal: 20, paddingTop: 10, paddingBottom: 24, gap: 20, marginVertical: 16, borderRadius: 6}}>
                        <Text style={{ fontSize: 20, fontFamily: 'bold', margin: 16, textAlign: 'center', color: 'white'}}>{election.title}</Text>
                        <Text style={{ fontSize: 22, fontFamily: 'bold', margin: 16, textAlign: 'center', color: 'white'}}>{option}</Text>
                    </View>
                </ProgressStep>
            </ProgressSteps>
            </View>
        );
    }else {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
            <SafeAreaView style={{backgroundColor: '#404462'}}/>
                <Text style={styles.title}>No se ha escaneado ninguna votación</Text>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
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
});

export default ElectionTitleScreen;
