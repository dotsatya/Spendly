import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '@/components/ui/InputField';
import { signUpSchema, SignUpFormValues, codeSchema, CodeFormValues } from '@/lib/schemas/auth';
import { useThemeColors } from '@/lib/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const colors = useThemeColors();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // SIGN UP FORM
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  // VERIFICATION FORM
  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    mode: 'onBlur',
    defaultValues: {
      code: '',
    },
  });

  // SIGN UP HANDLER
  const onSignUpSubmit = async (data: SignUpFormValues) => {
    if (!isLoaded || isLoading) return;

    try {
      setIsLoading(true);

      const { error } = await signUp.password({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();

      if (sendError) {
        Alert.alert('Verification error', sendError.message);
        return;
      }

      setVerificationEmail(data.email);
      setIsVerifying(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong during sign up.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // VERIFY EMAIL HANDLER
  const onVerifySubmit = async (data: CodeFormValues) => {
    if (!isLoaded || isLoading) return;

    try {
      setIsLoading(true);

      const { error } = await signUp.verifications.verifyEmailCode({
        code: data.code,
      });

      if (error) {
        Alert.alert('Verification failed', error.message);
        return;
      }

      const { error: finalizeError } = await signUp.finalize();

      if (finalizeError) {
        Alert.alert('Error', finalizeError.message);
        return;
      }

      router.replace('/(root)/(tabs)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // RESEND VERIFICATION CODE
  const handleResendCode = async () => {
    if (!isLoaded || isResending) return;

    try {
      setIsResending(true);

      const { error } = await signUp.verifications.sendEmailCode();

      if (error) {
        Alert.alert('Resend Error', error.message);
      } else {
        Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not resend verification code.';
      Alert.alert('Error', msg);
    } finally {
      setIsResending(false);
    }
  };

  // LOADING SCREEN
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.chart2} />
      </View>
    );
  }

  // ALREADY SIGNED IN
  if (isSignedIn) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <View className="w-full items-center rounded-3xl border border-border bg-card p-8">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Ionicons name="checkmark-circle" size={42} color={colors.chart2} />
          </View>

          <Text className="mt-5 text-xl font-extrabold text-foreground">
            You&apos;re already signed in
          </Text>

          <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">
            Welcome back! Continue tracking your spending and savings.
          </Text>

          <TouchableOpacity
            onPress={() => router.replace('/(root)/(tabs)')}
            className="mt-7 w-full items-center rounded-2xl bg-primary py-4">
            <Text className="font-bold text-primary-foreground">Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN SCREEN
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

          {!isVerifying ? (
            /* SIGN UP SCREEN */
            <View className="flex-1 py-8">
              {/* HEADER */}
              <View className="mb-8">
                <Text className="text-[30px] font-extrabold tracking-tight text-foreground">
                  Create account
                </Text>

                <Text className="mt-2 text-sm leading-6 text-muted-foreground">
                  Join Spendly and take full control of your finances.
                </Text>
              </View>

              {/* FORM */}
              <View className="gap-5">
                {/* FIRST NAME & LAST NAME */}
                <View className="flex-row gap-3">
                  <InputField
                    label="First name"
                    icon="person-outline"
                    error={formErrors.firstName?.message}>
                    <Controller
                      control={control}
                      name="firstName"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          placeholder="First Name"
                          placeholderTextColor={colors.mutedForeground}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="words"
                          className="ml-3 flex-1 text-sm text-foreground"
                        />
                      )}
                    />
                  </InputField>

                  <InputField
                    label="Last name"
                    icon="person-outline"
                    error={formErrors.lastName?.message}>
                    <Controller
                      control={control}
                      name="lastName"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          placeholder="Last Name"
                          placeholderTextColor={colors.mutedForeground}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="words"
                          className="ml-3 flex-1 text-sm text-foreground"
                        />
                      )}
                    />
                  </InputField>
                </View>

                {/* EMAIL */}
                <InputField
                  label="Email address"
                  icon="mail-outline"
                  error={formErrors.email?.message}>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="name@example.com"
                        placeholderTextColor={colors.mutedForeground}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="ml-3 flex-1 text-sm text-foreground"
                      />
                    )}
                  />
                </InputField>

                {/* PASSWORD */}
                <InputField
                  label="Password"
                  icon="lock-closed-outline"
                  error={formErrors.password?.message}>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <>
                        <TextInput
                          placeholder="At least 8 characters"
                          placeholderTextColor={colors.mutedForeground}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          className="ml-3 flex-1 text-sm text-foreground"
                        />

                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          className="p-1">
                          <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.mutedForeground}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  />
                </InputField>
              </View>

              {/* CREATE ACCOUNT BUTTON */}
              <TouchableOpacity
                onPress={() => {
                  void handleSubmit(onSignUpSubmit)();
                }}
                disabled={isLoading}
                activeOpacity={0.85}
                className={`mt-8 h-[56px] flex-row items-center justify-center rounded-2xl bg-primary ${
                  isLoading ? 'opacity-70' : ''
                }`}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primaryForeground} />
                ) : (
                  <>
                    <Text className="text-base font-bold text-primary-foreground">
                      Create account
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color={colors.primaryForeground}
                      style={{ marginLeft: 9 }}
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* LOGIN LINK */}
              <View className="mt-7 flex-row items-center justify-center">
                <Text className="text-sm text-muted-foreground">Already have an account? </Text>

                <TouchableOpacity onPress={() => router.push('/(auth)/sign_in')}>
                  <Text className="text-sm font-bold text-primary">Sign In</Text>
                </TouchableOpacity>
              </View>

              {/* FOOTER */}
              <Text className="mt-7 text-center text-xs leading-5 text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>
          ) : (
            /* EMAIL VERIFICATION SCREEN */
            <View className="flex-1 justify-center py-8">
              <View className="items-center">
                <View className="h-20 w-20 items-center justify-center rounded-3xl bg-secondary">
                  <Ionicons name="mail-open-outline" size={37} color={colors.chart2} />
                </View>

                <Text className="mt-6 text-[27px] font-extrabold tracking-tight text-foreground">
                  Verify your email
                </Text>

                <Text className="mt-3 px-3 text-center text-sm leading-6 text-muted-foreground">
                  We&apos;ve sent a verification code to your email address. Enter the code below to
                  activate your account.
                </Text>

                <View className="mt-4 flex-row items-center rounded-full bg-secondary px-4 py-2">
                  <Ionicons name="mail-outline" size={14} color={colors.chart2} />

                  <Text className="ml-2 text-xs font-semibold text-foreground">
                    {verificationEmail}
                  </Text>
                </View>
              </View>

              {/* CODE FORM */}
              <View className="mt-10">
                <Text className="mb-2 text-sm font-semibold text-foreground">
                  Verification code
                </Text>

                <Controller
                  control={codeControl}
                  name="code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      className={`h-[58px] flex-row items-center rounded-2xl border bg-muted/40 px-4 ${
                        codeErrors.code ? 'border-destructive' : 'border-input'
                      }`}>
                      <Ionicons name="key-outline" size={20} color={colors.mutedForeground} />

                      <TextInput
                        placeholder="Enter your verification code"
                        placeholderTextColor={colors.mutedForeground}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        className="ml-3 flex-1 text-base tracking-widest text-foreground"
                      />
                    </View>
                  )}
                />

                {codeErrors.code && (
                  <Text className="mt-2 text-xs text-destructive">{codeErrors.code.message}</Text>
                )}

                {/* VERIFY BUTTON */}
                <TouchableOpacity
                  onPress={() => {
                    void handleCodeSubmit(onVerifySubmit)();
                  }}
                  disabled={isLoading}
                  activeOpacity={0.85}
                  className="mt-7 h-[56px] flex-row items-center justify-center rounded-2xl bg-primary">
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primaryForeground} />
                  ) : (
                    <>
                      <Text className="text-base font-bold text-primary-foreground">
                        Verify & complete
                      </Text>

                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color={colors.primaryForeground}
                        style={{ marginLeft: 9 }}
                      />
                    </>
                  )}
                </TouchableOpacity>

                {/* RESEND CODE */}
                <View className="mt-7 flex-row items-center justify-center">
                  <Text className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?{' '}
                  </Text>

                  <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
                    <Text className="text-sm font-bold text-primary">
                      {isResending ? 'Resending...' : 'Resend code'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* BACK TO SIGNUP */}
                <TouchableOpacity
                  onPress={() => setIsVerifying(false)}
                  className="mt-5 items-center py-3">
                  <Text className="text-sm font-medium text-muted-foreground">
                    Change email or account details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View nativeID="clerk-captcha" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
