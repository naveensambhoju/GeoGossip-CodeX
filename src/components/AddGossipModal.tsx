import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GOSSIP_TYPES } from '../constants';
import { LocationPreference } from '../types';
import { ThemePalette, useTheme } from '../theme';

export type SubmitGossipForm = {
  subject: string;
  description: string;
  gossipType: string;
  locationPreference: LocationPreference;
  location?: { latitude: number; longitude: number } | null;
  expiresInHours: number;
};

type Props = {
  visible: boolean;
  initialLocation?: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onSubmit: (payload: SubmitGossipForm) => Promise<void>;
};

const DEFAULT_TYPE = GOSSIP_TYPES[0] ?? 'General';
const EXPIRY_OPTIONS = [
  { label: '24 hrs', value: 24 },
  { label: '12 hrs', value: 12 },
  { label: '6 hrs', value: 6 },
  { label: '1 hr', value: 1 },
] as const;
const DEFAULT_EXPIRY = 1;

export function AddGossipModal({ visible, onClose, onSubmit, initialLocation }: Props) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [gossipType, setGossipType] = useState<string>(DEFAULT_TYPE);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [subjectTouched, setSubjectTouched] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState<number>(DEFAULT_EXPIRY);
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const placeholderColor = palette.textSecondary;

  useEffect(() => {
    if (!visible) {
      setTypeMenuOpen(false);
      setSubjectTouched(false);
      setDescriptionTouched(false);
      setSubmitError(null);
    }
  }, [visible]);

  const handleClose = () => {
    setSubject('');
    setDescription('');
    setGossipType(DEFAULT_TYPE);
    setTypeMenuOpen(false);
    setExpiresInHours(DEFAULT_EXPIRY);
    onClose();
  };

  const handlePreview = () => {
    console.log('Preview gossip', { subject, description, gossipType });
  };

  const handlePost = async () => {
    setSubjectTouched(true);
    setDescriptionTouched(true);
    if (!subject.trim() || !description.trim()) {
      setSubmitError('Subject and description are required.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        subject,
        description,
        gossipType,
        locationPreference: 'map' as LocationPreference,
        location: initialLocation ?? null,
        expiresInHours,
      });
      handleClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit gossip');
    } finally {
      setSubmitting(false);
    }
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
              style={[styles.input, (!subject.trim() && subjectTouched) && styles.inputError]}
              placeholder="Give it a title"
              placeholderTextColor={placeholderColor}
              value={subject}
              onChangeText={(text) => {
                setSubject(text);
                if (!subjectTouched) setSubjectTouched(true);
              }}
              maxLength={100}
            />
            <Text style={styles.helperText}>{subject.length}/100</Text>
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea, (!description.trim() && descriptionTouched) && styles.inputError]}
              placeholder="Add more detail"
              placeholderTextColor={placeholderColor}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (!descriptionTouched) setDescriptionTouched(true);
              }}
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
            <Text style={styles.formLabel}>Expires In</Text>
            <View style={styles.expiryRow}>
              {EXPIRY_OPTIONS.map((option) => {
                const isActive = option.value === expiresInHours;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.expiryChip, isActive && styles.expiryChipActive]}
                    onPress={() => setExpiresInHours(option.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.expiryChipLabel, isActive && styles.expiryChipLabelActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePreview} disabled={submitting}>
              <Text style={styles.secondaryButtonText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, submitting && styles.buttonDisabled]} onPress={handlePost} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={palette.accentContrast} />
              ) : (
                <Text style={styles.primaryButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    modalSafeArea: {
      flex: 1,
      backgroundColor: palette.background,
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
      color: palette.textPrimary,
      fontSize: 20,
      fontWeight: '600',
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCloseText: {
      color: palette.textSecondary,
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
      color: palette.textSecondary,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    input: {
      backgroundColor: palette.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: palette.textPrimary,
      fontSize: 15,
    },
    textarea: {
      height: 140,
    },
    helperText: {
      color: palette.textSecondary,
      fontSize: 12,
      textAlign: 'right',
    },
    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    dropdownText: {
      color: palette.textPrimary,
      fontSize: 15,
      fontWeight: '500',
    },
    dropdownCaret: {
      color: palette.textSecondary,
      fontSize: 12,
    },
    dropdownList: {
      marginTop: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      overflow: 'hidden',
    },
    dropdownOption: {
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    dropdownOptionText: {
      color: palette.textPrimary,
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
      borderColor: palette.border,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: palette.textPrimary,
      fontWeight: '600',
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: palette.accent,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: palette.accentContrast,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    submitError: {
      color: palette.danger,
      textAlign: 'center',
      marginBottom: 8,
    },
    expiryRow: {
      flexDirection: 'row',
      gap: 8,
    },
    expiryChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      alignItems: 'center',
      backgroundColor: palette.surface,
    },
    expiryChipActive: {
      borderColor: palette.accent,
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
    },
    expiryChipLabel: {
      color: palette.textSecondary,
      fontWeight: '500',
    },
    expiryChipLabelActive: {
      color: palette.textPrimary,
    },
    inputError: {
      borderColor: palette.danger,
    },
  });
