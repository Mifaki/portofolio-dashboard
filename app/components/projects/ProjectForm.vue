<script setup lang="ts">
import { z } from 'zod'
import type { Sortable as SortableType, SortableStopEvent } from '@shopify/draggable'
import type { Project, CreateProjectPayload, ProjectTextPayload } from '~/types/projects'

const props = defineProps<{
  initialData?: Project | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CreateProjectPayload]
  cancel: []
}>()

const baseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  type: z.string().min(1, 'Type is required').max(100),
  year: z.string().regex(/^\d{4}$/, 'Must be a 4-digit year'),
})

const baseState = reactive({ title: '', category: '', type: '', year: '' })
const internalPosition = ref(0)

let _seq = 0

type TextEntry = { _id: number; content: string }
type ImageEntry = {
  _id: number
  imageUrl: string
  type: 'thumbnail' | 'normal'
  orientation: 'landscape' | 'portrait'
}

const texts = ref<TextEntry[]>([{ _id: ++_seq, content: '' }])
const images = ref<ImageEntry[]>([])

function populate(data: Project | null | undefined) {
  if (!data) {
    Object.assign(baseState, { title: '', category: '', type: '', year: '' })
    internalPosition.value = 0
    texts.value = [{ _id: ++_seq, content: '' }]
    images.value = []
    return
  }
  internalPosition.value = data.position
  Object.assign(baseState, {
    title: data.title,
    category: data.category,
    type: data.type,
    year: data.year,
  })
  texts.value = data.texts.length
    ? [...data.texts]
        .sort((a, b) => a.position - b.position)
        .map((t) => ({ _id: ++_seq, content: t.content }))
    : [{ _id: ++_seq, content: '' }]
  images.value = data.images.map((img) => ({
    _id: ++_seq,
    imageUrl: img.imageUrl,
    type: img.type,
    orientation: img.orientation,
  }))
}

watch(() => props.initialData, populate, { immediate: true })

const textsContainerRef = ref<HTMLElement | null>(null)
const imagesContainerRef = ref<HTMLElement | null>(null)
let textsSortable: SortableType | null = null
let imagesSortable: SortableType | null = null

async function initSortable(
  el: HTMLElement,
  arr: { value: TextEntry[] } | { value: ImageEntry[] }
): Promise<SortableType> {
  const { Sortable } = await import('@shopify/draggable')
  const s = new Sortable(el, {
    draggable: '[data-sortable-item]',
    handle: '[data-drag-handle]',
    mirror: { constrainDimensions: true },
    distance: 4,
  })

  s.on('sortable:stop', (evt: SortableStopEvent) => {
    const { oldIndex, newIndex } = evt
    if (oldIndex === newIndex) return
    const items = [...(arr.value as any[])]
    const [moved] = items.splice(oldIndex, 1)
    items.splice(newIndex, 0, moved)
    ;(arr as any).value = items
  })

  return s
}

async function mountSortables() {
  if (textsContainerRef.value) {
    textsSortable?.destroy()
    textsSortable = await initSortable(textsContainerRef.value, texts)
  }
  if (imagesContainerRef.value) {
    imagesSortable?.destroy()
    imagesSortable = await initSortable(imagesContainerRef.value, images)
  }
}

onMounted(mountSortables)
onUnmounted(() => {
  textsSortable?.destroy()
  imagesSortable?.destroy()
})

watch([() => texts.value.length, () => images.value.length], async () => {
  await nextTick()
  mountSortables()
})

function addText() {
  texts.value.push({ _id: ++_seq, content: '' })
}
function removeText(i: number) {
  if (texts.value.length === 1) return
  texts.value.splice(i, 1)
}
function addImage() {
  images.value.push({ _id: ++_seq, imageUrl: '', type: 'thumbnail', orientation: 'landscape' })
}
function removeImage(i: number) {
  images.value.splice(i, 1)
}

function onSubmit(event: { data: typeof baseState }) {
  const payload: CreateProjectPayload = {
    position: internalPosition.value,
    title: event.data.title,
    category: event.data.category,
    type: event.data.type,
    year: event.data.year,
    texts: texts.value
      .filter((t) => t.content.trim())
      .map((t, i) => ({ content: t.content, position: i })) as ProjectTextPayload[],
    images: images.value
      .filter((img) => img.imageUrl)
      .map(({ imageUrl, type, orientation }) => ({ imageUrl, type, orientation })),
  }
  emit('submit', payload)
}

const imageTypeOptions = ['thumbnail', 'normal']
const orientationOptions = ['landscape', 'portrait']
</script>

