import React, { useState, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Typography } from '../../../design/components/Typography';
import { TextField } from '../../../design/components/TextField';
import { PasswordField } from '../../../design/components/PasswordField';
import { Button } from '../../../design/components/Button';
import { Toast, useToastStore } from '../../../design/components/Toast';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { theme } from '../../../core/theme/theme';
import { palette } from '../../../core/theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { CaveSceneProvider } from '../../../experience/scene/CaveSceneProvider';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { ErrorBoundary } from '../../../core/error/ErrorBoundary';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

import Animated from 'react-native-reanimated';
import { GlassCard } from '../../../design/components/GlassCard';

// The cave environment is a fixed dark cinematic scene, independent of the
// app's own light/dark theme setting — so its wordmark/tagline draw from
// the raw palette rather than the reactive theme tokens (which are for
// content sitting on theme-adaptive surfaces like the glass card below).
const WORDMARK_COLOR = palette.warmIvory;
const TAGLINE_COLOR = 'rgba(253, 251, 247, 0.62)';

export const LoginScreen = ({ navigation }: Props) => {
  const { theme } = useAppTheme();
  const login = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const { user, token } = await authService.login(data.email, data.password);
      await login(user, token);
    } catch (error: any) {
      showToast(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    try {
      setIsGuestLoading(true);
      const { user, token } = await authService.loginAsGuest();
      await login(user, token);
    } catch {
      showToast('Unable to continue as guest. Please try again.', 'error');
    } finally {
      setIsGuestLoading(false);
    }
  };

  const busy = isLoading || isGuestLoading;

  return (
    <ErrorBoundary name="LoginScreen">
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
                <Animated.View style={[styles.logoBlock, logoStyle]}>
                  <Typography
                    variant="display"
                    weight="bold"
                    align="center"
                    color={WORDMARK_COLOR}
                    style={styles.wordmark}
                  >
                    ATELIER
                  </Typography>
                  <Typography
                    variant="body"
                    align="center"
                    color={TAGLINE_COLOR}
                    style={styles.tagline}
                  >
                    Enter the collection
                  </Typography>
                </Animated.View>

                <Animated.View style={uiStyle}>
                  <GlassCard intensity={theme.glassLevels.elevated} style={styles.glassCard}>
                    <View style={styles.form}>
                      <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextField
                            label="Email Address"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            error={errors.email?.message}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            blurOnSubmit={false}
                            textContentType="username"
                            autoComplete="email"
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
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit(onSubmit)}
                            textContentType="password"
                            autoComplete="password"
                          />
                        )}
                      />

                      <Button
                        label={isLoading ? 'Entering ATELIER…' : 'Enter ATELIER'}
                        onPress={handleSubmit(onSubmit)}
                        disabled={busy}
                        style={{ marginTop: theme.spacing.xl }}
                      />

                      <Button
                        label={isGuestLoading ? 'Entering as guest…' : 'Continue as guest'}
                        variant="glass"
                        onPress={handleGuestEntry}
                        disabled={busy}
                        style={{ marginTop: theme.spacing.md }}
                      />

                      <Button
                        label="Don't have an account? Sign Up"
                        variant="secondary"
                        onPress={() => navigation.navigate('Register')}
                        disabled={busy}
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
    </ErrorBoundary>
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
    justifyContent: 'center',
  },
  logoBlock: {
    marginBottom: theme.spacing.xxl,
  },
  wordmark: {
    letterSpacing: 6,
  },
  tagline: {
    marginTop: theme.spacing.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: theme.typography.size.label,
  },
  glassCard: {
    marginVertical: theme.spacing.sm,
  },
  form: {
    width: '100%',
  }
});
