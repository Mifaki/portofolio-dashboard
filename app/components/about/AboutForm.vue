<script setup lang="ts">
import { z } from 'zod'
import type { Sortable as SortableType, SortableStopEvent } from '@shopify/draggable'
import { useAboutService } from '~/composables/about/service'
import { useAuth } from '~/composables/auth/useAuth'
import type {
  About,
  AboutTechStack,
  WorkExperience,
  TechStackInput,
  WorkExperienceInput,
} from '~/types/about'
import { MONTHS } from '~/constants'


const props = defineProps<{ about: About }>()
const emit = defineEmits<{ refresh: [] }>()

const service = useAboutService()
const { isAuthenticated } = useAuth()
const toast = useToast()

function showError(title: string, e: any) {
  toast.add({
    title,
    description: e.data?.message ?? 'Something went wrong.',
    color: 'error',
    icon: 'i-lucide-circle-alert',
  })
}

const infoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  instagram: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
const infoState = reactive({ name: '', instagram: '', github: '', linkedin: '' })
const isSavingInfo = ref(false)

watch(
  () => props.about,
  (a) => {
    infoState.name = a.name
    infoState.instagram = a.instagram ?? ''
    infoState.github = a.github ?? ''
    infoState.linkedin = a.linkedin ?? ''
  },
  { immediate: true }
)

async function saveInfo() {
  isSavingInfo.value = true
  try {
    await service.update({
      name: infoState.name,
      instagram: infoState.instagram || null,
      github: infoState.github || null,
      linkedin: infoState.linkedin || null,
    })
    toast.add({ title: 'Profile info saved', color: 'success', icon: 'i-lucide-check-circle' })
    emit('refresh')
  } catch (e: any) {
    showError('Failed to save info', e)
  } finally {
    isSavingInfo.value = false
  }
}

let _seq = 0
type DescEntry = { _id: number; content: string }

const descriptions = ref<DescEntry[]>([])
const isSavingDescs = ref(false)
const descsContainerRef = ref<HTMLElement | null>(null)
let descsSortable: SortableType | null = null

watch(
  () => props.about,
  (a) => {
    descriptions.value = a.descriptions.length
      ? [...a.descriptions]
          .sort((x, y) => x.position - y.position)
          .map((d) => ({ _id: ++_seq, content: d.content }))
      : [{ _id: ++_seq, content: '' }]
  },
  { immediate: true }
)

async function initDescsSortable() {
  if (!descsContainerRef.value) return
  descsSortable?.destroy()
  const { Sortable } = await import('@shopify/draggable')
  descsSortable = new Sortable(descsContainerRef.value, {
    draggable: '[data-sortable-item]',
    handle: '[data-drag-handle]',
    mirror: { constrainDimensions: true },
    distance: 4,
  })
  descsSortable.on('sortable:stop', (evt: SortableStopEvent) => {
    const { oldIndex, newIndex } = evt
    if (oldIndex === newIndex) return
    const arr = [...descriptions.value]
    const moved = arr.splice(oldIndex, 1)[0]
    if (!moved) return
    arr.splice(newIndex, 0, moved)
    descriptions.value = arr
  })
}

onMounted(() => initDescsSortable())
onUnmounted(() => descsSortable?.destroy())
watch(
  () => descriptions.value.length,
  async () => {
    await nextTick()
    initDescsSortable()
  }
)

function addDesc() {
  descriptions.value.push({ _id: ++_seq, content: '' })
}
function removeDesc(i: number) {
  if (descriptions.value.length === 1) return
  descriptions.value.splice(i, 1)
}

async function saveDescriptions() {
  isSavingDescs.value = true
  try {
    await service.update({
      descriptions: descriptions.value
        .filter((d) => d.content.trim())
        .map((d, i) => ({ content: d.content, position: i })),
    })
    toast.add({ title: 'Descriptions saved', color: 'success', icon: 'i-lucide-check-circle' })
    emit('refresh')
  } catch (e: any) {
    showError('Failed to save descriptions', e)
  } finally {
    isSavingDescs.value = false
  }
}

type ImageEntry = { _id: number; imageUrl: string }
const images = ref<ImageEntry[]>([])
const isSavingImages = ref(false)

