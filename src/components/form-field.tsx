import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Botanical } from '@/constants/theme';

export interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  required?: boolean;
  isPassword?: boolean;
}

export function FormField({
  label,
  error,
  required,
  isPassword,
  style,
  ...inputProps
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </Text>
      </View>

      <View style={[styles.inputWrapper, !!error && styles.inputWrapperError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Botanical.textPlaceholder}
          secureTextEntry={isPassword ? !showPassword : inputProps.secureTextEntry}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            style={({ pressed }) => [
              styles.eyeButton,
              pressed && styles.eyeButtonPressed,
            ]}
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            <Text style={styles.eyeText}>
              {showPassword ? 'Tutup' : 'Lihat'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Botanical.textLabel,
  },
  requiredStar: {
    color: Botanical.dangerText,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Botanical.surface,
    borderWidth: 1,
    borderColor: Botanical.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputWrapperError: {
    borderColor: Botanical.danger,
    backgroundColor: Botanical.dangerSurface,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: Botanical.textPrimary,
  },
  eyeButton: {
    backgroundColor: Botanical.sagePill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginLeft: 8,
  },
  eyeButtonPressed: {
    opacity: 0.78,
  },
  eyeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Botanical.primaryDark,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: Botanical.dangerText,
  },
});
