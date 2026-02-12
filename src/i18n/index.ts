import { computed, ref } from 'vue'

export type AppLanguage = 'en' | 'ru' | 'ko' | 'ja'
export type LanguagePreference = AppLanguage | 'auto'

type MessageKey =
  | 'brand'
  | 'menuDebtors'
  | 'workspace'
  | 'refresh'
  | 'add'
  | 'delete'
  | 'close'
  | 'open'
  | 'view'
  | 'cancel'
  | 'create'
  | 'debtors'
  | 'newDebtor'
  | 'debtorName'
  | 'debtorNamePlaceholder'
  | 'incurredDate'
  | 'principal'
  | 'dailyRateDecimal'
  | 'startDate'
  | 'status'
  | 'all'
  | 'searchDebtor'
  | 'sortBy'
  | 'showFilters'
  | 'hideFilters'
  | 'sortOrder'
  | 'sortName'
  | 'sortIncurredDate'
  | 'sortPrincipal'
  | 'sortTotalDue'
  | 'ascending'
  | 'descending'
  | 'clearFilters'
  | 'noDebtors'
  | 'rowsPerPage'
  | 'closeSelected'
  | 'deleteClosedSelected'
  | 'selectDebtor'
  | 'selectionRequired'
  | 'closedSelectionRequired'
  | 'bulkCloseSuccess'
  | 'bulkDeleteSuccess'
  | 'closeFailed'
  | 'deleteFailed'
  | 'confirmDeleteClosed'
  | 'active'
  | 'inDispute'
  | 'settled'
  | 'interestDue'
  | 'totalDue'
  | 'backToDebtors'
  | 'principalRemaining'
  | 'interestRemaining'
  | 'totalDebt'
  | 'payments'
  | 'addPayment'
  | 'amount'
  | 'date'
  | 'savePayment'
  | 'deletePayment'
  | 'confirmDeletePayment'
  | 'createdSuccess'
  | 'createFailed'
  | 'paymentAdded'
  | 'paymentDeleted'
  | 'paymentFailed'
  | 'paymentDeleteFailed'
  | 'debtorSettledRemoved'
  | 'validationName'
  | 'validationPrincipal'
  | 'validationDailyRate'
  | 'validationStartDate'
  | 'validationIncurredDate'
  | 'validationAmount'
  | 'validationDate'
  | 'selectDate'
  | 'langEn'
  | 'langRu'
  | 'langKo'
  | 'langJa'
  | 'langAuto'
  | 'language'
  | 'theme'
  | 'themeAuto'
  | 'themeLight'
  | 'themeDark'
  | 'requestError'

