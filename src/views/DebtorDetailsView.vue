<script setup lang="ts">
  import { ArrowLeft, Delete, Money, Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import UiButtonIcon from '@/components/buttons/UiButtonIcon.vue'
  import UiButtonText from '@/components/buttons/UiButtonText.vue'
  import UiButtonTextIcon from '@/components/buttons/UiButtonTextIcon.vue'
  import UiAlert from '@/components/common/UiAlert.vue'
  import UiCard from '@/components/common/UiCard.vue'
  import UiStatCard from '@/components/common/UiStatCard.vue'
  import UiInputDate from '@/components/inputs/UiInputDate.vue'
  import UiInputNumber from '@/components/inputs/UiInputNumber.vue'
  import UiTable from '@/components/tables/UiTable.vue'
  import UiTableColumn from '@/components/tables/UiTableColumn.vue'
  import { useAppI18n } from '@/i18n'
  import { useDebtorStore } from '@/stores/debtors'
  import { formatRub } from '@/utils/format'

  type PaymentFormModel = {
    amount: number
    date: string
  }

  const route = useRoute()
  const router = useRouter()
  const debtorStore = useDebtorStore()
  const { t } = useAppI18n()

  const paymentFormRef = ref<FormInstance>()
  const paymentForm = reactive<PaymentFormModel>({
    amount: 100,
    date: new Date().toISOString().slice(0, 10),
  })

  const paymentRules = computed<FormRules<PaymentFormModel>>(() => ({
    amount: [{ required: true, message: t('validationAmount'), trigger: 'blur' }],
    date: [{ required: true, message: t('validationDate'), trigger: 'change' }],
  }))

  const debtorId = computed(() => String(route.params.id ?? ''))
  const debtor = computed(() => debtorStore.currentDebtor)

  onMounted(() => {
    if (debtorId.value) {
      void debtorStore.loadDebtor(debtorId.value)
    }
  })

  watch(debtorId, (id) => {
    if (id) {
      void debtorStore.loadDebtor(id)
    }
  })

  watch(
    () => debtor.value?.status,
    (status) => {
      if (status === 'settled') {
        ElMessage.success(t('debtorSettledRemoved'))
        router.push('/debtors')
      }
    },
  )

  async function submitPayment(): Promise<void> {
    if (!debtor.value || !paymentFormRef.value) return

    const valid = await paymentFormRef.value.validate().catch(() => false)
    if (!valid) return

    try {
      await debtorStore.addPayment(debtor.value.id, {
        amount: Number(paymentForm.amount),
        date: paymentForm.date,
      })
      ElMessage.success(t('paymentAdded'))
      paymentForm.amount = 100
      paymentForm.date = new Date().toISOString().slice(0, 10)
    } catch {
      ElMessage.error(debtorStore.error ?? t('paymentFailed'))
    }
  }

  async function onDeletePayment(paymentId: string): Promise<void> {
    if (!debtor.value) return
    try {
      await debtorStore.removePayment(debtor.value.id, paymentId)
      ElMessage.success(t('paymentDeleted'))
    } catch {
      ElMessage.error(debtorStore.error ?? t('paymentDeleteFailed'))
    }
  }
</script>

<template>
  <div class="debtor-details-view">
    <UiButtonTextIcon
      :icon="ArrowLeft"
      :label="t('backToDebtors')"
      link
      @click="router.push('/debtors')"
      class="mb-8"
    />

    <el-skeleton :loading="debtorStore.loading" animated>
      <template #template>
        <el-skeleton-item variant="h1" style="width: 50%; margin-top: 16px" />
        <el-skeleton-item variant="rect" style="height: 220px; margin-top: 12px" />
      </template>

      <template #default>
        <UiAlert
          v-if="debtorStore.error"
          :title="debtorStore.error"
          type="error"
          show-icon
          :closable="false"
          class="mb-16"
        />

        <template v-if="debtor">
          <h2 class="debtor-title">{{ debtor.name }}</h2>
          <div class="incurred-date">{{ t('incurredDate') }}: {{ debtor.incurredDate }}</div>

          <el-row :gutter="12" class="mb-12">
            <el-col :md="8" :sm="12" :xs="24">
              <UiStatCard
                class="stat-card"
                :label="t('principalRemaining')"
                :value="formatRub(debtor.snapshot.principalRemaining)"
              />
            </el-col>
            <el-col :md="8" :sm="12" :xs="24">
              <UiStatCard
                class="stat-card"
                :label="t('interestRemaining')"
                :value="formatRub(debtor.snapshot.interestRemaining)"
              />
            </el-col>
            <el-col :md="8" :sm="24" :xs="24">
              <UiStatCard
                class="stat-card"
                :label="t('totalDebt')"
                :value="formatRub(debtor.snapshot.totalDebt)"
              />
            </el-col>
          </el-row>

          <div class="payments-layout">
            <UiCard class="section-card payments-card">
              <template #header>
                <span class="section-title"
                  ><el-icon><Money /></el-icon>{{ t('payments') }}</span
                >
              </template>
              <div class="payments-mobile-list">
                <template v-if="debtor.payments.length > 0">
                  <UiCard
                    v-for="payment in debtor.payments"
                    :key="payment.id"
                    class="payment-item-card"
                    shadow="hover"
                  >
                    <div class="payment-item-row">
                      <span class="payment-item-label">{{ t('date') }}</span>
                      <span>{{ payment.date }}</span>
                    </div>
                    <div class="payment-item-row">
                      <span class="payment-item-label">{{ t('amount') }}</span>
                      <span>{{ formatRub(payment.amount) }}</span>
                    </div>
                    <div class="payment-item-actions">
                      <el-popconfirm
                        :title="t('confirmDeletePayment')"
                        @confirm="onDeletePayment(payment.id)"
                      >
                        <template #reference>
                          <UiButtonIcon
                            :icon="Delete"
                            plain
                            type="danger"
                            :aria-label="t('deletePayment')"
                            :title="t('deletePayment')"
                            class="icon-only-action icon-only-action-bordered"
                          />
                        </template>
                      </el-popconfirm>
                    </div>
                  </UiCard>
                </template>
                <el-empty v-else :description="t('payments')" />
              </div>

              <div class="payments-desktop-table">
                <UiTable :data="debtor.payments" stripe border class="payments-table">
                  <UiTableColumn prop="date" :label="t('date')" min-width="140" />
                  <UiTableColumn prop="amount" :label="t('amount')" min-width="120">
                    <template #default="{ row }">{{ formatRub(row.amount) }}</template>
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
                      <el-popconfirm
                        :title="t('confirmDeletePayment')"
                        @confirm="onDeletePayment(row.id)"
                      >
                        <template #reference>
                          <UiButtonIcon
                            :icon="Delete"
                            plain
                            type="danger"
                            :aria-label="t('deletePayment')"
                            :title="t('deletePayment')"
                            class="icon-only-action icon-only-action-bordered"
                          />
                        </template>
                      </el-popconfirm>
                    </template>
                  </UiTableColumn>
                </UiTable>
              </div>
            </UiCard>

            <UiCard class="section-card payment-card">
              <template #header>
                <span class="section-title"
                  ><el-icon><Plus /></el-icon>{{ t('addPayment') }}</span
                >
              </template>
              <el-form
                ref="paymentFormRef"
                :model="paymentForm"
                :rules="paymentRules"
                label-position="top"
                class="payment-form"
              >
                <el-form-item :label="t('amount')" prop="amount">
                  <UiInputNumber
                    v-model="paymentForm.amount"
                    :min="0"
                    :step="50"
                    class="full-width"
                  />
                </el-form-item>
                <el-form-item :label="t('date')" prop="date">
                  <UiInputDate
                    v-model="paymentForm.date"
                    type="date"
                    value-format="YYYY-MM-DD"
                    class="full-width"
                    :placeholder="t('selectDate')"
                  />
                </el-form-item>
                <UiButtonText
                  :label="t('addPayment')"
                  type="primary"
                  :loading="debtorStore.saving"
                  @click="submitPayment()"
                  class="payment-submit-btn"
                />
              </el-form>
            </UiCard>
          </div>
        </template>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped src="@/styles/views/debtor-details-view.css"></style>
