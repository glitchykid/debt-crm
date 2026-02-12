<script setup lang="ts">
import { ArrowDown, ArrowUp, Check, Close, Delete, Plus, Refresh, View } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import UiButtonIcon from '@/components/buttons/UiButtonIcon.vue'
import UiButtonText from '@/components/buttons/UiButtonText.vue'
import UiButtonTextIcon from '@/components/buttons/UiButtonTextIcon.vue'
import UiAlert from '@/components/common/UiAlert.vue'
import UiCard from '@/components/common/UiCard.vue'
import UiStatusTag from '@/components/common/UiStatusTag.vue'
import UiInputDate from '@/components/inputs/UiInputDate.vue'
import UiInputNumber from '@/components/inputs/UiInputNumber.vue'
import UiInputText from '@/components/inputs/UiInputText.vue'
import UiSelect from '@/components/inputs/UiSelect.vue'
import UiTable from '@/components/tables/UiTable.vue'
import UiTableColumn from '@/components/tables/UiTableColumn.vue'
import { useAppI18n } from '@/i18n'
import { useDebtorStore } from '@/stores/debtors'
import type { CreateDebtorPayload, DebtorStatus, DebtorSummary } from '@/types/debtor'
import { formatPercent, formatRub } from '@/utils/format'

type DebtorFormModel = {
  name: string
  incurredDate: string
  principal: number
  dailyRate: number
  startDate: string
  status: DebtorStatus
}
type SortField = 'name' | 'incurredDate' | 'principal' | 'totalDue'
type SortOrder = 'asc' | 'desc'

const router = useRouter()
const debtorStore = useDebtorStore()
const { t } = useAppI18n()

const createDialogOpen = ref(false)
const createDialogWidth = ref('92%')
const filtersCollapsed = ref(false)
const isDesktop = ref(false)
const searchQuery = ref('')
const selectedStatuses = ref<DebtorStatus[]>([])
const sortField = ref<SortField>('incurredDate')
const sortOrder = ref<SortOrder>('desc')
const pageSize = ref(8)
const currentPage = ref(1)
const selectedIds = ref<string[]>([])
const debtorsTableRef = ref<{
  getSelectionRows: () => Array<{ id?: string }>
  clearSelection: () => void
} | null>(null)
const debtorFormRef = ref<FormInstance>()
const debtorForm = reactive<DebtorFormModel>({
  name: '',
  incurredDate: new Date().toISOString().slice(0, 10),
  principal: 1000,
  dailyRate: 0.001,
  startDate: new Date().toISOString().slice(0, 10),
  status: 'active',
})

const rules = computed<FormRules<DebtorFormModel>>(() => ({
  name: [{ required: true, message: t('validationName'), trigger: 'blur' }],
  incurredDate: [{ required: true, message: t('validationIncurredDate'), trigger: 'change' }],
  principal: [{ required: true, message: t('validationPrincipal'), trigger: 'blur' }],
  dailyRate: [{ required: true, message: t('validationDailyRate'), trigger: 'blur' }],
  startDate: [{ required: true, message: t('validationStartDate'), trigger: 'change' }],
}))