watch(
  () => props.about,
  (a) => {
    images.value = [...a.images]
      .sort((x, y) => x.position - y.position)
      .map((img) => ({ _id: ++_seq, imageUrl: img.imageUrl }))
  },
  { immediate: true }
)

function addImage() {
  images.value.push({ _id: ++_seq, imageUrl: '' })
}
function removeImage(i: number) {
  images.value.splice(i, 1)
}

async function saveImages() {
  isSavingImages.value = true
  try {
    await service.update({
      images: images.value
        .filter((img) => img.imageUrl.trim())
        .map((img, i) => ({ imageUrl: img.imageUrl, position: i })),
    })
    toast.add({ title: 'Images saved', color: 'success', icon: 'i-lucide-check-circle' })
    emit('refresh')
  } catch (e: any) {
    showError('Failed to save images', e)
  } finally {
    isSavingImages.value = false
  }
}

const isTechDialogOpen = ref(false)
const techDialogMode = ref<'create' | 'edit'>('create')
const editingTechStack = ref<AboutTechStack | undefined>(undefined)
const isSavingTech = ref(false)

const techStacks = computed<AboutTechStack[]>(() =>
  [...props.about.techStacks].sort((a, b) => a.position - b.position)
)

function openAddTech() {
  techDialogMode.value = 'create'
  editingTechStack.value = undefined
  isTechDialogOpen.value = true
}
function openEditTech(ts: AboutTechStack) {
  techDialogMode.value = 'edit'
  editingTechStack.value = ts
  isTechDialogOpen.value = true
}

