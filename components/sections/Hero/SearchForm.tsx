import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';

const SearchForm = () => {
  return (
    <div className="flex-1">
      <form className="relative">
        <Input
          type="text"
          placeholder="Small 2-storey villa by the sea with an open bath"
          className="w-full pl-12 pr-4 py-3 rounded-lg"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </form>
    </div>
  );
};

export default SearchForm; 