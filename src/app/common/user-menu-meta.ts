export type MenuItem = {
  key?: string
  label?: string
  icon?: string
  link?: string
  collapsed?: boolean
  subMenu?: any
  isTitle?: boolean
  badge?: any
  parentKey?: string
  disabled?: boolean
}

export const MENU: MenuItem[] = [
  {
    key: 'general',
    label: 'Genel',
    isTitle: true,
  },
  {
    key: 'dashboards',
    icon: 'solar:widget-5-bold-duotone',
    label: 'Dashboard',
    link:'/user/dashboard',
  },
  {
    key: 'settings',
    icon: 'solar:settings-bold-duotone',
    label: 'Çarpan Ayarları',
    link: '/user/multiplier-settings',
  },
  {
    key: 'users',
    label: 'Kullanıcı Ayarları',
    isTitle: true,
  },
  {
    key: 'profile',
    icon: 'solar:chat-square-like-bold-duotone',
    label: 'Profilim',
    link: '/user/profile',
  },
  {
    key: 'other-apps',
    label: 'Diğer Uygulamalar',
    isTitle: true,
  },
  {
    key: 'todo',
    icon: 'solar:checklist-bold-duotone',
    label: 'Todo',
    link: '/user/apps/todo',
  },
  {
    key: 'support',
    label: 'Destek',
    isTitle: true,
  },
  {
    key: 'help-center',
    icon: 'solar:help-bold-duotone',
    label: 'Yardım Merkezi',
    link: '/user/help-center',
  },
  {
    key: 'faqs',
    icon: 'solar:question-circle-bold-duotone',
    label: 'SSS',
    link: '/user/faqs',
  }
]