const debtors = computed(() => debtorStore.debtors)
const statusOptions = computed(() => [
  { value: 'active' as const, label: t('active') },
  { value: 'in_dispute' as const, label: t('inDispute') },
  { value: 'settled' as const, label: t('settled') },
])
const sortOptions = computed(() => [
  { value: 'name' as const, label: t('sortName') },
  { value: 'incurredDate' as const, label: t('sortIncurredDate') },
  { value: 'principal' as const, label: t('sortPrincipal') },
  { value: 'totalDue' as const, label: t('sortTotalDue') },
])
const filteredDebtors = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return debtors.value.filter((debtor) => {
    const statusMatch =
      selectedStatuses.value.length === 0 || selectedStatuses.value.includes(debtor.status)
    const searchMatch =
      !query ||
      debtor.name.toLowerCase().includes(query) ||
      debtor.incurredDate.includes(query)
    return statusMatch && searchMatch
  })
})
const sortedDebtors = computed(() => {
  return [...filteredDebtors.value].sort((left, right) => {
    let compare = 0
    if (sortField.value === 'name') {
      compare = left.name.localeCompare(right.name)
    } else if (sortField.value === 'incurredDate') {
      compare = left.incurredDate.localeCompare(right.incurredDate)
    } else if (sortField.value === 'principal') {
      compare = left.principal - right.principal
    } else {
      compare = left.totalDue - right.totalDue
    }
    return sortOrder.value === 'asc' ? compare : -compare
  })
})
const paginatedDebtors = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedDebtors.value.slice(start, start + pageSize.value)
})
const totalItems = computed(() => sortedDebtors.value.length)
onMounted(() => {
  void debtorStore.loadDebtors()
  updateResponsiveState()
  window.addEventListener('resize', updateResponsiveState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsiveState)
})

watch([searchQuery, selectedStatuses, sortField, sortOrder, pageSize], () => {
  currentPage.value = 1
})

