import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { saveToken, saveUser } from "@/utils/storage"; 

interface Mascota {
  nombre: string;
  edad: number;
}

const IntermediateView: React.FC = () => {
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const router = useRouter();

  useEffect(() => {
    const mascotaInfo: Mascota = { nombre: "Fido", edad: 3 };
    setMascota(mascotaInfo);
  }, []);

  const handleAdopt = async () => {
    if (mascota) {
      await saveToken("someNewToken"); 
      await saveUser({ id: "1", name: "User", email: "user@mail.com", role: "adoptante" });

      console.log("Mascota adoptada:", mascota);

      router.push("/home");
    }
  };

  return (
    <View>
      {mascota ? (
        <>
          <Text>Detalles de la mascota:</Text>
          <Text>Nombre: {mascota.nombre}</Text>
          <Text>Edad: {mascota.edad} años</Text>

          <Button title="Adoptar" onPress={handleAdopt} />
        </>
      ) : (
        <Text>Cargando mascota...</Text>
      )}
    </View>
  );
};

export default IntermediateView;