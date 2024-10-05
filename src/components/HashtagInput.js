import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HashtagInput = ({ query, onHashtagSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [exactMatch, setExactMatch] = useState(false);

  useEffect(() => {
    const fetchHashtagSuggestions = async () => {
      try {
        const response = await axios.get('http://localhost:8888/project2025/pophashtagwindow.php', {
          params: { query }
        });
        if (response.data.success) {
          const hashtags = response.data.hashtags.map((h) => h.hashtag);

          // Check if there's an exact match in the fetched hashtags
          const exactMatchFound = hashtags.includes(query);
          setExactMatch(exactMatchFound);

          setSuggestions(hashtags);
        }
      } catch (error) {
        console.error('Error fetching hashtag suggestions:', error);
      }
    };

    if (query.length > 0) {
      fetchHashtagSuggestions();
    } else {
      setSuggestions([]); // Clear suggestions if query is empty
    }
  }, [query]);

  const handleCreateNewTag = async () => {
    try {
      await axios.post('http://localhost:8888/project2025/create_new_hashtag_from_pop_window.php', {
        hashtag: query
      });
      onHashtagSelect(query); // Add the new tag to the chat box
    } catch (error) {
      console.error('Error creating new hashtag:', error);
    }
  };

  return (
    <div className="hashtag-suggestions">
      {suggestions.length > 0 && (
        <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
          {suggestions.map((hashtag, index) => (
            <li
              key={index}
              onClick={() => onHashtagSelect(hashtag)} // Add selected hashtag to input
              style={{
                padding: '5px',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4e4e4e'; // Highlight background on hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'; // Remove background highlight
              }}
            >
              #{hashtag}
            </li>
          ))}
        </ul>
      )}

      {/* Show 'Create new tag' only if there's no exact match */}
      {!exactMatch && query.length > 0 && (
        <div className="create-new-tag" onClick={handleCreateNewTag} style={{
          padding: '5px',
          cursor: 'pointer',
          borderRadius: '5px',
          backgroundColor: '#4e4e4e', // Highlight background for 'Create new tag'
          marginTop: '5px'
        }}>
          <p>Create new tag: #{query}</p>
        </div>
      )}
    </div>
  );
};

export default HashtagInput;