watch(totalItems, (nextTotal) => {
  const maxPage = Math.max(Math.ceil(nextTotal / pageSize.value), 1)
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

async function submitCreateDebtor(): Promise<void> {
  if (!debtorFormRef.value) return

  const valid = await debtorFormRef.value.validate().catch(() => false)
  if (!valid) return

  const payload: CreateDebtorPayload = {
    name: debtorForm.name.trim(),
    incurredDate: debtorForm.incurredDate,
    principal: Number(debtorForm.principal),
    dailyRate: Number(debtorForm.dailyRate),
    startDate: debtorForm.startDate,
    status: debtorForm.status,
  }

  try {
    await debtorStore.addDebtor(payload)
    ElMessage.success(t('createdSuccess'))
    createDialogOpen.value = false
    resetForm()
  } catch {
    ElMessage.error(debtorStore.error ?? t('createFailed'))
  }
}

function resetForm(): void {
  debtorForm.name = ''
  debtorForm.incurredDate = new Date().toISOString().slice(0, 10)
  debtorForm.principal = 1000
  debtorForm.dailyRate = 0.001
  debtorForm.startDate = new Date().toISOString().slice(0, 10)
  debtorForm.status = 'active'
}

function viewDebtor(id: string): void {
  router.push(`/debtors/${id}`)
}

function statusLabel(status: DebtorStatus): string {
  if (status === 'active') return t('active')
  if (status === 'in_dispute') return t('inDispute')
  return t('settled')
}

function updateResponsiveState(): void {
  isDesktop.value = window.matchMedia('(min-width: 900px)').matches
  createDialogWidth.value = isDesktop.value ? '420px' : '92%'
  if (isDesktop.value) {
    filtersCollapsed.value = false
  }
}

function toggleStatusFilter(status: DebtorStatus, checked: boolean): void {
  if (checked) {
    if (!selectedStatuses.value.includes(status)) selectedStatuses.value.push(status)
    return
  }
  selectedStatuses.value = selectedStatuses.value.filter((item) => item !== status)
}

function onStatusTagChange(status: DebtorStatus, value: unknown): void {
  toggleStatusFilter(status, Boolean(value))
}

function clearFilters(): void {
  searchQuery.value = ''
  selectedStatuses.value = []
  sortField.value = 'incurredDate'
  sortOrder.value = 'desc'
}

function onTableSelectionChange(rows: Array<{ id: string }>): void {
  selectedIds.value = rows.map((row) => row.id)
}

function onMobileSelectionChange(id: string, checked: boolean): void {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    return
  }
  selectedIds.value = selectedIds.value.filter((item) => item !== id)
}

function onMobileSelectionToggle(id: string, value: unknown): void {
  onMobileSelectionChange(id, Boolean(value))
}

function getSelectedDebtorIds(): string[] {
  const tableSelectionIds =
    debtorsTableRef.value
      ?.getSelectionRows()
      .map((row) => row.id)
      .filter((id): id is string => Boolean(id)) ?? []

  return [...new Set([...selectedIds.value, ...tableSelectionIds])]
}

function getSelectedClosedDebtorIds(): string[] {
  const selectedIdSet = new Set(getSelectedDebtorIds())
  const isClosed = (debtor: DebtorSummary): boolean =>
    debtor.status === 'settled' || debtor.totalDue <= 0

  return debtors.value
    .filter((debtor: DebtorSummary) => selectedIdSet.has(debtor.id) && isClosed(debtor))
    .map((debtor) => debtor.id)
}

async function closeSelectedDebtors(): Promise<void> {
  const currentIds = new Set(debtors.value.map((debtor) => debtor.id))
  const targetIds = getSelectedDebtorIds().filter((id) => currentIds.has(id))

  if (targetIds.length === 0) {
    ElMessage.warning(t('selectionRequired'))
    return
  }

  try {
    await debtorStore.closeDebtors(targetIds)
    selectedIds.value = []
    debtorsTableRef.value?.clearSelection()
    ElMessage.success(t('bulkCloseSuccess'))
  } catch {
    ElMessage.error(debtorStore.error ?? t('closeFailed'))
  }
}

async function deleteClosedSelectedDebtors(): Promise<void> {
  const closedDebtorIds = getSelectedClosedDebtorIds()

  if (closedDebtorIds.length === 0) {
    ElMessage.warning(t('closedSelectionRequired'))
    return
  }
  const targetIds = [...closedDebtorIds]

  try {
    await ElMessageBox.confirm(t('confirmDeleteClosed'), t('delete'), {
      type: 'warning',
      confirmButtonText: t('delete'),
      cancelButtonText: t('cancel'),
    })
  } catch {
    return
  }

  try {
    await debtorStore.deleteDebtors(targetIds)
    selectedIds.value = selectedIds.value.filter((id) => !targetIds.includes(id))
    ElMessage.success(t('bulkDeleteSuccess'))
  } catch {
    ElMessage.error(debtorStore.error ?? t('deleteFailed'))
  }
}
</script>

<template>
  <UiCard shadow="never" class="debtors-card">
    <template #header>
      <div class="row-between">
        <span class="panel-title">{{ t('debtors') }}</span>
        <div class="toolbar">
          <div class="toolbar-group toolbar-main-group">
            <UiButtonIcon
              :icon="Refresh"
              :loading="debtorStore.loading"
              @click="debtorStore.loadDebtors()"
              class="icon-action-btn"
              :aria-label="t('refresh')"
              :title="t('refresh')"
            />
            <UiButtonIcon
              :icon="Check"
              :loading="debtorStore.saving"
              @click="closeSelectedDebtors()"
              class="icon-action-btn"
              :aria-label="t('closeSelected')"
              :title="t('closeSelected')"
            />
            <UiButtonIcon
              :icon="Delete"
              type="danger"
              plain
              :loading="debtorStore.saving"
              @click="deleteClosedSelectedDebtors()"
              class="icon-action-btn"
              :aria-label="t('deleteClosedSelected')"
              :title="t('deleteClosedSelected')"
            />
          </div>
          <div class="toolbar-group toolbar-group-secondary">
            <UiButtonIcon
              :icon="Plus"
              type="primary"
              @click="createDialogOpen = true"
              class="icon-action-btn"
              :aria-label="t('add')"
              :title="t('add')"
            />
          </div>
        </div>
      </div>
    </template>

    <UiAlert
      v-if="debtorStore.error"
      :title="debtorStore.error"
      type="error"
      show-icon
      :closable="false"
      class="mb-16"
    />

    <el-skeleton :loading="debtorStore.loading" animated>
      <template #template>
        <div class="debtors-skeleton">
          <el-skeleton-item variant="text" class="debtors-skeleton__line debtors-skeleton__line-short" />
          <el-skeleton-item variant="rect" class="debtors-skeleton__filters" />
          <el-skeleton-item variant="rect" class="debtors-skeleton__table" />
        </div>
      </template>
      <template #default>
        <div class="filters">
          <div class="filters-header">
            <UiButtonTextIcon
              :icon="filtersCollapsed ? ArrowDown : ArrowUp"
              :label="filtersCollapsed ? t('showFilters') : t('hideFilters')"
              link
              @click="filtersCollapsed = !filtersCollapsed"
            />
          </div>

          <el-collapse-transition>
            <div v-show="!filtersCollapsed || isDesktop" class="filters-body">
              <div class="search-status-row">
                <UiInputText
                  v-model="searchQuery"
                  clearable
                  :placeholder="t('searchDebtor')"
                  class="search-input"
                />
                <div class="status-chips">
                  <el-check-tag
                    v-for="option in statusOptions"
                    :key="option.value"
                    :checked="selectedStatuses.includes(option.value)"
                    @change="onStatusTagChange(option.value, $event)"
                  >
                    {{ option.label }}
                  </el-check-tag>
                </div>
              </div>
              <div class="sort-row">
                <UiSelect v-model="sortField" class="sort-select">
                  <el-option
                    v-for="option in sortOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </UiSelect>
                <UiSelect v-model="sortOrder" class="order-select">
                  <el-option :label="t('ascending')" value="asc" />
                  <el-option :label="t('descending')" value="desc" />
                </UiSelect>
                <UiSelect v-model="pageSize" class="page-size-select">
                  <el-option :label="`5 ${t('rowsPerPage')}`" :value="5" />
                  <el-option :label="`8 ${t('rowsPerPage')}`" :value="8" />
                  <el-option :label="`12 ${t('rowsPerPage')}`" :value="12" />
                  <el-option :label="`20 ${t('rowsPerPage')}`" :value="20" />
                </UiSelect>
                <UiButtonText :label="t('clearFilters')" @click="clearFilters" />
              </div>
            </div>
          </el-collapse-transition>
        </div>
        <el-empty v-if="totalItems === 0" :description="t('noDebtors')" />
        <template v-else>
          <div v-if="!isDesktop" class="mobile-list">
            <UiCard v-for="item in paginatedDebtors" :key="item.id" class="debtor-item" shadow="hover">
              <div class="mobile-select-row">
                <el-checkbox
                  :model-value="selectedIds.includes(item.id)"
                  :label="t('selectDebtor')"
                  @change="onMobileSelectionToggle(item.id, $event)"
                />
              </div>
              <div class="debtor-head">
                <strong>{{ item.name }}</strong>
                <UiStatusTag :status="item.status">
                  {{ statusLabel(item.status) }}
                </UiStatusTag>
              </div>
              <div class="debtor-metrics">
                <span>{{ t('incurredDate') }}: {{ item.incurredDate }}</span>
                <span>{{ t('principal') }}: {{ formatRub(item.principal) }}</span>
                <span>{{ t('dailyRateDecimal') }}: {{ formatPercent(item.dailyRate) }}</span>
                <span>{{ t('interestDue') }}: {{ formatRub(item.interestDue) }}</span>
                <span>{{ t('totalDue') }}: {{ formatRub(item.totalDue) }}</span>
              </div>
              <UiButtonTextIcon :icon="View" :label="t('open')" link type="primary" @click="viewDebtor(item.id)" />
            </UiCard>
          </div>

          <div v-else class="desktop-table">
            <UiTable
              ref="debtorsTableRef"
              :data="paginatedDebtors"
              stripe
              border
              row-key="id"
              @selection-change="onTableSelectionChange"
            >
              <UiTableColumn
                type="selection"
                width="52"
                :reserve-selection="true"
                align="center"
                header-align="center"
              />
              <UiTableColumn prop="name" :label="t('debtorName')" min-width="220" />
              <UiTableColumn prop="incurredDate" :label="t('incurredDate')" min-width="150" />
              <UiTableColumn prop="principal" :label="t('principal')" min-width="130">
                <template #default="{ row }">{{ formatRub(row.principal) }}</template>
              </UiTableColumn>
              <UiTableColumn prop="dailyRate" :label="t('dailyRateDecimal')" min-width="120">
                <template #default="{ row }">{{ formatPercent(row.dailyRate) }}</template>
              </UiTableColumn>
              <UiTableColumn prop="interestDue" :label="t('interestDue')" min-width="140">
                <template #default="{ row }">{{ formatRub(row.interestDue) }}</template>
              </UiTableColumn>
              <UiTableColumn prop="totalDue" :label="t('totalDue')" min-width="140">
                <template #default="{ row }">{{ formatRub(row.totalDue) }}</template>
              </UiTableColumn>
              <UiTableColumn prop="status" :label="t('status')" min-width="120">
                <template #default="{ row }">
                  <UiStatusTag :status="row.status">
                    {{ statusLabel(row.status) }}
                  </UiStatusTag>
                </template>
              </UiTableColumn>
              <UiTableColumn
                label=""
                width="56"
                align="center"
                header-align="center"
                class-name="action-col"
                header-class-name="action-col-header"
              >
                <template #default="{ row }">
                  <UiButtonIcon
                    :icon="View"
                    plain
                    type="primary"
                    @click="viewDebtor(row.id)"
                    :aria-label="t('open')"
                    :title="t('open')"
                    class="icon-only-action icon-only-action-bordered"
                  />
                </template>
              </UiTableColumn>
            </UiTable>
          </div>

          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="totalItems"
            layout="prev, pager, next"
            class="pagination"
          />
        </template>
      </template>
    </el-skeleton>
  </UiCard>

  <el-dialog v-model="createDialogOpen" :title="t('newDebtor')" :width="createDialogWidth">
    <el-form ref="debtorFormRef" :model="debtorForm" :rules="rules" label-position="top">
      <el-form-item :label="t('debtorName')" prop="name">
        <UiInputText v-model="debtorForm.name" :placeholder="t('debtorNamePlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('incurredDate')" prop="incurredDate">
        <UiInputDate
          v-model="debtorForm.incurredDate"
          type="date"
          value-format="YYYY-MM-DD"
          class="full-width"
          :placeholder="t('selectDate')"
        />
      </el-form-item>
      <el-form-item :label="t('principal')" prop="principal">
        <UiInputNumber v-model="debtorForm.principal" :min="0" :step="100" class="full-width" />
      </el-form-item>
      <el-form-item :label="t('dailyRateDecimal')" prop="dailyRate">
        <UiInputNumber
          v-model="debtorForm.dailyRate"
          :min="0"
          :step="0.0001"
          :precision="6"
          class="full-width"
        />
      </el-form-item>
      <el-form-item :label="t('startDate')" prop="startDate">
        <UiInputDate
          v-model="debtorForm.startDate"
          type="date"
          value-format="YYYY-MM-DD"
          class="full-width"
          :placeholder="t('selectDate')"
        />
      </el-form-item>
      <el-form-item :label="t('status')">
        <UiSelect v-model="debtorForm.status" class="full-width">
          <el-option :label="t('active')" value="active" />
          <el-option :label="t('inDispute')" value="in_dispute" />
          <el-option :label="t('settled')" value="settled" />
        </UiSelect>
      </el-form-item>
    </el-form>

    <template #footer>
      <UiButtonTextIcon :icon="Close" :label="t('cancel')" @click="createDialogOpen = false" />
      <UiButtonTextIcon
        :icon="Check"
        :label="t('create')"
        type="primary"
        :loading="debtorStore.saving"
        @click="submitCreateDebtor()"
      />
    </template>
  </el-dialog>
</template>

<style scoped src="@/styles/views/debtors-view.css"></style>
