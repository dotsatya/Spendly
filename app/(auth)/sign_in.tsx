import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSignIn } from '@clerk/expo';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInFormValues, signInSchema } from '@/lib/schemas/auth';
import { useThemeColors } from '@/lib/theme';

export default function SignIn() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const colors = useThemeColors();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSignInSubmit = async (data: SignInFormValues) => {
    setAuthError('');

    try {
      const { error } = await signIn.password({
        emailAddress: data.email.trim(),
        password: data.password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize();
        router.replace('/(root)/(tabs)');
        return;
      }

      if (signIn.status === 'needs_second_factor') {
        setAuthError('Additional security verification is required.');
        return;
      }

      if (signIn.status === 'needs_client_trust') {
        setAuthError('Please complete device verification to continue.');
        return;
      }

      setAuthError('Unable to complete sign in. Please try again.');
    } catch (error: unknown) {
      console.error('Sign in error:', error);

      setAuthError(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset instructions will be sent to your registered email address.'
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* BRAND HEADER */}
          <View className="mb-10">
            <Text className="text-[30px] font-extrabold tracking-tight text-foreground">
              Spend<Text className="text-chart-2">ly</Text>
            </Text>
            <Text className="mt-1 text-xs font-medium text-muted-foreground">
              Track your spending. Own your savings.
            </Text>

            <View className="mt-2.5 h-1 w-10 rounded-full bg-chart-2" />
          </View>

          {/* LOGIN HEADER */}
          <View className="flex-1 py-8">
            <View className="mb-8">
              <Text className="text-[30px] font-extrabold tracking-tight text-foreground">
                Welcome Back
              </Text>

              <Text className="mt-2 text-[15px] leading-6 text-muted-foreground">
                Log in to manage your budget and stay on top of your finances.
              </Text>
            </View>

            {/* LOGIN FORM */}
            <View className="gap-6">
              {/* EMAIL */}
              <View>
                <Text className="mb-2.5 text-sm font-semibold text-foreground">Email Address</Text>

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      className={`h-[56px] flex-row items-center rounded-2xl border bg-muted/40 px-4 ${
                        formErrors.email ? 'border-destructive' : 'border-input'
                      }`}>
                      <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} />

                      <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor={colors.mutedForeground}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="ml-3 flex-1 text-base text-foreground"
                      />
                    </View>
                  )}
                />

                {formErrors.email && (
                  <Text className="mt-1.5 text-xs text-destructive">
                    {formErrors.email.message}
                  </Text>
                )}
              </View>

              {/* PASSWORD */}
              <View>
                <View className="mb-2.5 flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">Password</Text>
                </View>

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      className={`h-[56px] flex-row items-center rounded-2xl border bg-muted/40 px-4 ${
                        formErrors.password ? 'border-destructive' : 'border-input'
                      }`}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={colors.mutedForeground}
                      />

                      <TextInput
                        placeholder="Enter your password"
                        placeholderTextColor={colors.mutedForeground}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        className="ml-3 flex-1 text-base text-foreground"
                      />

                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={21}
                          color={colors.mutedForeground}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                />

                {formErrors.password && (
                  <Text className="mt-1.5 text-xs text-destructive">
                    {formErrors.password.message}
                  </Text>
                )}
              </View>

              {/* LOGIN BUTTON */}
              <TouchableOpacity
                onPress={() => {
                  void handleSubmit(onSignInSubmit)();
                }}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className="mt-2 h-[56px] flex-row items-center justify-center rounded-2xl bg-primary shadow-md">
                {isSubmitting ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <>
                    <Text className="text-base font-bold text-primary-foreground">Log In</Text>

                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color={colors.primaryForeground}
                      style={{ marginLeft: 9 }}
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* ERROR + FORGOT PASSWORD */}
              <View className="min-h-[40px] flex-row items-center justify-between gap-2">
                <View className="flex-1 pr-2">
                  {authError ? (
                    <Text className="text-xs leading-5 text-destructive" numberOfLines={2}>
                      {authError}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  activeOpacity={0.7}
                  className="py-2">
                  <Text className="whitespace-nowrap text-sm font-semibold text-primary">
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SIGN UP */}
              <View className="flex-row items-center justify-center">
                <Text className="text-sm text-muted-foreground">Don&apos;t have an account? </Text>

                <TouchableOpacity onPress={() => router.push('/(auth)/sign_up')}>
                  <Text className="text-sm font-bold text-primary">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
