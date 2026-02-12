import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useAppI18n } from '../i18n'
import {
  addDebtorPayment,
  closeDebtor,
  createDebtor,
  deleteDebtor,
  deleteDebtorPayment,
  getDebtorById,
  listDebtors,
} from '../services/debtorApi'
import type {
  AddPaymentPayload,
  CreateDebtorPayload,
  DebtorDetails,
  DebtorSummary,
} from '../types/debtor'

export const useDebtorStore = defineStore('debtors', () => {
  const debtors = ref<DebtorSummary[]>([])
  const currentDebtor = ref<DebtorDetails | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function loadDebtors(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      debtors.value = await listDebtors()
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function loadDebtor(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      currentDebtor.value = await getDebtorById(id)
      upsertDebtorSummary(currentDebtor.value)
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function addDebtor(payload: CreateDebtorPayload): Promise<void> {
    saving.value = true
    error.value = null
    try {
      const created = await createDebtor(payload)
      currentDebtor.value = created
      upsertDebtorSummary(created)
    } catch (err) {
      error.value = extractErrorMessage(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  async function addPayment(debtorId: string, payload: AddPaymentPayload): Promise<void> {
    saving.value = true
    error.value = null
    try {
      const updated = await addDebtorPayment(debtorId, payload)
      currentDebtor.value = updated
      upsertDebtorSummary(updated)
    } catch (err) {
      error.value = extractErrorMessage(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  async function removePayment(debtorId: string, paymentId: string): Promise<void> {
    saving.value = true
    error.value = null
    try {
      const updated = await deleteDebtorPayment(debtorId, paymentId)
      currentDebtor.value = updated
      upsertDebtorSummary(updated)
    } catch (err) {
      error.value = extractErrorMessage(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  async function closeDebtors(debtorIds: string[]): Promise<void> {
    saving.value = true
    error.value = null
    try {
      for (const debtorId of debtorIds) {
        const updated = await closeDebtor(debtorId)
        upsertDebtorSummary(updated)
        if (currentDebtor.value?.id === debtorId) {
          currentDebtor.value = updated
        }
      }
    } catch (err) {
      error.value = extractErrorMessage(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteDebtors(debtorIds: string[]): Promise<void> {
    saving.value = true
    error.value = null
    try {
      for (const debtorId of debtorIds) {
        await deleteDebtor(debtorId)
        debtors.value = debtors.value.filter((item) => item.id !== debtorId)
        if (currentDebtor.value?.id === debtorId) {
          currentDebtor.value = null
        }
      }
    } catch (err) {
      error.value = extractErrorMessage(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  function upsertDebtorSummary(debtor: DebtorDetails): void {
    const summary: DebtorSummary = {
      id: debtor.id,
      name: debtor.name,
      incurredDate: debtor.incurredDate,
      principal: debtor.principal,
      dailyRate: debtor.dailyRate,
      startDate: debtor.startDate,
      status: debtor.status,
      interestDue: debtor.interestDue,
      totalDue: debtor.totalDue,
    }

    const index = debtors.value.findIndex((item) => item.id === summary.id)

    if (index < 0) {
      debtors.value.unshift(summary)
    } else {
      debtors.value[index] = summary
    }
  }

  return {
    debtors,
    currentDebtor,
    loading,
    saving,
    error,
    loadDebtors,
    loadDebtor,
    addDebtor,
    addPayment,
    removePayment,
    closeDebtors,
    deleteDebtors,
  }
})

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  const { t } = useAppI18n()
  return t('requestError')
}
