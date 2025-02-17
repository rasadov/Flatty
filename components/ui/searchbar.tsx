import React, { useState } from 'react';
import Button from './button';

interface SearchbarProps {
  onSearch: (query: string) => void;
}

const Searchbar: React.FC<SearchbarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for properties..."
        className="flex-grow px-4 py-2 border rounded-lg focus:outline-none"
      />
      <Button variant="secondary" onClick={handleSearch}>
        Search
      </Button>
    </div>
  );
};

export default Searchbar; 
