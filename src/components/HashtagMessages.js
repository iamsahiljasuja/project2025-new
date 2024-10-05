import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HashtagMessages = () => {
  const [hashtags, setHashtags] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedHashtag, setSelectedHashtag] = useState(null);

  // Fetch all hashtags and their counts when the component loads
  useEffect(() => {
    const fetchHashtags = async () => {
      try {
        const response = await axios.get('http://localhost:8888/project2025/fetch_all_hashtag_messages.php');
        if (response.data.success) {
          setHashtags(response.data.messages); // All hashtags and counts
        } else {
          console.error('Failed to fetch hashtags');
        }
      } catch (error) {
        console.error('Error fetching hashtags:', error);
      }
    };

    fetchHashtags();
  }, []);

  // Fetch messages by hashtag when a hashtag is clicked
  const fetchMessagesByHashtag = async (hashtag) => {
  try {
    const response = await axios.get(`http://localhost:8888/project2025/fetch_messages_by_hashtag.php`, {
      params: { hashtag }
    });
    if (response.data.success) {
      setMessages(response.data.messages);
    } else {
      console.error('Failed to fetch messages for the hashtag');
    }
  } catch (error) {
    console.error('Error fetching messages by hashtag:', error);
  }
};
  return (
    <div>
      <h2>Hashtag Messages</h2>

      {/* Show all hashtags and their counts */}
      {hashtags.length > 0 ? (
        <ul>
          {hashtags.map((hashtagData) => (
            <li 
              key={hashtagData.hashtag} 
              onClick={() => fetchMessagesByHashtag(hashtagData.hashtag)} // Fetch messages when hashtag is clicked
              style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} // Make hashtag clickable
            >
              <strong>#{hashtagData.hashtag}</strong> - {hashtagData.count} mentions
            </li>
          ))}
        </ul>
      ) : (
        <p>No hashtags found.</p>
      )}

      {/* Show messages associated with the selected hashtag */}
      {selectedHashtag && (
        <>
          <h3>Messages for #{selectedHashtag}</h3>
          {messages.length > 0 ? (
            <ul>
              {messages.map((message) => (
                <li key={message.id}>
                  <p><strong>Content:</strong> {message.content_text}</p>
                  <p><strong>Posted on:</strong> {new Date(message.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No messages found for #{selectedHashtag}</p>
          )}
        </>
      )}
    </div>
  );
};

export default HashtagMessages;
