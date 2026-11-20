import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { EyeIcon, EyeOffIcon } from '@/components/icons/praktikum-theme-icons';

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
          placeholderTextColor="#8C9786"
          secureTextEntry={isPassword ? !showPassword : inputProps.secureTextEntry}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? (
              <EyeOffIcon size={18} color="#5A6B5A" />
            ) : (
              <EyeIcon size={18} color="#5A6B5A" />
            )}
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
    color: '#2E3E2E',
  },
  requiredStar: {
    color: '#9E3B2B',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E4DD',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputWrapperError: {
    borderColor: '#B84A39',
    backgroundColor: '#FDF4F2',
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: '#1C281C',
  },
  eyeButton: {
    padding: 6,
    marginRight: -4,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#9E3B2B',
  },
});
