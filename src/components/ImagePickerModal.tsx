import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, useColorScheme } from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

export default function ImagePickerModal({ visible, onClose, onCameraPress, onGalleryPress }: ImagePickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, { backgroundColor: colors.card }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Profile Photo</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X color={colors.subtext} size={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={[styles.optionBtn, { borderBottomColor: colors.border }]} 
                  onPress={() => { onClose(); setTimeout(onCameraPress, 100); }}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                    <Camera color={colors.primary} size={24} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>Take Photo</Text>
                    <Text style={[styles.optionSubtitle, { color: colors.subtext }]}>Use camera to take a new picture</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionBtn} 
                  onPress={() => { onClose(); setTimeout(onGalleryPress, 100); }}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.secondary + '20' }]}>
                    <ImageIcon color={colors.secondary} size={24} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>Choose from Gallery</Text>
                    <Text style={[styles.optionSubtitle, { color: colors.subtext }]}>Select an existing photo from camera roll</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
  },
});
