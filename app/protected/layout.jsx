'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SelectedTableContext } from '../../contexts/SelectedTableContext';
import { Avatar } from '@/components/avatar';
import Image from 'next/image';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar';
import { SidebarLayout } from '@/components/sidebar-layout';
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid';
import {
  Cog6ToothIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
  UserIcon as UserIcon20,
} from '@heroicons/react/20/solid';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const Example = ({ children }) => {
  const { selectedTable, setSelectedTable } = useContext(SelectedTableContext);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Initialize Supabase client using useMemo to prevent multiple instances
  const supabase = useMemo(() => createClient(), []);

  // Fetch user data on component mount and subscribe to auth state changes
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data.user);
      }
    };

    fetchUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Sign out handler
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      router.push('/sign-in');
    }
  };

  // Function to determine if a table is active
  const isActive = (table) => selectedTable === table;

  // Define active and inactive class names
  const activeClass = 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-md';
  const inactiveClass = 'text-gray-600 dark:text-gray-00 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md';

  // Define non-clickable class
  const nonClickableClass = 'text-gray-600 dark:text-gray-400 cursor-default rounded-md';

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            {/* Search - Non-clickable */}
            <NavbarItem
              aria-label="Search"
              className={nonClickableClass + ' flex items-center'}
              // Removed href to make it non-clickable
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </NavbarItem>
            {/* Home - Non-clickable */}
            <NavbarItem
              aria-label="Home"
              className={nonClickableClass + ' flex items-center'}
              // Removed href to make it non-clickable
            >
              <HomeIcon className="h-5 w-5" />
            </NavbarItem>
            {/* Profile Dropdown */}
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src={user?.user_metadata?.avatar_url || '/snowma.jpeg'} square />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                {/* My profile - Non-clickable */}
                <DropdownItem
                  // Removed href to make it non-clickable
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center cursor-default"
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                {/* Settings - Non-clickable */}
                <DropdownItem
                  // Removed href to make it non-clickable
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center cursor-default"
                >
                  <Cog8ToothIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                {/* Privacy Policy - Non-clickable */}
                <DropdownItem
                  // Removed href to make it non-clickable
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center cursor-default"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                {/* Share Feedback - Non-clickable */}
                <DropdownItem
                  // Removed href to make it non-clickable
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center cursor-default"
                >
                  <LightBulbIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                {/* Sign out - Remains clickable */}
                <DropdownItem onClick={handleSignOut} className="flex items-center cursor-pointer">
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            {/* Team Dropdown */}
            <Dropdown>
              <DropdownButton as={SidebarItem} className="lg:mb-2.5 flex items-center">
                <Avatar src="/snowma.jpeg" />
                <SidebarLabel className="ml-2">Tailwind Labs</SidebarLabel>
                <ChevronDownIcon className="h-4 w-4 ml-auto" />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem href="/teams/1/settings" className="flex items-center">
                  <Cog8ToothIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/teams/1" className="flex items-center">
                  <Avatar slot="icon" src="/snowma.jpeg" />
                  <DropdownLabel className="ml-2">Tailwind Labs</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/teams/create" className="flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>New team&hellip;</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <SidebarSection>
              {/* Search - Non-clickable */}
              <SidebarItem
                className={`flex items-center ${nonClickableClass}`}
                // Removed href to make it non-clickable
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                <SidebarLabel>Search</SidebarLabel>
              </SidebarItem>
              {/* Removed Inbox, Settings, Broadcast from the top section */}
            </SidebarSection>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              {/* Database Options: APO, PDL, USA, OTC */}
              <SidebarItem
                onClick={() => setSelectedTable('apo')}
                className={`flex items-center cursor-pointer ${
                  isActive('apo') ? activeClass : inactiveClass
                }`}
              >
                <Square2StackIcon className="h-5 w-5 mr-2" />
                <SidebarLabel>APO</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                onClick={() => setSelectedTable('pdl')}
                className={`flex items-center cursor-pointer ${
                  isActive('pdl') ? activeClass : inactiveClass
                }`}
              >
                <Square2StackIcon className="h-5 w-5 mr-2" />
                <SidebarLabel>PDL</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                onClick={() => setSelectedTable('usa')}
                className={`flex items-center cursor-pointer ${
                  isActive('usa') ? activeClass : inactiveClass
                }`}
              >
                <Square2StackIcon className="h-5 w-5 mr-2" />
                <SidebarLabel>USA</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                onClick={() => setSelectedTable('otc')}
                className={`flex items-center cursor-pointer ${
                  isActive('otc') ? activeClass : inactiveClass
                }`}
              >
                <Square2StackIcon className="h-5 w-5 mr-2" />
                <SidebarLabel>OTC</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarSpacer />
            <SidebarSection>
              {/* Support - Non-clickable */}
              <SidebarItem
                className={`flex items-center ${nonClickableClass}`}
                // Removed href to make it non-clickable
              >
                <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarItem>
              {/* Changelog - Non-clickable */}
              <SidebarItem
                className={`flex items-center ${nonClickableClass}`}
                // Removed href to make it non-clickable
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
          <SidebarFooter className="max-lg:hidden">
            {/* Expandable User Menu */}
            <Dropdown>
              <DropdownButton as={SidebarItem} className="flex items-center">
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={user?.user_metadata?.avatar_url || '/snowma.jpeg'}
                    className="size-10"
                    square
                    alt="Profile"
                  />
                  <span className="flex flex-col ml-2">
                    <span className="block truncate text-sm font-medium text-zinc-950 dark:text-white">
                      {user?.user_metadata?.full_name || 'User'}
                    </span>
                    <span className="block truncate text-xs font-normal text-zinc-500 dark:text-zinc-400">
                      {user?.email || 'monkey@example.com'}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon className="h-4 w-4 ml-auto" />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="top start">
                {/* My profile - Non-clickable */}
                <DropdownItem
                  // Removed href to make it non-clickable
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center cursor-default"
                >
                  <UserIcon20 className="h-5 w-5 mr-2" />
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                {/* Settings - Non-clickable */}
                <DropdownItem
                  // Removed href to make it non-clickable
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center cursor-default"
                >
                  <Cog8ToothIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                {/* Privacy Policy - Non-clickable */}
                <DropdownItem
                  // Removed href to make it non-clickable
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center cursor-default"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                {/* Share Feedback - Non-clickable */}
                <DropdownItem
                  // Removed href to make it non-clickable
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center cursor-default"
                >
                  <LightBulbIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                {/* Sign out - Remains clickable */}
                <DropdownItem onClick={handleSignOut} className="flex items-center cursor-pointer">
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
};

export default Example;
