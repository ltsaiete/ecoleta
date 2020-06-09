import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Feather as Icon } from '@expo/vector-icons';
import { View, Image, StyleSheet, Text, ImageBackground, TextInput, KeyboardAvoidingView, Picker } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import mozApi from '../../services/mozApi';


interface MozAPIProvinceResponse {
  id: number;
  name: string;
}

interface MozAPICityResponse {
  name: string;
}

const Home = () => {

  const [provinces, setProvinces] = useState<MozAPIProvinceResponse[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [provinceName, setProvinceName] = useState<string>('')

  const [selectedProvince, setSelectedProvince] = useState('0');
  const [selectedCity, setSelectedCity] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    mozApi.get<MozAPIProvinceResponse[]>('/provinces')
      .then(response => {
        const provinceData = response.data
          .map(province => {
            return {
              id: province.id,
              name: province.name
            }
          });

        setProvinces(provinceData);
      });
  }, []);

  useEffect(() => {
    if (selectedProvince === '0') {
        return;
    }
        mozApi.get<MozAPICityResponse[]>(`/${selectedProvince}/districts`)
        .then(response => {
            const cityNames = response.data.map(province => province.name);
            setCities(cityNames);
        });

}, [selectedProvince]);

useEffect(() => {
  mozApi.get<MozAPIProvinceResponse>(`/provinces/${selectedProvince}`)
      .then(response => {
          setProvinceName(response.data.name);
      });
}, [selectedProvince])

  function handleNavigateToPoints() {
    navigation.navigate('Points', {
      provinceName,
      selectedCity
    });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} >
      <ImageBackground
        source={require('../../assets/home-background.png')}
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main} >

          <Image source={require('../../assets/logo.png')} />

          <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
          <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>


        </View>

        <View style={styles.footer} >
          <View style={styles.input}>

            <RNPickerSelect
              placeholder={{ label: 'Selecione a província' }}
              onValueChange={(value) => setSelectedProvince(value)}
              items={
                provinces.map(province => {
                  return {
                    label: province.name,
                    value: province.id
                  }
                })
              }
            />
          </View>

          <View style={styles.input}>

            <RNPickerSelect
              placeholder={{ label: 'Selecione a Cidade' }}
              onValueChange={(value) => setSelectedCity(value)}
              items={
                cities.map(city => {
                  return {
                    label: city,
                    value: city
                  }
                })

              }
            />
          </View>


          <RectButton style={styles.button} onPress={handleNavigateToPoints} >
            <View style={styles.buttonIcon} >
              <Text>
                <Icon name="arrow-right" color="#fff" size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
                </Text>
          </RectButton>
        </View>


      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

export default Home;
