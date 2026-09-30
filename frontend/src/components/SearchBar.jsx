import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ onSearch, placeholder = 'Search movies...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      onSearch('');
    }
  };

  return (
    <form className="clay-search" onSubmit={handleSubmit}>
      <FiSearch className="text-gray-500 text-[1.1rem] shrink-0" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <button type="submit">Search</button>
    </form>
  );
}
