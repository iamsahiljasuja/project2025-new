import React, { useEffect, useState } from 'react';
import { EditorState, Modifier } from 'draft-js';

const MenuTrigger = ({ editorState, setEditorState, showMenu, setShowMenu, menuPosition, setMenuPosition, handleBlockInsert }) => {
  const [typedText, setTypedText] = useState(''); // Track what's typed after '/'
  const [isToggleOpen, setIsToggleOpen] = useState(true); // State for collapsible item

  const blockOptions = [
    'Text Block',
    'Heading 1',
    'Heading 2',
    'Heading 3',
    'Bulleted List',
    'Numbered List',
    'Quote',
    'Divider',
    'Callout',
    'Code Block',
    'Image',
    'Video',
    'Audio',
    'Toggle List', // Collapsible item added here
  ];

  // Filter block options based on typedText
  const filteredOptions = blockOptions.filter(option => option.toLowerCase().includes(typedText.toLowerCase()));

  const handleKeyDown = (e) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (e.key === '/') {
      setTypedText(''); // Reset typed text when `/` is pressed
      setShowMenu(true);

      // Set menu position where the caret is
      setMenuPosition({
        top: rect.top + window.scrollY + 25, // Slightly below the cursor
        left: rect.left + window.scrollX,
      });
    } else if (e.key === ' ') {
      setShowMenu(false); // Close menu if space is pressed
    } else if (showMenu) {
      // Add the character to the typed text
      setTypedText(prev => prev + e.key);
    }
  };

  const handleBlockSelect = (blockType) => {
    setShowMenu(false);
    setTypedText(''); // Reset typed text

    if (handleBlockInsert) {
      handleBlockInsert(blockType.replace(' ', '-').toLowerCase());
    }
  };

  const handleToggleList = () => {
    setIsToggleOpen(!isToggleOpen); // Toggle the collapsible state
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const toggleList = `\n🔽 Toggle List (click to expand)\n`;
    
    const contentStateWithToggle = Modifier.insertText(contentState, selectionState, toggleList);
    const newEditorState = EditorState.push(editorState, contentStateWithToggle, 'insert-characters');

    setEditorState(newEditorState);

    // Optionally, move caret to the next line or let it remain within the toggle item.
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu]);

  return showMenu ? (
    <div className="block-options" style={{ top: menuPosition.top, left: menuPosition.left, position: 'absolute' }}>
      {filteredOptions.map((option, index) => (
        <div
          key={index}
          className="block-option"
          onClick={() => {
            if (option === 'Toggle List') {
              handleToggleList(); // Call handleToggleList for Toggle List
            } else {
              handleBlockSelect(option.replace(' ', '-').toLowerCase());
            }
          }}
        >
          {option}
        </div>
      ))}
    </div>
  ) : null;
};

export default MenuTrigger;