async function saveTechStack(payload: TechStackInput & { position: number }) {
  isSavingTech.value = true
  try {
    let updated: TechStackInput[]
    if (techDialogMode.value === 'edit' && editingTechStack.value) {
      updated = techStacks.value.map((ts) =>
        ts.id === editingTechStack.value!.id
          ? {
              name: payload.name,
              iconUrl: payload.iconUrl,
              percentage: payload.percentage,
              position: ts.position,
            }
          : { name: ts.name, iconUrl: ts.iconUrl, percentage: ts.percentage, position: ts.position }
      )
    } else {
      updated = [
        ...techStacks.value.map((ts) => ({
          name: ts.name,
          iconUrl: ts.iconUrl,
          percentage: ts.percentage,
          position: ts.position,
        })),
        {
          name: payload.name,
          iconUrl: payload.iconUrl,
          percentage: payload.percentage,
          position: techStacks.value.length,
        },
      ]
    }
    await service.update({ techStacks: updated })
    toast.add({
      title: techDialogMode.value === 'create' ? 'Skill added' : 'Skill updated',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    isTechDialogOpen.value = false
    emit('refresh')
  } catch (e: any) {
    showError('Failed to save skill', e)
  } finally {
    isSavingTech.value = false
  }
}

async function deleteTechStack(ts: AboutTechStack) {
  isSavingTech.value = true
  try {
    const updated = techStacks.value
      .filter((t) => t.id !== ts.id)
      .map((t, i) => ({ name: t.name, iconUrl: t.iconUrl, percentage: t.percentage, position: i }))
    await service.update({ techStacks: updated })
    toast.add({ title: 'Skill removed', color: 'success', icon: 'i-lucide-check-circle' })
    emit('refresh')
  } catch (e: any) {
    showError('Failed to delete skill', e)
  } finally {
    isSavingTech.value = false
  }
}

const isWorkDialogOpen = ref(false)
const workDialogMode = ref<'create' | 'edit'>('create')
const editingWork = ref<WorkExperience | undefined>(undefined)
const isSavingWork = ref(false)

const workExperiences = computed<WorkExperience[]>(() =>
  [...props.about.workExperiences].sort((a, b) => a.position - b.position)
)

function formatPeriod(exp: WorkExperience) {
  const start = `${MONTHS[exp.startMonth - 1]} ${exp.startYear}`
  if (exp.endMonth == null || exp.endYear == null) return `${start} – Present`
  return `${start} – ${MONTHS[exp.endMonth - 1]} ${exp.endYear}`
}

function openAddWork() {
  workDialogMode.value = 'create'
  editingWork.value = undefined
  isWorkDialogOpen.value = true
}
function openEditWork(exp: WorkExperience) {
  workDialogMode.value = 'edit'
  editingWork.value = exp
  isWorkDialogOpen.value = true
}

function toWorkInput(exp: WorkExperience): WorkExperienceInput {
  return {
    company: exp.company,
    role: exp.role,
    description: exp.description ?? undefined,
    location: exp.location ?? undefined,
    startMonth: exp.startMonth,
    startYear: exp.startYear,
    endMonth: exp.endMonth ?? undefined,
    endYear: exp.endYear ?? undefined,
    position: exp.position,
  }
}

async function saveWorkExperience(payload: WorkExperienceInput) {
  isSavingWork.value = true
  try {
    let updated: WorkExperienceInput[]
    if (workDialogMode.value === 'edit' && editingWork.value) {
      updated = workExperiences.value.map((exp) =>
        exp.id === editingWork.value!.id ? { ...payload, position: exp.position } : toWorkInput(exp)
      )
    } else {
      updated = [
        ...workExperiences.value.map(toWorkInput),
        { ...payload, position: workExperiences.value.length },
      ]
    }
    await service.update({ workExperiences: updated })
    toast.add({
      title: workDialogMode.value === 'create' ? 'Experience added' : 'Experience updated',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    isWorkDialogOpen.value = false
    emit('refresh')
  } catch (e: any) {
    showError('Failed to save experience', e)
  } finally {
    isSavingWork.value = false
  }
}

async function deleteWorkExperience(exp: WorkExperience) {
  isSavingWork.value = true
  try {
    const updated = workExperiences.value
      .filter((e) => e.id !== exp.id)
      .map((e, i) => ({ ...toWorkInput(e), position: i }))
    await service.update({ workExperiences: updated })
    toast.add({ title: 'Experience removed', color: 'success', icon: 'i-lucide-check-circle' })
    emit('refresh')
  } catch (e: any) {
    showError('Failed to delete experience', e)
  } finally {
    isSavingWork.value = false
  }
}
</script>

<template>
  <div class="space-y-10 p-6 lg:p-8">
    <!-- ── Profile ── -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="text-muted text-xs font-semibold tracking-widest uppercase">Profile</span>
        <div class="bg-default h-px flex-1" />
      </div>

      <UForm :schema="infoSchema" :state="infoState" class="space-y-4" @submit="saveInfo">
        <div class="grid gap-4 lg:grid-cols-2">
          <UFormField label="Name" name="name" required class="lg:col-span-2">
            <UInput
              v-model="infoState.name"
              placeholder="Your name"
              class="w-full"
              :disabled="isSavingInfo || !isAuthenticated"
            />
          </UFormField>
          <UFormField label="Instagram" name="instagram">
            <UInput
              v-model="infoState.instagram"
              placeholder="https://instagram.com/..."
              class="w-full"
              :disabled="isSavingInfo || !isAuthenticated"
            >
              <template #leading
                ><UIcon name="i-lucide-instagram" class="text-muted size-4"
              /></template>
            </UInput>
          </UFormField>
          <UFormField label="GitHub" name="github">
            <UInput
              v-model="infoState.github"
              placeholder="https://github.com/..."
              class="w-full"
              :disabled="isSavingInfo || !isAuthenticated"
            >
              <template #leading
                ><UIcon name="i-simple-icons-github" class="text-muted size-4"
              /></template>
            </UInput>
          </UFormField>
          <UFormField label="LinkedIn" name="linkedin">
            <UInput
              v-model="infoState.linkedin"
              placeholder="https://linkedin.com/in/..."
              class="w-full"
              :disabled="isSavingInfo || !isAuthenticated"
            >
              <template #leading
                ><UIcon name="i-lucide-linkedin" class="text-muted size-4"
              /></template>
            </UInput>
          </UFormField>
        </div>
        <div class="flex justify-end">
          <UButton
            type="submit"
            icon="i-lucide-save"
            label="Save Profile"
            :loading="isSavingInfo"
            :disabled="!isAuthenticated"
          />
        </div>
      </UForm>
    </section>

    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="text-muted text-xs font-semibold tracking-widest uppercase">Descriptions</span>
        <div class="bg-default h-px flex-1" />
        <span class="bg-elevated text-muted rounded-full px-2 py-0.5 text-xs font-medium">{{
          descriptions.length
        }}</span>
        <UButton
          icon="i-lucide-plus"
          size="xs"
          variant="ghost"
          color="neutral"
          label="Add block"
          :disabled="isSavingDescs || !isAuthenticated"
          @click="addDesc"
        />
      </div>

      <div ref="descsContainerRef" class="space-y-2">
        <div
          v-for="(desc, i) in descriptions"
          :key="desc._id"
          data-sortable-item
          class="border-default bg-background rounded-lg border"
          :class="isSavingDescs || !isAuthenticated ? 'opacity-60' : ''"
        >
          <div class="border-default flex items-center justify-between gap-2 border-b px-2">
            <div class="flex items-center gap-2">
              <div
                data-drag-handle
                class="text-muted flex cursor-grab items-center px-2 py-3 active:cursor-grabbing"
                :class="!isAuthenticated ? 'pointer-events-none' : ''"
              >
                <UIcon name="i-lucide-grip-vertical" class="size-4" />
              </div>
              <span
                class="bg-elevated text-muted flex size-5 items-center justify-center rounded-full text-xs font-medium"
                >{{ i + 1 }}</span
              >
            </div>
            <UButton
              icon="i-lucide-x"
              color="error"
              variant="ghost"
              size="xs"
              :disabled="isSavingDescs || descriptions.length === 1 || !isAuthenticated"
              @click="removeDesc(i)"
            />
          </div>
          <div class="p-3">
            <UTextarea
              v-model="desc.content"
              placeholder="Enter description text…"
              class="w-full"
              :rows="3"
              :disabled="isSavingDescs || !isAuthenticated"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <UButton
          icon="i-lucide-save"
          label="Save Descriptions"
          :loading="isSavingDescs"
          :disabled="!isAuthenticated"
          @click="saveDescriptions"
        />
      </div>
    </section>

    <!-- ── Images ── -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="text-muted text-xs font-semibold tracking-widest uppercase">Images</span>
        <div class="bg-default h-px flex-1" />
        <span class="bg-elevated text-muted rounded-full px-2 py-0.5 text-xs font-medium">{{
          images.length
        }}</span>
        <UButton
          icon="i-lucide-plus"
          size="xs"
          variant="ghost"
          color="neutral"
          label="Add image"
          :disabled="isSavingImages || !isAuthenticated"
          @click="addImage"
        />
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div
          v-for="(img, i) in images"
          :key="img._id"
          class="border-default bg-background rounded-lg border"
          :class="isSavingImages || !isAuthenticated ? 'opacity-60' : ''"
        >
          <div class="border-default flex items-center gap-2 border-b px-3 py-2">
            <span
              class="bg-elevated text-muted flex size-5 items-center justify-center rounded-full text-xs font-medium"
              >{{ i + 1 }}</span
            >
            <span class="text-muted flex-1 text-xs font-medium">Image {{ i + 1 }}</span>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              :disabled="isSavingImages || !isAuthenticated"
              @click="removeImage(i)"
            />
          </div>
          <div class="p-3">
            <SharedFileUploader
              v-model="img.imageUrl"
              :disabled="isSavingImages || !isAuthenticated"
              @error="
                (msg) =>
                  toast.add({
                    title: 'Upload error',
                    description: msg,
                    color: 'error',
                    icon: 'i-lucide-circle-alert',
                  })
              "
            />
          </div>
        </div>

        <div
          v-if="isAuthenticated"
          class="border-default hover:border-primary/40 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 text-center transition-colors"
          @click="addImage"
        >
          <div class="bg-elevated flex size-10 items-center justify-center rounded-full">
            <UIcon name="i-lucide-image-plus" class="text-muted size-5" />
          </div>
          <p class="text-muted text-sm">
            {{ images.length ? 'Add another image' : 'Add your first image' }}
          </p>
        </div>
      </div>

      <div class="flex justify-end">
        <UButton
          icon="i-lucide-save"
          label="Save Images"
          :loading="isSavingImages"
          :disabled="!isAuthenticated || !images.length"
          @click="saveImages"
        />
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="text-muted text-xs font-semibold tracking-widest uppercase">Skills</span>
        <div class="bg-default h-px flex-1" />
        <UButton
          v-if="isAuthenticated"
          icon="i-lucide-plus"
          size="xs"
          label="Add Skill"
          :disabled="isSavingTech"
          @click="openAddTech"
        />
      </div>

      <div
        v-if="!techStacks.length"
        class="border-default rounded-lg border px-4 py-10 text-center"
      >
        <UIcon name="i-lucide-layers" class="text-muted mx-auto mb-2 size-7" />
        <p class="text-muted text-sm">No skills yet.</p>
      </div>

      <div v-else class="border-default overflow-hidden rounded-lg border">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-default border-b">
              <th
                class="text-muted w-12 px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                #
              </th>
              <th
                class="text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                Name
              </th>
              <th
                class="text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                Icon
              </th>
              <th
                class="text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                Proficiency
              </th>
              <th class="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ts in techStacks"
              :key="ts.id"
              class="border-default hover:bg-elevated/50 border-b transition-colors last:border-0"
            >
              <td class="px-4 py-3.5">
                <span
                  class="bg-elevated text-muted flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums"
                  >{{ ts.position }}</span
                >
              </td>
              <td class="px-4 py-3.5">
                <span class="text-default text-sm font-medium">{{ ts.name }}</span>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2">
                  <img
                    :src="ts.iconUrl"
                    class="size-6 rounded object-contain"
                    :alt="ts.name"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <span class="text-muted max-w-[160px] truncate text-xs">{{ ts.iconUrl }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2">
                  <div class="bg-elevated h-1.5 w-24 overflow-hidden rounded-full">
                    <div
                      class="bg-primary h-full rounded-full"
                      :style="{ width: `${ts.percentage}%` }"
                    />
                  </div>
                  <span class="text-muted text-xs tabular-nums">{{ ts.percentage }}%</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex justify-end gap-1">
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :disabled="!isAuthenticated || isSavingTech"
                    @click="openEditTech(ts)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    :disabled="!isAuthenticated || isSavingTech"
                    @click="deleteTechStack(ts)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="text-muted text-xs font-semibold tracking-widest uppercase"
          >Work Experience</span
        >
        <div class="bg-default h-px flex-1" />
        <UButton
          v-if="isAuthenticated"
          icon="i-lucide-plus"
          size="xs"
          label="Add Experience"
          :disabled="isSavingWork"
          @click="openAddWork"
        />
      </div>

      <div
        v-if="!workExperiences.length"
        class="border-default rounded-lg border px-4 py-10 text-center"
      >
        <UIcon name="i-lucide-briefcase" class="text-muted mx-auto mb-2 size-7" />
        <p class="text-muted text-sm">No work experience yet.</p>
      </div>

      <div v-else class="border-default overflow-hidden rounded-lg border">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-default border-b">
              <th
                class="text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                Company
              </th>
              <th
                class="text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                Role
              </th>
              <th
                class="text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                Location
              </th>
              <th
                class="text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                Period
              </th>
              <th class="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="exp in workExperiences"
              :key="exp.id"
              class="border-default hover:bg-elevated/50 border-b transition-colors last:border-0"
            >
              <td class="px-4 py-3.5">
                <span class="text-default text-sm font-medium">{{ exp.company }}</span>
              </td>
              <td class="px-4 py-3.5">
                <span class="text-default text-sm">{{ exp.role }}</span>
              </td>
              <td class="px-4 py-3.5">
                <span class="text-muted text-sm">{{ exp.location ?? '—' }}</span>
              </td>
              <td class="px-4 py-3.5">
                <span class="text-muted text-sm tabular-nums">{{ formatPeriod(exp) }}</span>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex justify-end gap-1">
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :disabled="!isAuthenticated || isSavingWork"
                    @click="openEditWork(exp)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    :disabled="!isAuthenticated || isSavingWork"
                    @click="deleteWorkExperience(exp)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <AboutTechStackDialog
    v-model:open="isTechDialogOpen"
    :mode="techDialogMode"
    :tech-stack="editingTechStack"
    :loading="isSavingTech"
    @save="saveTechStack"
  />

  <AboutWorkExperienceDialog
    v-model:open="isWorkDialogOpen"
    :mode="workDialogMode"
    :experience="editingWork"
    :loading="isSavingWork"
    @save="saveWorkExperience"
  />
</template>