<template>
  <UForm :schema="baseSchema" :state="baseState" class="space-y-8" @submit="onSubmit">
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="text-muted text-xs font-semibold tracking-widest uppercase">Metadata</span>
        <div class="bg-default h-px flex-1" />
      </div>

      <div class="grid grid-cols-3 gap-4">
        <UFormField label="Year" name="year" required>
          <UInput
            v-model="baseState.year"
            placeholder="2024"
            maxlength="4"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>
        <UFormField label="Category" name="category" required>
          <UInput
            v-model="baseState.category"
            placeholder="Web"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>
        <UFormField label="Type" name="type" required>
          <UInput
            v-model="baseState.type"
            placeholder="Frontend"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>
      </div>

      <UFormField label="Title" name="title" required>
        <UInput
          v-model="baseState.title"
          placeholder="My Awesome Project"
          class="w-full"
          :disabled="loading"
        />
      </UFormField>
    </section>

    <div class="grid gap-8 lg:grid-cols-2 lg:items-start">
      <section class="space-y-3 lg:sticky lg:top-2">
        <div class="flex items-center gap-3">
          <span class="text-muted text-xs font-semibold tracking-widest uppercase">Content</span>
          <div class="bg-default h-px flex-1" />
          <span class="bg-elevated text-muted rounded-full px-2 py-0.5 text-xs font-medium">
            {{ texts.length }}
          </span>
          <UButton
            icon="i-lucide-plus"
            size="xs"
            variant="ghost"
            color="neutral"
            label="Add block"
            :disabled="loading"
            @click.prevent="addText"
          />
        </div>

        <div ref="textsContainerRef" class="space-y-2">
          <div
            v-for="(text, i) in texts"
            :key="text._id"
            data-sortable-item
            class="border-default bg-background relative rounded-lg border"
            :class="loading ? 'opacity-60' : ''"
          >
            <div class="border-default flex items-center justify-between gap-2 border-b px-2">
              <div class="flex items-center gap-2">
                <div class="flex flex-row items-center">
                  <div
                    data-drag-handle
                    class="text-muted flex cursor-grab items-center px-2 py-3 active:cursor-grabbing"
                  >
                    <UIcon name="i-lucide-grip-vertical" class="size-4" />
                  </div>
                  <span
                    class="bg-elevated text-muted flex size-5 items-center justify-center rounded-full text-xs font-medium"
                  >
                    {{ i + 1 }}
                  </span>
                  <span class="text-muted flex-1 text-xs font-medium">Text {{ i + 1 }}</span>
                </div>
              </div>
              <UButton
                icon="i-lucide-x"
                color="error"
                variant="ghost"
                size="xs"
                :disabled="loading || texts.length === 1"
                @click.prevent="removeText(i)"
              />
            </div>
            <div class="p-3">
              <UTextarea
                v-model="text.content"
                placeholder="Enter description text…"
                class="w-full border-none bg-transparent shadow-none focus:ring-0"
                :rows="4"
                :disabled="loading"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-muted text-xs font-semibold tracking-widest uppercase">Media</span>
          <div class="bg-default h-px flex-1" />
          <span class="bg-elevated text-muted rounded-full px-2 py-0.5 text-xs font-medium">
            {{ images.length }}
          </span>
          <UButton
            icon="i-lucide-plus"
            size="xs"
            variant="ghost"
            color="neutral"
            label="Add image"
            :disabled="loading"
            @click.prevent="addImage"
          />
        </div>

        <div
          v-if="!images.length"
          class="border-default hover:border-primary/40 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 text-center transition-colors"
          @click="addImage"
        >
          <div class="bg-elevated flex size-10 items-center justify-center rounded-full">
            <UIcon name="i-lucide-image-plus" class="text-muted size-5" />
          </div>
          <p class="text-muted text-sm">Click to add your first image</p>
        </div>

        <div ref="imagesContainerRef" class="space-y-3">
          <div
            v-for="(img, i) in images"
            :key="img._id"
            data-sortable-item
            class="border-default bg-background rounded-lg border transition-shadow"
            :class="loading ? 'opacity-60' : ''"
          >
            <div class="border-default flex items-center gap-2 border-b px-3 py-2">
              <div data-drag-handle class="text-muted cursor-grab active:cursor-grabbing">
                <UIcon name="i-lucide-grip-vertical" class="size-4" />
              </div>
              <span
                class="bg-elevated text-muted flex size-5 items-center justify-center rounded-full text-xs font-medium"
              >
                {{ i + 1 }}
              </span>
              <span class="text-muted flex-1 text-xs font-medium">Image {{ i + 1 }}</span>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                :disabled="loading"
                @click.prevent="removeImage(i)"
              />
            </div>
            <div class="space-y-3 p-3">
              <SharedFileUploader v-model="img.imageUrl" :disabled="loading" />
              <div class="grid grid-cols-2 gap-3">
                <UFormField label="Type">
                  <USelect
                    v-model="img.type"
                    :items="imageTypeOptions"
                    class="w-full"
                    :disabled="loading"
                  />
                </UFormField>
                <UFormField label="Orientation">
                  <USelect
                    v-model="img.orientation"
                    :items="orientationOptions"
                    class="w-full"
                    :disabled="loading"
                  />
                </UFormField>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="border-default flex items-center justify-end gap-2 border-t pt-6">
      <UButton
        color="neutral"
        variant="ghost"
        label="Cancel"
        :disabled="loading"
        @click.prevent="emit('cancel')"
      />
      <UButton
        type="submit"
        :label="initialData ? 'Save Changes' : 'Create Project'"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
