import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css'; // Import Draft.js styles
import MenuTrigger from './MenuTrigger';
import '../App.css';

const DynamicPageEditor = ({ selectedPage, onClose }) => {
  const [id, setId] = useState(null); // Initial id is null for new pages
  const [pageTitle, setPageTitle] = useState('Untitled Page');
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [errorMessage, setErrorMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Function to safely load the content from raw JSON
  const loadEditorContent = (content) => {
    try {
      if (!content || content === "undefined" || typeof content !== 'string') {
        console.warn("No valid content found, loading empty editor state.");
        return EditorState.createEmpty(); // Return empty state if no content is found
      }

      // Parse the raw content from JSON
      const parsedContent = JSON.parse(content);
      
      // Ensure the parsed content has the correct structure (blocks and entityMap)
      if (parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
        const contentState = convertFromRaw(parsedContent); // Convert from raw JSON to content state
        return EditorState.createWithContent(contentState); // Return EditorState
      } else {
        console.warn("Content format is invalid. Resetting editor to empty state.");
        return EditorState.createEmpty();
      }
    } catch (e) {
      console.error("Error parsing content, resetting editor to empty:", e);
      return EditorState.createEmpty(); // In case of error, reset the editor
    }
  };

  // This effect runs when selectedPage changes
  useEffect(() => {
    if (selectedPage && selectedPage.id) {
      console.log("Updating existing page with ID:", selectedPage.id);
      // For existing pages
      setId(selectedPage.id);  // Set ID for updates
      setPageTitle(selectedPage.title || 'Untitled Page');

      // Load content from selected page
      const newEditorState = loadEditorContent(selectedPage.content); // Proper conversion
      setEditorState(newEditorState);
    } else {
      // For new pages
      console.log("Creating new page, resetting ID to null");
      setId(null);  // Reset ID for new page creation
      setPageTitle('Untitled Page');
      setEditorState(EditorState.createEmpty());
    }
  }, [selectedPage]);

  const saveDynamicPageToDatabase = async () => {
    try {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        setErrorMessage('User ID not found. Please log in again.');
        return;
      }

      const contentState = editorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState)); // Keep this as is

      // Prepare data to send to the PHP backend
      const requestData = {
        user_id,
        title: pageTitle.trim(),
        content: rawContent,
      };

      // Insert new page only if id is null (new page creation)
      if (!id) {
        const response = await axios.post('http://localhost:8888/project2025/save_dynamic_page.php', requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          console.log('New Page ID assigned by backend:', response.data.page_id);
          setId(response.data.page_id); // Set the page ID for future updates
        } else {
          setErrorMessage(response.data.message || 'Failed to save page.');
        }
      } else {
        // Update existing page
        requestData.id = id; // Include the page ID to update the same entry
        const response = await axios.post('http://localhost:8888/project2025/save_dynamic_page.php', requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          console.log('Page updated successfully:', response.data);
        } else {
          setErrorMessage(response.data.message || 'Failed to update page.');
        }
      }
    } catch (error) {
      console.error('Error while saving the page:', error);
      setErrorMessage('Error while saving the page.');
    }
  };

  const handleTitleChange = (e) => {
    setPageTitle(e.target.value);
    saveDynamicPageToDatabase(); // Save on title change
  };

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    saveDynamicPageToDatabase(); // Save on editor change
  };

  const handleBlockInsert = (blockType) => {
    let newState;
    if (editorState) {
      switch (blockType) {
        case 'heading-1':
          newState = RichUtils.toggleBlockType(editorState, 'header-one');
          break;
        case 'heading-2':
          newState = RichUtils.toggleBlockType(editorState, 'header-two');
          break;
        case 'quote':
          newState = RichUtils.toggleBlockType(editorState, 'blockquote');
          break;
        case 'bulleted-list':
          newState = RichUtils.toggleBlockType(editorState, 'unordered-list-item');
          break;
        case 'numbered-list':
          newState = RichUtils.toggleBlockType(editorState, 'ordered-list-item');
          break;
        default:
          newState = editorState;
      }
      setEditorState(newState);
      setShowMenu(false);
    }
  };

  return (
    <div className="app-container">
      <div className="center-pane">
        <div className="pane-title-bar">
          <h2>{selectedPage ? selectedPage.title : 'Untitled Page'}</h2>
          {selectedPage && <button className="close-button" onClick={onClose}>×</button>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            type="text"
            className="editable-title"
            value={pageTitle}
            onChange={handleTitleChange}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'left',
              maxWidth: '800px',
              width: '100%',
              margin: '40px 0 20px 0',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#e0e0e0',
              outline: 'none',
              padding: '10px 0',
            }}
            placeholder="Enter the page title..."
          />
          <hr className="divider-line" style={{ width: '800px', margin: '20px 0' }} />
          
          <div style={{ textAlign: 'left', maxWidth: '800px', width: '100%', padding: '10px' }}>
            <Editor
              editorState={editorState}
              onChange={handleEditorChange}
              placeholder="Start editing this content..."
            />
          </div>
        </div>

        <MenuTrigger
          editorState={editorState}
          setEditorState={setEditorState}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          menuPosition={menuPosition}
          setMenuPosition={setMenuPosition}
          handleBlockInsert={handleBlockInsert}
        />
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default DynamicPageEditor;