const messages: Record<AppLanguage, Record<MessageKey, string>> = {
  en: {
    brand: 'Debt CRM',
    menuDebtors: 'Debtors',
    workspace: 'Workspace',
    refresh: 'Refresh',
    add: 'Add',
    delete: 'Delete',
    close: 'Close',
    open: 'Open',
    view: 'View',
    cancel: 'Cancel',
    create: 'Create',
    debtors: 'Debtors',
    newDebtor: 'New Debtor',
    debtorName: 'Name/Company',
    debtorNamePlaceholder: 'Enter debtor name',
    incurredDate: 'Debt Incurred Date',
    principal: 'Principal',
    dailyRateDecimal: 'Daily Rate (decimal)',
    startDate: 'Start Date',
    status: 'Status',
    all: 'All',
    searchDebtor: 'Search debtor',
    sortBy: 'Sort by',
    showFilters: 'Show filters',
    hideFilters: 'Hide filters',
    sortOrder: 'Order',
    sortName: 'Name',
    sortIncurredDate: 'Incurred Date',
    sortPrincipal: 'Principal',
    sortTotalDue: 'Total Due',
    ascending: 'Ascending',
    descending: 'Descending',
    clearFilters: 'Clear Filters',
    noDebtors: 'No debtors found',
    rowsPerPage: 'Rows per page',
    closeSelected: 'Close Selected',
    deleteClosedSelected: 'Delete Closed',
    selectDebtor: 'Select debtor',
    selectionRequired: 'Select at least one debtor',
    closedSelectionRequired: 'Select at least one closed debtor',
    bulkCloseSuccess: 'Selected debtors closed',
    bulkDeleteSuccess: 'Closed debtors removed',
    closeFailed: 'Could not close selected debtors',
    deleteFailed: 'Could not delete closed debtors',
    confirmDeleteClosed: 'Delete selected closed debtors permanently?',
    active: 'Active',
    inDispute: 'In Dispute',
    settled: 'Settled',
    interestDue: 'Interest Due',
    totalDue: 'Total Due',
    backToDebtors: 'Back to debtors',
    principalRemaining: 'Principal Remaining',
    interestRemaining: 'Interest Remaining',
    totalDebt: 'Total Debt',
    payments: 'Payments',
    addPayment: 'Add Payment',
    amount: 'Amount',
    date: 'Date',
    savePayment: 'Add Payment',
    deletePayment: 'Delete Payment',
    confirmDeletePayment: 'Delete this payment?',
    createdSuccess: 'Debtor created',
    createFailed: 'Could not create debtor',
    paymentAdded: 'Payment added',
    paymentDeleted: 'Payment deleted',
    paymentFailed: 'Could not add payment',
    paymentDeleteFailed: 'Could not delete payment',
    debtorSettledRemoved: 'Debt fully paid. Debtor removed from list.',
    validationName: 'Enter debtor name',
    validationPrincipal: 'Enter principal amount',
    validationDailyRate: 'Enter daily rate',
    validationStartDate: 'Select start date',
    validationIncurredDate: 'Select incurred date',
    validationAmount: 'Enter amount',
    validationDate: 'Select date',
    selectDate: 'Select date',
    langEn: 'English',
    langRu: 'Russian',
    langKo: 'Korean',
    langJa: 'Japanese',
    langAuto: 'Auto',
    language: 'Language',
    theme: 'Theme',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    requestError: 'Request failed',
  },
  ru: {
    brand: 'CRM по долгам',
    menuDebtors: 'Должники',
    workspace: 'Рабочее место',
    refresh: 'Обновить',
    add: 'Добавить',
    delete: 'Удалить',
    close: 'Закрыть',
    open: 'Открыть',
    view: 'Просмотр',
    cancel: 'Отмена',
    create: 'Создать',
    debtors: 'Должники',
    newDebtor: 'Новый должник',
    debtorName: 'Имя/Компания',
    debtorNamePlaceholder: 'Введите имя должника',
    incurredDate: 'Дата возникновения долга',
    principal: 'Основной долг',
    dailyRateDecimal: 'Дневная ставка (дробью)',
    startDate: 'Дата начала',
    status: 'Статус',
    all: 'Все',
    searchDebtor: 'Поиск должника',
    sortBy: 'Сортировать по',
    showFilters: 'Показать фильтры',
    hideFilters: 'Скрыть фильтры',
    sortOrder: 'Порядок',
    sortName: 'Имя',
    sortIncurredDate: 'Дата возникновения',
    sortPrincipal: 'Основной долг',
    sortTotalDue: 'Итого',
    ascending: 'По возрастанию',
    descending: 'По убыванию',
    clearFilters: 'Сбросить фильтры',
    noDebtors: 'Должники не найдены',
    rowsPerPage: 'Строк на странице',
    closeSelected: 'Закрыть выбранные',
    deleteClosedSelected: 'Удалить закрытых',
    selectDebtor: 'Выбрать должника',
    selectionRequired: 'Выберите хотя бы одного должника',
    closedSelectionRequired: 'Выберите хотя бы одного закрытого должника',
    bulkCloseSuccess: 'Выбранные должники закрыты',
    bulkDeleteSuccess: 'Закрытые должники удалены',
    closeFailed: 'Не удалось закрыть выбранных должников',
    deleteFailed: 'Не удалось удалить закрытых должников',
    confirmDeleteClosed: 'Удалить выбранных закрытых должников навсегда?',
    active: 'Активный',
    inDispute: 'Спор',
    settled: 'Закрыт',
    interestDue: 'Проценты',
    totalDue: 'Итого',
    backToDebtors: 'К списку должников',
    principalRemaining: 'Остаток основного долга',
    interestRemaining: 'Остаток процентов',
    totalDebt: 'Общий долг',
    payments: 'Платежи',
    addPayment: 'Добавить платеж',
    amount: 'Сумма',
    date: 'Дата',
    savePayment: 'Добавить платеж',
    deletePayment: 'Удалить платеж',
    confirmDeletePayment: 'Удалить этот платеж?',
    createdSuccess: 'Должник добавлен',
    createFailed: 'Не удалось добавить должника',
    paymentAdded: 'Платеж добавлен',
    paymentDeleted: 'Платеж удален',
    paymentFailed: 'Не удалось добавить платеж',
    paymentDeleteFailed: 'Не удалось удалить платеж',
    debtorSettledRemoved: 'Долг полностью погашен. Должник удален из списка.',
    validationName: 'Введите имя должника',
    validationPrincipal: 'Введите сумму долга',
    validationDailyRate: 'Введите дневную ставку',
    validationStartDate: 'Укажите дату начала',
    validationIncurredDate: 'Укажите дату возникновения долга',
    validationAmount: 'Введите сумму',
    validationDate: 'Укажите дату',
    selectDate: 'Выберите дату',
    langEn: 'Английский',
    langRu: 'Русский',
    langKo: 'Корейский',
    langJa: 'Японский',
    langAuto: 'Авто',
    language: 'Язык',
    theme: 'Тема',
    themeAuto: 'Авто',
    themeLight: 'Светлая',
    themeDark: 'Темная',
    requestError: 'Ошибка запроса',
  },
  ko: {
    brand: '부채 CRM',
    menuDebtors: '채무자',
    workspace: '작업 공간',
    refresh: '새로고침',
    add: '추가',
    delete: '삭제',
    close: '종료',
    open: '열기',
    view: '보기',
    cancel: '취소',
    create: '생성',
    debtors: '채무자',
    newDebtor: '새 채무자',
    debtorName: '이름/회사',
    debtorNamePlaceholder: '채무자 이름 입력',
    incurredDate: '채무 발생일',
    principal: '원금',
    dailyRateDecimal: '일 이율 (소수)',
    startDate: '시작일',
    status: '상태',
    all: '전체',
    searchDebtor: '채무자 검색',
    sortBy: '정렬 기준',
    showFilters: '필터 보기',
    hideFilters: '필터 숨기기',
    sortOrder: '정렬 순서',
    sortName: '이름',
    sortIncurredDate: '채무 발생일',
    sortPrincipal: '원금',
    sortTotalDue: '총액',
    ascending: '오름차순',
    descending: '내림차순',
    clearFilters: '필터 초기화',
    noDebtors: '채무자가 없습니다',
    rowsPerPage: '페이지당 행 수',
    closeSelected: '선택 항목 종료',
    deleteClosedSelected: '종료 항목 삭제',
    selectDebtor: '채무자 선택',
    selectionRequired: '최소 한 명의 채무자를 선택하세요',
    closedSelectionRequired: '최소 한 명의 종료 채무자를 선택하세요',
    bulkCloseSuccess: '선택한 채무자를 종료했습니다',
    bulkDeleteSuccess: '종료된 채무자를 삭제했습니다',
    closeFailed: '선택한 채무자를 종료할 수 없습니다',
    deleteFailed: '종료된 채무자를 삭제할 수 없습니다',
    confirmDeleteClosed: '선택한 종료 채무자를 완전히 삭제할까요?',
    active: '활성',
    inDispute: '분쟁 중',
    settled: '정산 완료',
    interestDue: '이자',
    totalDue: '총액',
    backToDebtors: '채무자 목록으로',
    principalRemaining: '남은 원금',
    interestRemaining: '남은 이자',
    totalDebt: '총 부채',
    payments: '결제 내역',
    addPayment: '결제 추가',
    amount: '금액',
    date: '날짜',
    savePayment: '결제 추가',
    deletePayment: '결제 삭제',
    confirmDeletePayment: '이 결제를 삭제할까요?',
    createdSuccess: '채무자를 추가했습니다',
    createFailed: '채무자를 추가할 수 없습니다',
    paymentAdded: '결제를 추가했습니다',
    paymentDeleted: '결제를 삭제했습니다',
    paymentFailed: '결제를 추가할 수 없습니다',
    paymentDeleteFailed: '결제를 삭제할 수 없습니다',
    debtorSettledRemoved: '채무가 완납되어 목록에서 제거되었습니다.',
    validationName: '채무자 이름을 입력하세요',
    validationPrincipal: '원금을 입력하세요',
    validationDailyRate: '일 이율을 입력하세요',
    validationStartDate: '시작일을 선택하세요',
    validationIncurredDate: '채무 발생일을 선택하세요',
    validationAmount: '금액을 입력하세요',
    validationDate: '날짜를 선택하세요',
    selectDate: '날짜 선택',
    langEn: '영어',
    langRu: '러시아어',
    langKo: '한국어',
    langJa: '일본어',
    langAuto: '자동',
    language: '언어',
    theme: '테마',
    themeAuto: '자동',
    themeLight: '라이트',
    themeDark: '다크',
    requestError: '요청 실패',
  },
  ja: {
    brand: '債務CRM',
    menuDebtors: '債務者',
    workspace: 'ワークスペース',
    refresh: '更新',
    add: '追加',
    delete: '削除',
    close: 'クローズ',
    open: '開く',
    view: '表示',
    cancel: 'キャンセル',
    create: '作成',
    debtors: '債務者',
    newDebtor: '新しい債務者',
    debtorName: '氏名/会社',
    debtorNamePlaceholder: '債務者名を入力',
    incurredDate: '債務発生日',
    principal: '元本',
    dailyRateDecimal: '日利 (小数)',
    startDate: '開始日',
    status: 'ステータス',
    all: 'すべて',
    searchDebtor: '債務者を検索',
    sortBy: '並び替え',
    showFilters: 'フィルターを表示',
    hideFilters: 'フィルターを隠す',
    sortOrder: '順序',
    sortName: '名前',
    sortIncurredDate: '債務発生日',
    sortPrincipal: '元本',
    sortTotalDue: '合計',
    ascending: '昇順',
    descending: '降順',
    clearFilters: 'フィルターをクリア',
    noDebtors: '債務者が見つかりません',
    rowsPerPage: '1ページの件数',
    closeSelected: '選択をクローズ',
    deleteClosedSelected: 'クローズ済みを削除',
    selectDebtor: '債務者を選択',
    selectionRequired: '少なくとも1件選択してください',
    closedSelectionRequired: 'クローズ済み債務者を1件以上選択してください',
    bulkCloseSuccess: '選択した債務者をクローズしました',
    bulkDeleteSuccess: 'クローズ済み債務者を削除しました',
    closeFailed: '選択した債務者をクローズできません',
    deleteFailed: 'クローズ済み債務者を削除できません',
    confirmDeleteClosed: '選択したクローズ済み債務者を完全に削除しますか？',
    active: '進行中',
    inDispute: '係争中',
    settled: '完済',
    interestDue: '利息',
    totalDue: '合計',
    backToDebtors: '債務者一覧へ',
    principalRemaining: '元本残高',
    interestRemaining: '利息残高',
    totalDebt: '総債務',
    payments: '入金履歴',
    addPayment: '入金追加',
    amount: '金額',
    date: '日付',
    savePayment: '入金追加',
    deletePayment: '入金を削除',
    confirmDeletePayment: 'この入金を削除しますか？',
    createdSuccess: '債務者を追加しました',
    createFailed: '債務者を追加できません',
    paymentAdded: '入金を追加しました',
    paymentDeleted: '入金を削除しました',
    paymentFailed: '入金を追加できません',
    paymentDeleteFailed: '入金を削除できません',
    debtorSettledRemoved: '完済のため一覧から除外しました。',
    validationName: '債務者名を入力してください',
    validationPrincipal: '元本を入力してください',
    validationDailyRate: '日利を入力してください',
    validationStartDate: '開始日を選択してください',
    validationIncurredDate: '債務発生日を選択してください',
    validationAmount: '金額を入力してください',
    validationDate: '日付を選択してください',
    selectDate: '日付を選択',
    langEn: '英語',
    langRu: 'ロシア語',
    langKo: '韓国語',
    langJa: '日本語',
    langAuto: '自動',
    language: '言語',
    theme: 'テーマ',
    themeAuto: '自動',
    themeLight: 'ライト',
    themeDark: 'ダーク',
    requestError: 'リクエストに失敗しました',
  },
}

