import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Pet } from '../interfaces/pet'; // Asegúrate de que la ruta sea correcta

// Define la interfaz para las props del componente
interface PublicationCardProps {
  pet: Pet;
}

const PublicationCard: React.FC<PublicationCardProps> = ({ pet }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: pet.image }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.details}>{`${pet.gender} ${pet.age}`}</Text>
        <Text style={styles.publisher}>Publicado por: {pet.publisher}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log('Ver información de la mascota:', pet.name)}
      >
        <Text style={styles.buttonText}>Ver Información</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  details: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  publisher: {
    fontSize: 14,
    color: '#999',
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PublicationCard;