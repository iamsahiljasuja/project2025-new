// src/components/ExampleMenu.js
import React, { useState } from 'react';
import Icon from './Icon';
import RightPane from './RightPane';

const ExampleMenu = () => {
  const [isRightPaneOpen, setRightPaneOpen] = useState(false);

  const handleIconClick = () => {
    setRightPaneOpen(true); // Opens the right pane
  };

  const handleClosePane = () => {
    setRightPaneOpen(false); // Closes the right pane
  };

  return (
    <div>
      <nav className="menu">
        <Icon onClick={handleIconClick} />
        {/* Other menu items */}
      </nav>
      {isRightPaneOpen && <RightPane onClose={handleClosePane} />}
    </div>
  );
};

export default ExampleMenu;
