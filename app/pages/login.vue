<script setup lang="ts">
import { useAuth } from '~/composables/auth/useAuth'
import {
  credentialsSchema,
  otpSchema,
  type CredentialsSchema,
  type OtpSchema,
} from '~/composables/auth/schemas'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })

const { login, verifyOtp, requestOtp, isAuthenticated } = useAuth()
const toast = useToast()

if (isAuthenticated.value) {
  await navigateTo('/')
}

type Step = 'credentials' | 'otp'
const step = ref<Step>('credentials')
const isLoading = ref(false)
const email = ref('')
const resendCooldown = ref(0)

const credentials = reactive<CredentialsSchema>({ identifier: '', password: '' })
const otpState = reactive<OtpSchema>({ pin: [] })

let cooldownTimer: ReturnType<typeof setInterval> | null = null
const startCooldown = () => {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    if (--resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function onLoginSubmit(event: FormSubmitEvent<CredentialsSchema>) {
  isLoading.value = true
  try {
    email.value = await login(event.data.identifier, event.data.password)
    step.value = 'otp'
    startCooldown()
  } catch (e: any) {
    toast.add({
      title: 'Sign in failed',
      description: e.data?.message ?? 'Invalid credentials. Please try again.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isLoading.value = false
  }
}

async function submitOtp(pin: string) {
  isLoading.value = true
  try {
    await verifyOtp(email.value, pin)
    await navigateTo('/')
  } catch (e: any) {
    toast.add({
      title: 'Verification failed',
      description: e.data?.message ?? 'Invalid code. Please try again.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
    otpState.pin = []
  } finally {
    isLoading.value = false
  }
}

async function onOtpSubmit(event: FormSubmitEvent<OtpSchema>) {
  await submitOtp(event.data.pin.join(''))
}

async function onPinComplete(value: string[]) {
  await submitOtp(value.join(''))
}

async function handleResend() {
  if (resendCooldown.value > 0) return
  isLoading.value = true
  try {
    await requestOtp(email.value)
    otpState.pin = []
    startCooldown()
    toast.add({
      title: 'Code resent',
      description: `A new code was sent to ${email.value}`,
      color: 'success',
      icon: 'i-lucide-mail',
    })
  } catch (e: any) {
    toast.add({
      title: 'Failed to resend',
      description: e.data?.message ?? 'Could not resend the code. Try again.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  step.value = 'credentials'
  otpState.pin = []
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
  }
  resendCooldown.value = 0
}
</script>

<template>
  <div class="bg-default flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-sm space-y-6">
      <div class="space-y-1 text-center">
        <h1 class="text-highlighted text-2xl font-bold tracking-tight">Portofolio Dashboard</h1>
        <p class="text-muted text-sm">
          {{ step === 'credentials' ? 'Sign in to your account' : 'Check your email' }}
        </p>
      </div>

      <UCard :ui="{ body: 'p-6 sm:p-8' }">
        <UForm
          v-if="step === 'credentials'"
          :schema="credentialsSchema"
          :state="credentials"
          class="space-y-4"
          @submit="onLoginSubmit"
        >
          <UFormField label="Email or Username" name="identifier">
            <UInput
              v-model="credentials.identifier"
              placeholder="your@email.com"
              autocomplete="username"
              size="md"
              class="w-full"
              :disabled="isLoading"
            />
          </UFormField>

          <UFormField label="Password" name="password">
            <UInput
              v-model="credentials.password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              size="md"
              class="w-full"
              :disabled="isLoading"
            />
          </UFormField>

          <UButton type="submit" label="Continue" block size="md" :loading="isLoading" />
        </UForm>

        <UForm v-else :schema="otpSchema" :state="otpState" class="space-y-5" @submit="onOtpSubmit">
          <div class="space-y-1 text-center">
            <p class="text-muted text-sm">We sent a 6-digit code to</p>
            <p class="text-highlighted font-semibold">{{ email }}</p>
          </div>

          <UFormField label="Verification Code" name="pin">
            <div class="flex justify-center">
              <UPinInput
                v-model="otpState.pin"
                :length="6"
                otp
                size="lg"
                :disabled="isLoading"
                @complete="onPinComplete"
              />
            </div>
          </UFormField>

          <UButton type="submit" label="Verify" block size="md" :loading="isLoading" />

          <div class="flex items-center justify-between pt-1">
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-arrow-left"
              label="Back"
              :disabled="isLoading"
              @click="goBack"
            />
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              :disabled="resendCooldown > 0 || isLoading"
              @click="handleResend"
            >
              {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>

  <UToaster />
</template>
