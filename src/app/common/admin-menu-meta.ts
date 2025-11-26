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
    label: 'GENEL',
    isTitle: true,
  },
  {
    key: 'dashboards',
    icon: 'solar:widget-5-bold-duotone',
    label: 'Gösterge Paneli',
    link:'/admin/dashboard',
  },
  {
    key: 'settings',
    icon: 'solar:settings-bold-duotone',
    label: 'Ayarlar',
    link: '/admin/settings',
  },
  {
    key: 'users',
    label: 'Kullanıcılar',
    isTitle: true,
  },
  {
    key: 'profile',
    icon: 'solar:chat-square-like-bold-duotone',
    label: 'Profil',
    link: '/admin/profile',
  },
  // {
  //   key: 'users',
  //   icon: 'solar:user-speak-rounded-bold-duotone',
  //   label: 'Kullanıcı Yönetimi',
  //   link: '/admin/users',
  // },
  {
    key: 'user',
    icon: 'solar:user-speak-rounded-bold-duotone',
    label: 'Kullanıcılar',
    collapsed: true,
    subMenu: [
      {
        key: 'user-list',
        label: 'Kullanıcı Listesi',
        link: '/admin/users/list',
        parentKey: 'user',
      },
      {
        key: 'user-create',
        label: 'Kullanıcı Ekle',
        link: '/admin/users/add',
        parentKey: 'user',
      },
    ],
  },
  {
    key: 'role',
    icon: 'solar:checklist-minimalistic-bold-duotone',
    label: 'Roller',
    collapsed: true,
    subMenu: [
      {
        key: 'role-list',
        label: 'Rol Listesi',
        link: '/admin/roles/list',
        parentKey: 'role',
      },
      {
        key: 'role-create',
        label: 'Rol Ekle',
        link: '/admin/roles/add',
        parentKey: 'role',
      },
    ],
  },
  {
    key: 'customer',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    label: 'Müşteriler',
    collapsed: true,
    subMenu: [
      {
        key: 'customer-list',
        label: 'Müşteri Listesi',
        link: '/admin/customers/list',
        parentKey: 'customer',
      },
      {
        key: 'customer-add',
        label: 'Müşteri Ekle',
        link: '/admin/customers/add',
        parentKey: 'customer',
      }
    ],
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
    link: '/admin/apps/todo',
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
    link: '/admin/help-center',
  },
  {
    key: 'faqs',
    icon: 'solar:question-circle-bold-duotone',
    label: 'SSS',
    link: '/admin/faqs',
  }
]
