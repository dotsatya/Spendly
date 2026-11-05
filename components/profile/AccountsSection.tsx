import React from 'react';
import ProfileSection from './ProfileSection';
import ProfileRow, { IconName } from './ProfileRow';

interface AccountItem {
  icon: IconName;
  title: string;
  value: string;
}

const DEFAULT_ACCOUNTS: AccountItem[] = [
  { icon: 'cash-outline', title: 'Cash (default)', value: '₹0' },
  { icon: 'shield-outline', title: 'Bank account', value: '₹0' },
];

export default function AccountsSection() {
  return (
    <ProfileSection title="Accounts">
      {DEFAULT_ACCOUNTS.map((a) => (
        <ProfileRow key={a.title} icon={a.icon} title={a.title} value={a.value} />
      ))}
      <ProfileRow icon="add" title="Add account" borderBottom={false} />
    </ProfileSection>
  );
}

