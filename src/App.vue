<script setup lang="ts">
  import { Menu, MoonNight, Sunny, Switch, User } from '@element-plus/icons-vue'
  import en from 'element-plus/es/locale/lang/en'
  import ja from 'element-plus/es/locale/lang/ja'
  import ko from 'element-plus/es/locale/lang/ko'
  import ru from 'element-plus/es/locale/lang/ru'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import UiButtonIcon from './components/buttons/UiButtonIcon.vue'
  import type { LanguagePreference } from './i18n'
  import { useAppI18n } from './i18n'
  import {
    readThemeMode as readStoredThemeMode,
    resolveThemeIsDark,
    writeThemeMode,
  } from './theme/preference'

  type ThemeMode = 'auto' | 'light' | 'dark'

  const route = useRoute()
  const router = useRouter()
  const mobileNavOpen = ref(false)
  const systemPrefersDark = ref(false)
  const themeMode = ref<ThemeMode>(readStoredThemeMode(localStorage))
  const isDark = computed<boolean>(() =>
    resolveThemeIsDark(themeMode.value, systemPrefersDark.value),
  )
  const {
    t,
    languagePreference,
    language,
    availableLanguagePreferences,
    setLanguagePreference,
    getLanguageOptionLabel,
  } = useAppI18n()
  let themeMediaQuery: MediaQueryList | null = null
  const onThemeChange = (event: MediaQueryListEvent): void => {
    systemPrefersDark.value = event.matches
    applyTheme(isDark.value)
  }

  const activeMenu = computed(() => {
    if (route.path.startsWith('/debtors')) return '/debtors'
    return route.path
  })

  function onMenuSelect(index: string): void {
    router.push(index)
    mobileNavOpen.value = false
  }

  const currentElementLocale = computed(() => {
    if (language.value === 'ru') return ru
    if (language.value === 'ko') return ko
    if (language.value === 'ja') return ja
    return en
  })

  function onSelectLanguage(selectedLanguage: string): void {
    setLanguagePreference(selectedLanguage as LanguagePreference)
  }

  function applyTheme(enabled: boolean): void {
    document.documentElement.classList.toggle('dark', enabled)
  }

  function setThemeMode(mode: string): void {
    if (mode !== 'auto' && mode !== 'light' && mode !== 'dark') return
    themeMode.value = mode
    writeThemeMode(localStorage, mode)
    applyTheme(isDark.value)
  }

  onMounted(() => {
    themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = themeMediaQuery.matches
    applyTheme(isDark.value)
    themeMediaQuery.addEventListener('change', onThemeChange)
    document.documentElement.lang = language.value
  })

  onUnmounted(() => {
    themeMediaQuery?.removeEventListener('change', onThemeChange)
    themeMediaQuery = null
  })

  watch(language, (currentLanguage) => {
    document.documentElement.lang = currentLanguage
  })
</script>

<template>
  <el-config-provider :locale="currentElementLocale">
    <el-container class="app-layout">
      <el-aside width="220px" class="app-aside">
        <div class="brand-row">
          <div class="brand">{{ t('brand') }}</div>
          <div class="brand-actions">
            <el-dropdown trigger="click" @command="onSelectLanguage">
              <UiButtonIcon
                :icon="Switch"
                text
                class="icon-only-btn"
                :aria-label="t('language')"
                :title="`${t('language')}: ${getLanguageOptionLabel(languagePreference)}`"
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="code in availableLanguagePreferences"
                    :key="code"
                    :command="code"
                    :disabled="code === languagePreference"
                  >
                    {{ getLanguageOptionLabel(code) }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown trigger="click" @command="setThemeMode">
              <UiButtonIcon
                :icon="isDark ? Sunny : MoonNight"
                text
                class="icon-only-btn"
                :aria-label="t('theme')"
                :title="`${t('theme')}: ${themeMode}`"
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="auto" :disabled="themeMode === 'auto'">{{
                    t('themeAuto')
                  }}</el-dropdown-item>
                  <el-dropdown-item command="light" :disabled="themeMode === 'light'">
                    {{ t('themeLight') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="dark" :disabled="themeMode === 'dark'">{{
                    t('themeDark')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <el-menu :default-active="activeMenu" @select="onMenuSelect" class="aside-menu">
          <el-menu-item index="/debtors">
            <el-icon><User /></el-icon>
            <span>{{ t('menuDebtors') }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="app-header">
          <UiButtonIcon
            :icon="Menu"
            class="mobile-nav-btn"
            text
            :aria-label="t('menuDebtors')"
            @click="mobileNavOpen = true"
          />
          <div class="header-title">{{ t('workspace') }}</div>
        </el-header>
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <el-drawer v-model="mobileNavOpen" direction="ltr" size="260px" :with-header="false">
      <div class="brand-row">
        <div class="brand">{{ t('brand') }}</div>
        <div class="brand-actions">
          <el-dropdown trigger="click" @command="onSelectLanguage">
            <UiButtonIcon
              :icon="Switch"
              text
              class="icon-only-btn"
              :aria-label="t('language')"
              :title="`${t('language')}: ${getLanguageOptionLabel(languagePreference)}`"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="code in availableLanguagePreferences"
                  :key="code"
                  :command="code"
                  :disabled="code === languagePreference"
                >
                  {{ getLanguageOptionLabel(code) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown trigger="click" @command="setThemeMode">
            <UiButtonIcon
              :icon="isDark ? Sunny : MoonNight"
              text
              class="icon-only-btn"
              :aria-label="t('theme')"
              :title="`${t('theme')}: ${themeMode}`"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="auto" :disabled="themeMode === 'auto'">{{
                  t('themeAuto')
                }}</el-dropdown-item>
                <el-dropdown-item command="light" :disabled="themeMode === 'light'">{{
                  t('themeLight')
                }}</el-dropdown-item>
                <el-dropdown-item command="dark" :disabled="themeMode === 'dark'">{{
                  t('themeDark')
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <el-menu :default-active="activeMenu" @select="onMenuSelect" class="mobile-menu">
        <el-menu-item index="/debtors">
          <el-icon><User /></el-icon>
          <span>{{ t('menuDebtors') }}</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </el-config-provider>
</template>

<style scoped src="@/styles/app.css"></style>
