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
import { theme } from '../../../core/theme/theme';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { SceneProvider } from '../../../experience/scene/SceneProvider';
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

import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '../../../design/components/GlassCard';

export const LoginScreen = ({ navigation }: Props) => {
  const login = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <ErrorBoundary name="LoginScreen">
      <SceneProvider showArch={true}>
        <Toast />
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View entering={FadeInDown.duration(600).springify()}>
              <View style={styles.header}>
                <Typography variant="headingXL" weight="bold">Welcome back.</Typography>
                <Typography variant="body" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.sm }}>
                  Enter your credentials to enter the exhibition.
                </Typography>
              </View>

              <GlassCard style={styles.glassCard}>
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
                    label={isLoading ? "Authenticating..." : "Sign In"} 
                    onPress={handleSubmit(onSubmit)} 
                    disabled={isLoading}
                    style={{ marginTop: theme.spacing.xl }}
                  />

                  <Button 
                    label="Don't have an account? Sign Up" 
                    variant="secondary"
                    onPress={() => navigation.navigate('Register')} 
                    style={{ marginTop: theme.spacing.md }}
                  />
                </View>
              </GlassCard>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SceneProvider>
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