const browserLanguage = detectBrowserLanguage()
const storedLanguagePreference = localStorage.getItem('app-language') as LanguagePreference | null
const languagePreference = ref<LanguagePreference>(
  storedLanguagePreference && ['auto', 'en', 'ru', 'ko', 'ja'].includes(storedLanguagePreference)
    ? storedLanguagePreference
    : 'auto',
)
const currentLanguage = computed<AppLanguage>(() =>
  languagePreference.value === 'auto' ? browserLanguage : languagePreference.value,
)

const availableLanguagePreferences: LanguagePreference[] = ['auto', 'ru', 'ko', 'ja', 'en']

function detectBrowserLanguage(): AppLanguage {
  const language = navigator.language.toLowerCase()
  if (language.startsWith('ru')) return 'ru'
  if (language.startsWith('ko')) return 'ko'
  if (language.startsWith('ja')) return 'ja'
  return 'en'
}

function setLanguagePreference(preference: LanguagePreference): void {
  languagePreference.value = preference
  localStorage.setItem('app-language', preference)
}

function t(key: MessageKey): string {
  return messages[currentLanguage.value][key]
}

function getLanguageOptionLabel(preference: LanguagePreference): string {
  if (preference === 'auto') return messages[currentLanguage.value].langAuto
  if (preference === 'ru') return messages[currentLanguage.value].langRu
  if (preference === 'ko') return messages[currentLanguage.value].langKo
  if (preference === 'ja') return messages[currentLanguage.value].langJa
  return messages[currentLanguage.value].langEn
}

export function useAppI18n() {
  return {
    languagePreference,
    language: currentLanguage,
    availableLanguagePreferences,
    setLanguagePreference,
    t,
    getLanguageOptionLabel,
  }
}
