import { useState } from 'react';
import './SharedNavigation.css';

const SharedNavigation = ({
  activeTab,
  onTabChange,
  searchExpanded,
  onSearchToggle,
  searchInput,
  onSearchChange,
  searchSuggestions,
  showSuggestions,
  onSuggestionClick,
  filtersOpen,
  onFiltersToggle,
  filters,
  onFiltersChange,
  onResetFilters,
  user,
  token
}) => {
  const [localSearchInput, setLocalSearchInput] = useState(searchInput);

  // Update local state when prop changes
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchInput(value);
    onSearchChange(value);
  };

  // Handle search suggestion click
  const handleSuggestionClick = (suggestion) => {
    setLocalSearchInput(suggestion.title);
    onSuggestionClick(suggestion);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  return (
    <>
      {/* Sticky Navigation Bar */}
      <nav className="sticky-nav">
        <div className="nav-buttons">
          <button
            className={activeTab === 'media' ? 'active' : ''}
            onClick={() => onTabChange('media')}
            title="Media Feed"
          >
            Media
          </button>
          {token && (
            <button
              className={activeTab === 'upload' ? 'active' : ''}
              onClick={() => onTabChange('upload')}
              title="Upload Media"
            >
              Upload
            </button>
          )}
          {token && (
            <button
              className={activeTab === 'my' ? 'active' : ''}
              onClick={() => onTabChange('my')}
              title="My Media"
            >
              My Media
            </button>
          )}
        </div>
        <div className="nav-actions">
          <button
            className="search-toggle"
            onClick={onSearchToggle}
            title="Search"
            aria-expanded={searchExpanded}
          >
            🔍
          </button>
          <button
            className={`filters-toggle ${filtersOpen ? 'active' : ''}`}
            onClick={onFiltersToggle}
            title="Filters"
            aria-expanded={filtersOpen}
          >
            🔽
          </button>
        </div>
      </nav>

      {/* Expandable Search Bar */}
      {searchExpanded && (
        <div className="search-overlay">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search media..."
              value={localSearchInput}
              onChange={handleSearchInputChange}
              onFocus={() => localSearchInput.length >= 2 && showSuggestions}
              onBlur={() => setTimeout(() => {}, 200)} // Delay to allow suggestion clicks
              className="search-input"
              aria-label="Search media"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions" role="listbox">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="search-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }
                    }}
                  >
                    {suggestion.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters Dropdown */}
      {filtersOpen && (
        <div className="filters-dropdown" role="dialog" aria-labelledby="filters-title">
          <div className="filters-content">
            <h3 id="filters-title">Filters</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="genre-filter">Genre</label>
                <select
                  id="genre-filter"
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  value={filters.genre || ''}
                >
                  <option value="">All</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="electronic">Electronic</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="country">Country</option>
                  <option value="reggae">Reggae</option>
                  <option value="blues">Blues</option>
                  <option value="folk">Folk</option>
                  <option value="rnb">R&B</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="artist-filter">Artist</label>
                <input
                  id="artist-filter"
                  type="text"
                  placeholder="Artist name"
                  onChange={(e) => handleFilterChange('artist', e.target.value)}
                  value={filters.artist || ''}
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="date-filter">Date Added</label>
                <select
                  id="date-filter"
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  value={filters.date || ''}
                >
                  <option value="">All</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="duration-filter">Media Length</label>
                <select
                  id="duration-filter"
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  value={filters.duration || ''}
                >
                  <option value="">All</option>
                  <option value="short">Short (0-2 min)</option>
                  <option value="medium">Medium (2-10 min)</option>
                  <option value="long">Long (10+ min)</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="popularity-filter">Popularity</label>
                <select
                  id="popularity-filter"
                  onChange={(e) => handleFilterChange('popularity', e.target.value)}
                  value={filters.popularity || ''}
                >
                  <option value="">All</option>
                  <option value="trending">Trending</option>
                  <option value="popular">Popular</option>
                  <option value="new">New Releases</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="media-type-filter">Media Type</label>
                <select
                  id="media-type-filter"
                  onChange={(e) => handleFilterChange('media_type', e.target.value)}
                  value={filters.media_type || ''}
                >
                  <option value="">All</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>
              
              <div className="reset-container">
                <button 
                  onClick={onResetFilters} 
                  className="reset-filters"
                  type="button"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SharedNavigation;