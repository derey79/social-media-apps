'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3 } from 'lucide-react';

interface PublicProfileTabsProps {
  username: string;
}

export default function PublicProfileTabs({
  username,
}: PublicProfileTabsProps) {
  return (
    <Tabs defaultValue='user-posts' className='w-full'>
      <TabsList className='w-full justify-start bg-transparent border-b border-[#181D27] rounded-none p-0 h-auto gap-8'>
        <TabsTrigger
          value='user-posts'
          className='data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none bg-transparent p-0 pb-3 text-sm font-semibold text-neutral-400 border-b-2 border-transparent transition-all flex items-center gap-2'
        >
          <Grid3X3 className='h-4 w-4' />
          <span>Posts</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value='user-posts'
        className='pt-12 text-center focus-visible:outline-none'
      >
        <p className='text-sm text-neutral-400 tracking-wide font-medium'>
          {`@${username} hasn't posted anything yet.`}
        </p>
      </TabsContent>
    </Tabs>
  );
}
