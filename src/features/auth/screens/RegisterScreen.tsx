import React, { useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Typography } from '../../../design/components/Typography';
import { TextField } from '../../../design/components/TextField';
import { PasswordField } from '../../../design/components/PasswordField';
import { SelectionField } from '../../../design/components/SelectionField';
import { Button } from '../../../design/components/Button';
import { Toast, useToastStore } from '../../../design/components/Toast';
import { theme } from '../../../core/theme/theme';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { palette } from '../../../core/theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { CaveSceneProvider } from '../../../experience/scene/CaveSceneProvider';

import { AuthNavigationProp } from '../../../navigation/types';

// See LoginScreen for why this reads from the raw palette rather than the
// reactive theme — text drawn directly on the cave (not inside a glass
// card) must stay legible against a background that stays dark regardless
// of the app's own light/dark setting.
const HEADER_TITLE_COLOR = palette.warmIvory;
const HEADER_SUBTITLE_COLOR = 'rgba(253, 251, 247, 0.62)';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  gender: z.enum(['male', 'female', 'other'] as [string, ...string[]]).describe('Gender is required'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

interface Props {
  navigation: AuthNavigationProp;
}

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const cityOptions = [
  { label: 'New York', value: 'new_york' },
  { label: 'London', value: 'london' },
  { label: 'Tokyo', value: 'tokyo' },
  { label: 'Paris', value: 'paris' },
];

import Animated from 'react-native-reanimated';
import { GlassCard } from '../../../design/components/GlassCard';

export const RegisterScreen = ({ navigation }: Props) => {
  const { theme: activeTheme } = useAppTheme();
  const login = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);

  const emailRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { name: '', email: '', gender: undefined, mobile: '', address: '', city: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await authService.register(
        data.name, data.email, data.password, data.gender, data.mobile, data.address, data.city
      );
      await login(response.user, response.token);
    } catch (error: unknown) {
      const err = error as Error;
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  return (
    <CaveSceneProvider>
      {({ logoStyle, uiStyle }) => (
      <>
      <Toast />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={logoStyle}>
            <View style={styles.header}>
              <Typography variant="headingXL" weight="bold" color={HEADER_TITLE_COLOR}>Membership Application</Typography>
              <Typography variant="body" color={HEADER_SUBTITLE_COLOR} style={{ marginTop: theme.spacing.sm }}>
                Apply for patron membership to access curated exhibitions.
              </Typography>
            </View>
          </Animated.View>

          <Animated.View style={uiStyle}>
            <GlassCard intensity={activeTheme.glassLevels.elevated} style={styles.glassCard}>
              <View style={styles.form}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Full Name"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.name?.message}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                      blurOnSubmit={false}
                      textContentType="name"
                      autoComplete="name"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      ref={emailRef}
                      label="Email Address"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.email?.message}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      onSubmitEditing={() => mobileRef.current?.focus()}
                      blurOnSubmit={false}
                      textContentType="emailAddress"
                      autoComplete="email"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <SelectionField
                      variant="radio"
                      label="Gender"
                      options={genderOptions}
                      value={value}
                      onChange={onChange}
                      error={errors.gender?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="mobile"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      ref={mobileRef}
                      label="Mobile Number"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.mobile?.message}
                      keyboardType="number-pad"
                      returnKeyType="next"
                      onSubmitEditing={() => addressRef.current?.focus()}
                      blurOnSubmit={false}
                      textContentType="telephoneNumber"
                      autoComplete="tel"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="address"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      ref={addressRef}
                      label="Address"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.address?.message}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      blurOnSubmit={false}
                      textContentType="fullStreetAddress"
                      autoComplete="street-address"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <SelectionField
                      variant="dropdown"
                      label="City"
                      options={cityOptions}
                      value={value}
                      onChange={onChange}
                      error={errors.city?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordField
                      ref={passwordRef}
                      label="Password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.password?.message}
                      showStrength
                      returnKeyType="next"
                      onSubmitEditing={() => confirmRef.current?.focus()}
                      blurOnSubmit={false}
                      textContentType="newPassword"
                      autoComplete="password-new"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordField
                      ref={confirmRef}
                      label="Confirm Password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.confirmPassword?.message}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      textContentType="newPassword"
                      autoComplete="password-new"
                    />
                  )}
                />

                <Button 
                  label={isSubmitting ? "Submitting Application..." : "Submit Application"} 
                  onPress={handleSubmit(onSubmit)} 
                  disabled={isSubmitting}
                  style={{ marginTop: theme.spacing.xl }}
                />

                <Button 
                  label="Already a patron? Sign In" 
                  variant="secondary"
                  onPress={() => navigation.navigate('Login')} 
                  style={{ marginTop: theme.spacing.md }}
                />
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      </>
      )}
    </CaveSceneProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl * 2,
    paddingBottom: theme.spacing.xxxl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  glassCard: {
    marginVertical: theme.spacing.sm,
  },
  form: {
    width: '100%',
  }
});
