import React from 'react';

const RightPane = ({ selectedItem, componentMap, onClose }) => {
  const renderContent = () => {
    if (!selectedItem) {
      return <div>No content selected for the right pane.</div>;
    }

    // Check if the selected item is a predefined component
    const SelectedComponent = componentMap[selectedItem.content];

    if (SelectedComponent) {
      // Render the predefined component
      return <SelectedComponent />;
    } else if (selectedItem.content) {
      // Render the dynamic content if it's not a predefined component
      return (
        <div>
          <h3>{selectedItem.title}</h3>
          <p>{selectedItem.content}</p> {/* Render dynamic page content */}
        </div>
      );
    } else {
      return <div>No content available.</div>;
    }
  };

  return (
    <div className="right-pane">
      <div className="pane-title-bar">
        <h2>{selectedItem ? selectedItem.title : 'Right Pane'}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="pane-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default RightPane;