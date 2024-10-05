import React, { useState, useEffect } from 'react';
import { AiOutlineSend } from 'react-icons/ai'; 
import { MdDeleteOutline } from 'react-icons/md'; // Import the delete icon
import axios from 'axios'; 
import '../App.css'; // Make sure to import the CSS file for styling
import HashtagInput from './HashtagInput'; // Import the HashtagInput component

const IdeaCapture = ({ userId = 1 }) => { // Default userId = 1 for testing
  const [ideas, setIdeas] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showHashtagInput, setShowHashtagInput] = useState(false); // Track if hashtag is triggered
  const [hashtagQuery, setHashtagQuery] = useState(''); // To hold the current hashtag query

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await axios.get('http://localhost:8888/project2025/get_user_ideas.php', {
          params: { user_id: userId }
        });
        if (response.data.success) {
          setIdeas(response.data.ideas);
        } else {
          setErrorMessage('Failed to load ideas.');
        }
      } catch (error) {
        console.error('Error loading ideas:', error);
        setErrorMessage('Error while loading ideas.');
      }
    };

    fetchIdeas();
  }, [userId]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    const hashtagIndex = value.lastIndexOf('#');
    if (hashtagIndex >= 0) {
      const hashtagText = value.slice(hashtagIndex + 1);
      setHashtagQuery(hashtagText);
      setShowHashtagInput(true);
    } else {
      setShowHashtagInput(false);
    }
  };

  const insertHashtagInInput = (hashtag) => {
    const hashtagIndex = inputValue.lastIndexOf('#');
    const updatedValue = inputValue.slice(0, hashtagIndex) + `#${hashtag} `;
    setInputValue(updatedValue);
    setShowHashtagInput(false);
  };

  const extractHashtags = (text) => {
    const hashtags = text.match(/#[a-z0-9_]+/gi);
    return hashtags ? hashtags.join(', ') : '';
  };

  const sendIdeaToDatabase = async (idea) => {
    const hashtags = extractHashtags(idea);
    try {
      const response = await axios.post('http://localhost:8888/project2025/capture_idea.php', {
        message: idea,
        hashtags: hashtags, 
        user_id: userId
      });

      if (response.data.success) {
        setSuccessMessage('Idea saved successfully!');
        setIdeas([...ideas, { idea, created_at: new Date().toISOString() }]);
        setErrorMessage('');
      } else {
        setErrorMessage(response.data.message || 'Failed to save idea.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error saving idea:', error);
      setErrorMessage('Error while saving the idea.');
      setSuccessMessage('');
    }
  };

  const sendIdea = () => {
    const trimmedIdea = inputValue.trim();
    if (trimmedIdea !== '') {
      setIdeas([...ideas, { idea: trimmedIdea, created_at: new Date().toISOString() }]);
      sendIdeaToDatabase(trimmedIdea);
      setInputValue('');
      setShowHashtagInput(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendIdea();
    }
  };

  const renderIdeaWithHashtags = (idea) => {
    const parts = idea.split(/(#\w+)/g);
    return parts.map((part, index) => 
      part.startsWith('#') ? (
        <span 
          key={index} 
          className="hashtag" 
          onClick={() => handleHashtagClick(part)} 
          style={{ cursor: 'pointer', color: 'pink', textDecoration: 'underline' }}
        >
          {part}
        </span>
      ) : part
    );
  };

  const handleHashtagClick = async (hashtag) => {
    const response = await axios.get('http://localhost:8888/project2025/get_ideas_by_hashtag.php', {
      params: { hashtag: hashtag }
    });

    if (response.data.success) {
      setIdeas(response.data.ideas);
    } else {
      console.error('Failed to fetch ideas for the hashtag:', response.data.message);
    }
  };

  const deleteIdea = async (ideaId) => {
    if (window.confirm('Do you really want to delete this Idea Capture?')) {
      try {
        const response = await axios.post('http://localhost:8888/project2025/delete_idea.php', {
          user_id: userId,
          id: ideaId
        });

        if (response.data.success) {
          setIdeas(ideas.filter((i) => i.id !== ideaId));
          setSuccessMessage('Idea deleted successfully!');
        } else {
          setErrorMessage(response.data.message || 'Failed to delete idea.');
        }
      } catch (error) {
        console.error('Error deleting idea:', error);
        setErrorMessage('Error while deleting the idea.');
      }
    }
  };

  return (
    <div className="idea-capture full-height">
      <div className="chat-body">
        {ideas.map((idea, index) => (
          <div 
            key={index} 
            className="message fade-in" 
            style={{ position: 'relative' }}
            onMouseEnter={(e) => {
              const deleteIcon = e.currentTarget.querySelector('.delete-icon');
              if (deleteIcon) deleteIcon.style.display = 'block';
            }}
            onMouseLeave={(e) => {
              const deleteIcon = e.currentTarget.querySelector('.delete-icon');
              if (deleteIcon) deleteIcon.style.display = 'none';
            }}
          >
            <div className="message-text">{renderIdeaWithHashtags(idea.idea)}</div>
            <div className="message-timestamp">{new Date(idea.created_at).toLocaleString()}</div>
            <MdDeleteOutline 
              className="delete-icon" 
              onClick={() => deleteIdea(idea.id)}
              style={{ 
                position: 'absolute', 
                left: '0px', 
                top: '10px', 
                cursor: 'pointer',
                color: 'white',
                display: 'none'
              }} 
            />
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your idea..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="input-field"
        />

        {showHashtagInput && (
          <HashtagInput query={hashtagQuery} onHashtagSelect={insertHashtagInInput} />
        )}

        <button onClick={sendIdea} className="send-button">
          <AiOutlineSend />
        </button>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default IdeaCapture;
