import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BaseModal from "../BaseModal";
import { useModal } from "../../../src/context/ModalContext";

type Props = { title?: string; message: string; onConfirm?: () => void };

const ConfirmModal: React.FC<Props> = ({ title = "Confirmar", message, onConfirm }) => {
  const { closeModal } = useModal();

  return (
    <BaseModal title={title} footer={
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity onPress={closeModal} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#e5e7eb" }}>
          <Text style={{ fontWeight: "600" }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { onConfirm?.(); closeModal(); }} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#16a34a" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    }>
      <Text>{message}</Text>
    </BaseModal>
  );
};

export default ConfirmModal;
