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
    link: '/user/dashboard',
  },
  {
    key: 'settings',
    icon: 'solar:maximize-broken',
    label: 'Ürün & Çarpan',
    link: '/user/multiplier-settings',
  },
 
  
   
  {
    key: 'category-settings',
    icon: 'solar:list-check-minimalistic-outline',
    label: 'Kategoriler',
    link: '/user/category-settings',
  },
  {
    key: 'tenant-settings',
    icon: 'solar:settings-bold',
    label: 'Genel Ayarlar',
    link: '/user/tenant-settings',
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
    key: 'viewer',
    icon: 'solar:user-speak-rounded-bold-duotone',
    label: 'Kullanıcılar',
    collapsed: true,
    subMenu: [
      {
        key: 'viewer-list',
        label: 'Kullanıcı Listesi',
        link: '/user/viewers/list',
        parentKey: 'viewer',
      },
      {
        key: 'viewer-create',
        label: 'Kullanıcı Ekle',
        link: '/user/viewers/add',
        parentKey: 'viewer',
      },
    ],
  },
  // {
  //   key: 'other-apps',
  //   label: 'Diğer Uygulamalar',
  //   isTitle: true,
  // },
  // {
  //   key: 'todo',
  //   icon: 'solar:checklist-bold-duotone',
  //   label: 'Todo',
  //   link: '/user/apps/todo',
  // },
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
  },
    {
    key: 'contact',
    icon: 'solar:call-chat-bold',
    label: 'İletişim',
    link: '/user/contact',
  }
]
