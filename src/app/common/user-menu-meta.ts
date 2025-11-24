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
    label: 'GENERAL',
    isTitle: true,
  },
  {
    key: 'dashboards',
    icon: 'solar:widget-5-bold-duotone',
    label: 'Dashboard',
    link:'/index'
  },
  {
    key: 'settings',
    icon: 'solar:settings-bold-duotone',
    label: 'Settings',
    link: '/pages/settings',
  },
  {
    key: 'users',
    label: 'Users',
    isTitle: true,
  },
  {
    key: 'profile',
    icon: 'solar:chat-square-like-bold-duotone',
    label: 'Profile',
    link: '/pages/profile',
  },
  {
    key: 'role',
    icon: 'solar:user-speak-rounded-bold-duotone',
    label: 'Roles',
    collapsed: true,
    subMenu: [
      {
        key: 'role-list',
        label: 'List',
        link: '/role/list',
        parentKey: 'role',
      },
      {
        key: 'role-edit',
        label: 'Edit',
        link: '/role/edit',
        parentKey: 'role',
      },
      {
        key: 'role-create',
        label: 'Create',
        link: '/role/add',
        parentKey: 'role',
      },
    ],
  },
  {
    key: 'customer',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    label: 'Customers',
    collapsed: true,
    subMenu: [
      {
        key: 'customer-list',
        label: 'List',
        link: '/customer/list',
        parentKey: 'customer',
      },
      {
        key: 'customer-details',
        label: 'Details',
        link: '/customer/detail',
        parentKey: 'customer',
      }
    ],
  },

  {
    key: 'other-apps',
    label: 'Other Apps',
    isTitle: true,
  },
  {
    key: 'todo',
    icon: 'solar:checklist-bold-duotone',
    label: 'Todo',
    link: '/apps/todo',
  },
  {
    key: 'support',
    label: 'Support',
    isTitle: true,
  },
  {
    key: 'help-center',
    icon: 'solar:help-bold-duotone',
    label: 'Help Center',
    link: '/pages/help-center',
  },
  {
    key: 'faqs',
    icon: 'solar:question-circle-bold-duotone',
    label: 'FAQs',
    link: '/pages/faqs',
  }
]
