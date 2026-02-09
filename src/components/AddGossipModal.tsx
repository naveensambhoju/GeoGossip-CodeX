import { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GOSSIP_TYPES } from '../constants';
import { LocationPreference } from '../types';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AddGossipModal({ visible, onClose }: Props) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [gossipType, setGossipType] = useState(GOSSIP_TYPES[0]);
  const [locationPreference, setLocationPreference] = useState<LocationPreference>('current');
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setTypeMenuOpen(false);
    }
  }, [visible]);

  const handleClose = () => {
    setSubject('');
    setDescription('');
    setGossipType(GOSSIP_TYPES[0]);
    setLocationPreference('current');
    setTypeMenuOpen(false);
    onClose();
  };

  const handlePreview = () => {
    console.log('Preview gossip', { subject, description, gossipType, locationPreference });
  };

  const handlePost = () => {
    console.log('Post gossip', { subject, description, gossipType, locationPreference });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Gossip</Text>
          <TouchableOpacity accessibilityLabel="Close" onPress={handleClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Give it a title"
              placeholderTextColor="#475569"
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
            <Text style={styles.helperText}>{subject.length}/100</Text>
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Add more detail"
              placeholderTextColor="#475569"
              value={description}
              onChangeText={setDescription}
              maxLength={250}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>{description.length}/250</Text>
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Gossip Type</Text>
            <View>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setTypeMenuOpen((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText}>{gossipType}</Text>
                <Text style={styles.dropdownCaret}>{typeMenuOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {typeMenuOpen ? (
                <View style={styles.dropdownList}>
                  {GOSSIP_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setGossipType(type);
                        setTypeMenuOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Location</Text>
            <View style={styles.radioGroup}>
              {[
                { key: 'current', label: 'Use Current Location' },
                { key: 'map', label: 'Choose from Map' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.radioRow}
                  onPress={() => setLocationPreference(option.key as LocationPreference)}
                  activeOpacity={0.8}
                >
                  <View style={styles.radioOuter}>
                    {locationPreference === option.key ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePreview}>
              <Text style={styles.secondaryButtonText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handlePost}>
              <Text style={styles.primaryButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#94a3b8',
    fontSize: 22,
    lineHeight: 22,
    marginTop: -2,
  },
  modalContent: {
    paddingBottom: 48,
    gap: 16,
  },
  formField: {
    gap: 6,
  },
  formLabel: {
    color: '#94a3b8',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#0b1220',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15,
  },
  textarea: {
    height: 140,
  },
  helperText: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'right',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0b1220',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownCaret: {
    color: '#94a3b8',
    fontSize: 12,
  },
  dropdownList: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0b1220',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownOptionText: {
    color: '#f8fafc',
    fontSize: 15,
  },
  radioGroup: {
    gap: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
  },
  radioLabel: {
    color: '#f8fafc',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#020617',
    fontWeight: '700',
  },
});
