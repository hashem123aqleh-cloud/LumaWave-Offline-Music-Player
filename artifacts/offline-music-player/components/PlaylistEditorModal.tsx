import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { CoverKey } from '@/context/MusicContext';
import { useColors } from '@/hooks/useColors';

const coverOptions: CoverKey[] = ['midnight', 'neon', 'dusk'];

type PlaylistEditorModalProps = {
  visible: boolean;
  initialName?: string;
  initialDescription?: string;
  initialCoverKey?: CoverKey;
  title: string;
  saveLabel: string;
  onClose: () => void;
  onSave: (name: string, description: string, coverKey: CoverKey) => void;
};

export function PlaylistEditorModal({
  visible,
  initialName = '',
  initialDescription = '',
  initialCoverKey = 'neon',
  title,
  saveLabel,
  onClose,
  onSave,
}: PlaylistEditorModalProps) {
  const colors = useColors();
  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(initialDescription);
  const [coverKey, setCoverKey] = React.useState<CoverKey>(initialCoverKey);

  React.useEffect(() => {
    if (!visible) return;
    setName(initialName);
    setDescription(initialDescription);
    setCoverKey(initialCoverKey);
  }, [initialCoverKey, initialDescription, initialName, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(4,5,9,0.72)' }]}>
        <KeyboardAwareScrollViewCompat contentContainerStyle={styles.keyboardContent} bottomOffset={24}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.heading, { color: colors.foreground }]}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={12}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
            </View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>PLAYLIST NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Late night drives"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
              autoFocus
              maxLength={42}
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>DESCRIPTION <Text style={{ fontFamily: 'Inter_400Regular' }}>(OPTIONAL)</Text></Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What is this playlist for?"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, styles.descriptionInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
              multiline
              maxLength={100}
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>COVER MOOD</Text>
            <View style={styles.covers}>
              {coverOptions.map((option) => (
                <Pressable key={option} onPress={() => setCoverKey(option)} style={[styles.coverOption, { borderColor: coverKey === option ? colors.primary : colors.border, backgroundColor: colors[option === 'midnight' ? 'accent' : 'secondary'] }]}>
                  <Feather name={option === 'midnight' ? 'moon' : option === 'neon' ? 'zap' : 'sunset'} size={18} color={coverKey === option ? colors.primary : colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
            <Pressable disabled={!name.trim()} onPress={() => onSave(name.trim(), description.trim(), coverKey)} style={[styles.saveButton, { backgroundColor: name.trim() ? colors.primary : colors.secondary }]}>
              <Text style={[styles.saveText, { color: name.trim() ? colors.primaryForeground : colors.mutedForeground }]}>{saveLabel}</Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollViewCompat>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  keyboardContent: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: 22, paddingBottom: 34 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, marginBottom: 8, marginTop: 17 },
  input: { minHeight: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 15, fontFamily: 'Inter_500Medium', fontSize: 14 },
  descriptionInput: { minHeight: 78, paddingTop: 14, textAlignVertical: 'top' },
  covers: { flexDirection: 'row', gap: 12, marginTop: 2 },
  coverOption: { width: 52, height: 52, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  saveButton: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 26 },
  saveText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});