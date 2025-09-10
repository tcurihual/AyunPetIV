import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import BaseModal from "../BaseModal";
import { useModal } from "../../../src/context/ModalContext";

type Props = { publicationId: string; onSubmit?: (payload: { publicationId: string; reason: string; details: string }) => Promise<void> | void };

const ReportModal: React.FC<Props> = ({ publicationId, onSubmit }) => {
  const { closeModal } = useModal();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleSend = async () => {
    await onSubmit?.({ publicationId, reason, details });
    closeModal();
  };

  return (
    <BaseModal title="Reportar publicación">
      <View style={{ gap: 8 }}>
        <Text>Motivo</Text>
        <TextInput placeholder="Ej: Contenido inapropiado" value={reason} onChangeText={setReason}
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 10 }} />
        <Text>Detalles</Text>
        <TextInput placeholder="Describe brevemente el problema" value={details} onChangeText={setDetails} multiline
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 10, minHeight: 80 }} />
        <TouchableOpacity onPress={handleSend} style={{ marginTop: 6, backgroundColor: "#dc2626", padding: 12, borderRadius: 10 }}>
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>Enviar reporte</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

export default ReportModal;
