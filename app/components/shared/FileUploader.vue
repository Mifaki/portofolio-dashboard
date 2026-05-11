<script setup lang="ts">
import { useUploadThing } from '~/composables/useUploadThing'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    accept?: string
    maxSizeMb?: number
    disabled?: boolean
  }>(),
  {
    accept: 'image/*',
    maxSizeMb: 4,
    disabled: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [url: string]
  error: [message: string]
}>()

const { startUpload, isUploading } = useUploadThing('imageUploader')

const isDragging = ref(false)
const preview = ref<string | null>(props.modelValue ?? null)
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined) preview.value = val ?? null
  }
)

async function handleFiles(files: FileList | null) {
  if (!files?.length || props.disabled) return
  const file = files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    emit('error', 'Only image files are allowed.')
    return
  }
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    emit('error', `File must be smaller than ${props.maxSizeMb}MB.`)
    return
  }

  preview.value = URL.createObjectURL(file)

  try {
    const result = await startUpload([file])
    if (result?.[0]?.ufsUrl) {
      emit('update:modelValue', result[0].ufsUrl)
    } else {
      preview.value = null
      emit('error', 'Upload failed — no URL returned.')
    }
  } catch (e: any) {
    preview.value = null
    emit('error', e?.message ?? 'Upload failed.')
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  handleFiles(e.dataTransfer?.files ?? null)
}

function onInputChange(e: Event) {
  handleFiles((e.target as HTMLInputElement).files)
}

function openFilePicker() {
  if (!props.disabled) inputRef.value?.click()
}

function clearImage(e: MouseEvent) {
  e.stopPropagation()
  preview.value = null
  emit('update:modelValue', '')
  if (inputRef.value) inputRef.value.value = ''
}
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors"
    :class="[
      isDragging
        ? 'border-primary bg-primary/5'
        : 'border-default bg-elevated/30 hover:border-primary/50',
      disabled || isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer',
      preview ? 'p-2' : 'p-8',
    ]"
    @click="openFilePicker"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <input ref="inputRef" type="file" :accept="accept" class="hidden" @change="onInputChange" />

    <template v-if="preview">
      <div class="relative w-full">
        <img
          :src="preview"
          alt="Upload preview"
          class="max-h-48 w-full rounded-md object-contain"
        />
        <UButton
          icon="i-lucide-x"
          color="error"
          variant="solid"
          size="xs"
          class="absolute top-1 right-1"
          :disabled="isUploading"
          @click="clearImage"
        />
      </div>

      <div v-if="isUploading" class="flex w-full items-center gap-2 px-1">
        <UProgress class="flex-1" />
        <span class="text-muted text-xs">Uploading…</span>
      </div>
    </template>

    <template v-else>
      <div
        class="bg-elevated flex size-12 items-center justify-center rounded-full"
        :class="isDragging ? 'bg-primary/10' : ''"
      >
        <UIcon
          :name="isUploading ? 'i-lucide-loader' : 'i-lucide-image-plus'"
          class="text-muted size-6"
          :class="isUploading ? 'animate-spin' : ''"
        />
      </div>

      <div class="text-center">
        <p class="text-default text-sm font-medium">
          <span class="text-primary">Click to upload</span> or drag and drop
        </p>
        <p class="text-muted mt-1 text-xs">PNG, JPG, GIF, WEBP up to {{ maxSizeMb }}MB</p>
      </div>
    </template>
  </div>
</template>
